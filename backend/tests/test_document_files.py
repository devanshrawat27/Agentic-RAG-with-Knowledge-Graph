from types import SimpleNamespace

from app.core import storage
from app.db.models import Document, User


def test_storage_saves_and_resolves_files(monkeypatch, tmp_path):
    monkeypatch.setattr(
        storage, "get_settings", lambda: SimpleNamespace(storage_path=tmp_path)
    )

    relative = storage.save_document_file(1, "d1", ".txt", b"hello")
    path = tmp_path / "1" / "d1.txt"

    assert relative == "1/d1.txt"
    assert path.read_bytes() == b"hello"
    assert storage.resolve_document_file(relative) == path.resolve()
    assert storage.resolve_document_file("../outside.txt") is None

    storage.delete_document_file(relative)
    assert not path.exists()


def test_storage_mime_and_invalid_suffix(monkeypatch, tmp_path):
    monkeypatch.setattr(
        storage, "get_settings", lambda: SimpleNamespace(storage_path=tmp_path)
    )

    relative = storage.save_document_file(1, "d2", "..", b"x")
    assert relative == "1/d2"
    assert storage.mime_for_suffix(".pdf") == "application/pdf"
    assert storage.mime_for_suffix(".unknown") == "application/octet-stream"


def _document(db, **overrides):
    values = {
        "user_id": 1,
        "doc_id": "d1",
        "filename": "contract.txt",
        "status": "ready",
        "chunk_count": 1,
        "file_path": "1/d1.txt",
        "mime_type": "text/plain",
        "file_size": 5,
    }
    values.update(overrides)
    document = Document(**values)
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


def test_document_meta_and_file_preview(client, db_session, monkeypatch, tmp_path):
    _document(db_session)

    meta = client.get("/api/documents/by-doc/d1")
    assert meta.status_code == 200
    assert meta.json()["has_file"] is True
    assert meta.json()["mime_type"] == "text/plain"

    path = tmp_path / "d1.txt"
    path.write_bytes(b"hello")
    monkeypatch.setattr(
        "app.api.routes.documents.resolve_document_file", lambda _: path
    )

    file_response = client.get("/api/documents/by-doc/d1/file")
    assert file_response.status_code == 200
    assert file_response.content == b"hello"


def test_document_file_404_when_missing(client, db_session):
    _document(db_session, file_path=None)
    assert client.get("/api/documents/by-doc/d1/file").status_code == 404


def test_document_endpoints_are_user_scoped(client, db_session, monkeypatch):
    _document(db_session)
    monkeypatch.setattr(
        "app.api.routes.documents.resolve_document_file", lambda _: None
    )

    other = User(
        id=2,
        name="Other",
        email="other@example.com",
        password_hash="hash",
        is_verified=True,
    )
    db_session.add(other)
    db_session.commit()

    from app.api.deps import get_current_user
    from app.main import app

    app.dependency_overrides[get_current_user] = lambda: other

    assert client.get("/api/documents/by-doc/d1").status_code == 404
    assert client.get("/api/documents/by-doc/d1/file").status_code == 404
    assert client.get("/api/documents/by-doc/d1/chunks").status_code == 404


def test_document_chunks_endpoint(client, db_session, monkeypatch):
    _document(db_session)
    monkeypatch.setattr(
        "app.api.routes.documents.get_document_chunks",
        lambda user_id, doc_id: [
            {
                "chunk_id": f"{doc_id}:0",
                "chunk_index": 0,
                "doc_id": doc_id,
                "filename": "contract.txt",
                "text": "hello",
                "is_focus": False,
            }
        ],
    )

    response = client.get("/api/documents/by-doc/d1/chunks")
    assert response.status_code == 200
    assert response.json()["chunks"][0]["text"] == "hello"
