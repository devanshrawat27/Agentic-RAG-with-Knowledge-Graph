import json

from sqlalchemy import select

from app.api.deps import get_current_user
from app.db.models import Collection, Document, Message, User
from app.main import app

VERIFIED_STATE = {
    "final_answer": "Acme Corp breached clause 4.2 in 2024 [1].",
    "citations": [
        {
            "index": 1,
            "doc_id": "doc-1",
            "chunk_id": "doc-1:0",
            "filename": "acme.pdf",
            "snippet": "Acme Corp breached clause 4.2 in 2024.",
            "score": 0.9,
        }
    ],
    "claims": [
        {
            "text": "Acme Corp breached clause 4.2 in 2024.",
            "supported": True,
            "evidence_refs": [1],
            "reason": "exact",
        }
    ],
    "sub_questions": ["Who breached clause 4.2?"],
    "loop_count": 1,
}

BASELINE_RESULT = {
    "answer": "baseline answer",
    "citations": [],
    "mode": "baseline",
    "evidence": [],
}


def _collection(db, name="Scope", doc_ids=("d1",), user_id=1):
    collection = Collection(user_id=user_id, name=name, description="")
    for doc_id in doc_ids:
        collection.documents.append(
            Document(
                user_id=user_id,
                doc_id=doc_id,
                filename=f"{doc_id}.txt",
                status="ready",
                chunk_count=3,
            )
        )
    db.add(collection)
    db.commit()
    db.refresh(collection)
    return collection


def test_baseline_mode_is_default(client, monkeypatch):
    monkeypatch.setattr(
        "app.api.routes.chat.answer_baseline", lambda *a, **k: BASELINE_RESULT
    )

    response = client.post("/api/chat", json={"question": "Any question?"})

    assert response.status_code == 200
    body = response.json()
    assert body["mode"] == "baseline"
    assert body["claims"] == []
    assert body["loop_count"] == 0


def test_verified_mode_returns_claims_and_persists(client, db_session, monkeypatch):
    monkeypatch.setattr(
        "app.api.routes.chat.run_pipeline", lambda *a, **k: VERIFIED_STATE
    )

    response = client.post(
        "/api/chat",
        json={"question": "Who breached clause 4.2?", "mode": "verified"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["answer"] == VERIFIED_STATE["final_answer"]
    assert body["mode"] == "verified"
    assert body["claims"][0]["supported"] is True
    assert body["citations"][0]["doc_id"] == "doc-1"
    assert body["loop_count"] == 1

    rows = db_session.scalars(select(Message).order_by(Message.id)).all()
    assert [row.role for row in rows] == ["user", "assistant"]
    assert rows[0].content == "Who breached clause 4.2?"
    assert rows[1].content == VERIFIED_STATE["final_answer"]
    assert json.loads(rows[1].citations_json)[0]["chunk_id"] == "doc-1:0"


def test_verified_smalltalk_bypasses_pipeline(client, monkeypatch):
    def boom(*args, **kwargs):
        raise AssertionError("pipeline should not run for small talk")

    monkeypatch.setattr("app.api.routes.chat.run_pipeline", boom)
    monkeypatch.setattr(
        "app.api.routes.chat.answer_baseline",
        lambda *a, **k: {
            "answer": "Hi! Ask me about your documents.",
            "citations": [],
            "mode": "baseline",
            "evidence": [],
        },
    )

    response = client.post(
        "/api/chat", json={"question": "hi", "mode": "verified"}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["mode"] == "chat"
    assert body["answer"].startswith("Hi!")


def test_verified_pipeline_failure_returns_502(client, monkeypatch):
    def boom(*args, **kwargs):
        raise RuntimeError("pipeline down")

    monkeypatch.setattr("app.api.routes.chat.run_pipeline", boom)

    response = client.post(
        "/api/chat",
        json={"question": "Who breached clause 4.2?", "mode": "verified"},
    )

    assert response.status_code == 502


def test_unknown_mode_is_rejected(client):
    response = client.post(
        "/api/chat", json={"question": "q?", "mode": "nonsense"}
    )
    assert response.status_code == 422


def test_continue_chat_keeps_same_id(client, monkeypatch):
    monkeypatch.setattr(
        "app.api.routes.chat.answer_baseline", lambda *a, **k: BASELINE_RESULT
    )

    first = client.post("/api/chat", json={"question": "first question?"})
    chat_id = first.json()["chat_id"]

    second = client.post(
        "/api/chat", json={"question": "second question?", "chat_id": chat_id}
    )

    assert second.json()["chat_id"] == chat_id
    detail = client.get(f"/api/chats/{chat_id}").json()
    assert len(detail["messages"]) == 4


def test_chats_are_user_scoped(client, db_session, monkeypatch):
    monkeypatch.setattr(
        "app.api.routes.chat.answer_baseline", lambda *a, **k: BASELINE_RESULT
    )

    created = client.post("/api/chat", json={"question": "private question?"})
    chat_id = created.json()["chat_id"]

    other = User(
        id=2,
        name="Other User",
        email="other@example.com",
        password_hash="hash",
        is_verified=True,
    )
    db_session.add(other)
    db_session.commit()
    app.dependency_overrides[get_current_user] = lambda: other

    assert client.get(f"/api/chats/{chat_id}").status_code == 404
    assert client.delete(f"/api/chats/{chat_id}").status_code == 404
    assert client.get("/api/chats").json() == []


def test_verified_chat_passes_collection_doc_ids(
    client, db_session, monkeypatch
):
    collection = _collection(db_session, doc_ids=("d1", "d2"))
    captured = {}

    def fake_pipeline(question, user_id, top_k=5, doc_ids=None):
        captured.update(user_id=user_id, doc_ids=doc_ids)
        return VERIFIED_STATE

    monkeypatch.setattr("app.api.routes.chat.run_pipeline", fake_pipeline)

    response = client.post(
        "/api/chat",
        json={
            "question": "Who breached clause 4.2?",
            "mode": "verified",
            "collection_id": collection.id,
        },
    )

    assert response.status_code == 200
    assert captured["doc_ids"] == ["d1", "d2"]
    assert response.json()["collection_id"] == collection.id


def test_baseline_chat_passes_collection_doc_ids(
    client, db_session, monkeypatch
):
    collection = _collection(db_session, doc_ids=("d1",))
    captured = {}

    def fake_baseline(
        user_id, question, top_k=5, temperature=0.0, doc_ids=None
    ):
        captured["doc_ids"] = doc_ids
        return BASELINE_RESULT

    monkeypatch.setattr("app.api.routes.chat.answer_baseline", fake_baseline)

    response = client.post(
        "/api/chat",
        json={"question": "Any question?", "collection_id": collection.id},
    )

    assert response.status_code == 200
    assert captured["doc_ids"] == ["d1"]


def test_chat_rejects_another_users_collection(
    client, db_session, monkeypatch
):
    other = User(
        id=2,
        name="Other",
        email="other@example.com",
        password_hash="hash",
        is_verified=True,
    )
    db_session.add(other)
    db_session.commit()
    their_collection = _collection(
        db_session, name="Theirs", doc_ids=("d2",), user_id=2
    )

    def boom(*args, **kwargs):
        raise AssertionError("pipeline must not run for a foreign collection")

    monkeypatch.setattr("app.api.routes.chat.run_pipeline", boom)

    response = client.post(
        "/api/chat",
        json={
            "question": "Who breached clause 4.2?",
            "mode": "verified",
            "collection_id": their_collection.id,
        },
    )

    assert response.status_code == 404
