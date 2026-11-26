from app.core import vectorstore


class _Point:
    def __init__(self, payload):
        self.payload = payload


class _FakeQdrant:
    def __init__(self, payloads):
        self.payloads = payloads
        self.requested_ids = None

    def collection_exists(self, name):
        return True

    def retrieve(self, collection_name, ids, with_payload=True):
        self.requested_ids = ids
        return [_Point(payload) for payload in self.payloads]


def _payload(index):
    return {
        "chunk_id": f"d1:{index}",
        "chunk_index": index,
        "doc_id": "d1",
        "filename": "contract.txt",
        "text": f"chunk {index}",
    }


def test_get_chunk_context_returns_sorted_neighbours(monkeypatch):
    fake = _FakeQdrant([_payload(4), _payload(5), _payload(6)])
    monkeypatch.setattr(vectorstore, "get_qdrant", lambda: fake)

    chunks = vectorstore.get_chunk_context(1, "d1:5", context=1)

    assert [chunk["chunk_index"] for chunk in chunks] == [4, 5, 6]
    assert [chunk["is_focus"] for chunk in chunks] == [False, True, False]
    assert fake.requested_ids == [
        vectorstore._point_id("d1", 4),
        vectorstore._point_id("d1", 5),
        vectorstore._point_id("d1", 6),
    ]


def test_get_chunk_context_rejects_bad_ids(monkeypatch):
    def fail():
        raise AssertionError("Qdrant must not be queried for a bad chunk id")

    monkeypatch.setattr(vectorstore, "get_qdrant", fail)

    assert vectorstore.get_chunk_context(1, "nope") == []
    assert vectorstore.get_chunk_context(1, "d1:notanumber") == []


def test_get_chunk_context_requires_focus_chunk(monkeypatch):
    fake = _FakeQdrant([_payload(4), _payload(6)])
    monkeypatch.setattr(vectorstore, "get_qdrant", lambda: fake)

    assert vectorstore.get_chunk_context(1, "d1:5", context=1) == []


def test_chunk_endpoint_returns_preview(client, monkeypatch):
    captured = {}

    def fake_context(user_id, chunk_id, context=1):
        captured.update(user_id=user_id, chunk_id=chunk_id, context=context)
        return [
            {
                "chunk_id": chunk_id,
                "chunk_index": 5,
                "doc_id": "d1",
                "filename": "contract.txt",
                "text": "the source text",
                "is_focus": True,
            }
        ]

    monkeypatch.setattr(
        "app.api.routes.chunks.get_chunk_context", fake_context
    )

    response = client.get("/api/chunks/d1:5?context=2")

    assert response.status_code == 200
    assert response.json()["focus"] == "d1:5"
    assert response.json()["chunks"][0]["text"] == "the source text"
    assert captured == {"user_id": 1, "chunk_id": "d1:5", "context": 2}


def test_chunk_endpoint_returns_404(client, monkeypatch):
    monkeypatch.setattr(
        "app.api.routes.chunks.get_chunk_context",
        lambda *args, **kwargs: [],
    )

    assert client.get("/api/chunks/d1:99").status_code == 404
