from app.db.models import Document, User


def _document(db, user_id=1, filename="contract.txt"):
    document = Document(
        user_id=user_id,
        doc_id=f"doc-{filename}",
        filename=filename,
        status="ready",
        chunk_count=10,
        entity_count=4,
        relationship_count=2,
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


def test_collection_crud_and_membership(client, db_session):
    doc = _document(db_session)

    created = client.post(
        "/api/collections",
        json={"name": "2024 Contracts", "description": "Active deals"},
    )
    assert created.status_code == 201
    body = created.json()
    collection_id = body["id"]
    assert body["name"] == "2024 Contracts"
    assert body["document_count"] == 0

    duplicate = client.post("/api/collections", json={"name": "2024 contracts"})
    assert duplicate.status_code == 409

    listed = client.get("/api/collections")
    assert listed.status_code == 200
    assert [c["id"] for c in listed.json()] == [collection_id]

    added = client.post(
        f"/api/collections/{collection_id}/documents",
        json={"document_id": doc.id},
    )
    assert added.status_code == 200
    assert added.json()["document_count"] == 1
    assert added.json()["documents"][0]["filename"] == "contract.txt"

    renamed = client.patch(
        f"/api/collections/{collection_id}",
        json={"name": "Signed Contracts", "description": "Updated"},
    )
    assert renamed.status_code == 200
    assert renamed.json()["name"] == "Signed Contracts"

    removed = client.delete(
        f"/api/collections/{collection_id}/documents/{doc.id}"
    )
    assert removed.status_code == 200
    assert removed.json()["document_count"] == 0

    deleted = client.delete(f"/api/collections/{collection_id}")
    assert deleted.status_code == 204
    assert client.get("/api/collections").json() == []


def test_collection_name_validation(client):
    assert client.post("/api/collections", json={"name": "   "}).status_code == 422


def test_collection_is_user_scoped(client, db_session):
    created = client.post("/api/collections", json={"name": "Private"})
    collection_id = created.json()["id"]

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

    assert client.get("/api/collections").json() == []
    assert client.get(f"/api/collections/{collection_id}").status_code == 404
    assert (
        client.patch(
            f"/api/collections/{collection_id}", json={"name": "Hijacked"}
        ).status_code
        == 404
    )
    assert client.delete(f"/api/collections/{collection_id}").status_code == 404


def test_cannot_add_another_users_document(client, db_session):
    created = client.post("/api/collections", json={"name": "Mine"})
    collection_id = created.json()["id"]

    other = User(
        id=2,
        name="Other",
        email="other@example.com",
        password_hash="hash",
        is_verified=True,
    )
    db_session.add(other)
    db_session.commit()
    other_doc = _document(db_session, user_id=2, filename="theirs.txt")

    response = client.post(
        f"/api/collections/{collection_id}/documents",
        json={"document_id": other_doc.id},
    )
    assert response.status_code == 404
