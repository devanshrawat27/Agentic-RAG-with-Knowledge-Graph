from app.agents.retriever import retrieve


def test_retriever_requires_user_id(monkeypatch):
    def fail(*args, **kwargs):
        raise AssertionError("should not retrieve without a user")

    monkeypatch.setattr("app.agents.retriever.retrieve_hybrid", fail)

    assert retrieve({"question": "Who breached 4.2?"})["evidence"] == []


def test_retriever_requires_question(monkeypatch):
    def fail(*args, **kwargs):
        raise AssertionError("should not retrieve without a question")

    monkeypatch.setattr("app.agents.retriever.retrieve_hybrid", fail)

    assert retrieve({"question": "  ", "user_id": 1})["evidence"] == []


def test_retriever_uses_sub_questions_and_top_k(monkeypatch):
    call = {}

    def fake_hybrid(user_id, queries, top_k=5, doc_ids=None):
        call.update(user_id=user_id, queries=queries, top_k=top_k)
        return [{"text": "chunk", "chunk_id": "c1"}]

    monkeypatch.setattr("app.agents.retriever.retrieve_hybrid", fake_hybrid)

    state = retrieve(
        {
            "question": "original?",
            "user_id": 3,
            "sub_questions": ["a?", "b?"],
            "top_k": 7,
        }
    )

    assert call == {"user_id": 3, "queries": ["a?", "b?"], "top_k": 7}
    assert state["evidence"] == [{"text": "chunk", "chunk_id": "c1"}]
    assert state["needs_more_evidence"] is False


def test_retriever_passes_collection_scope(monkeypatch):
    captured = {}

    def fake_hybrid(user_id, queries, top_k=5, doc_ids=None):
        captured["doc_ids"] = doc_ids
        return []

    monkeypatch.setattr("app.agents.retriever.retrieve_hybrid", fake_hybrid)

    retrieve({"question": "q?", "user_id": 1, "doc_ids": ["d1"]})

    assert captured["doc_ids"] == ["d1"]


def test_retriever_counts_verifier_requested_loops(monkeypatch):
    monkeypatch.setattr(
        "app.agents.retriever.retrieve_hybrid",
        lambda user_id, queries, top_k=5, doc_ids=None: [],
    )

    state = retrieve(
        {
            "question": "q?",
            "user_id": 1,
            "loop_count": 1,
            "needs_more_evidence": True,
        }
    )

    assert state["loop_count"] == 2
    assert state["needs_more_evidence"] is False


def test_retriever_degrades_when_hybrid_raises(monkeypatch):
    def boom(*args, **kwargs):
        raise RuntimeError("stores down")

    monkeypatch.setattr("app.agents.retriever.retrieve_hybrid", boom)

    state = retrieve({"question": "q?", "user_id": 1})
    assert state["evidence"] == []
