from app.core import vectorstore
from app.rag import retrieval
from app.rag.graph_retrieval import search_graph


def _row(**overrides):
    row = {
        "source_labels": ["Vendor"],
        "source_name": "Acme Corp",
        "source_number": "",
        "source_id": "v1",
        "rel": "COMMITTED",
        "target_labels": ["Violation"],
        "target_name": "",
        "target_number": "",
        "target_id": "x1",
        "doc_id": "doc-1",
        "chunk_id": "doc-1:3",
        "outgoing": True,
    }
    row.update(overrides)
    return row


def test_extract_terms_pulls_numbers_and_entities():
    terms = retrieval.extract_terms(
        'Which Vendor breached clause 4.2 in 2024 at "Acme Corp"?'
    )
    folded = [term.casefold() for term in terms]

    assert "4.2" in folded
    assert "2024" in folded
    assert "acme corp" in folded
    assert "which" not in folded


def test_extract_terms_strips_sentence_start_stopwords():
    terms = retrieval.extract_terms("The Acme Corp signed it.")
    assert "acme corp" in [term.casefold() for term in terms]


def test_search_graph_scopes_to_user_and_builds_facts(monkeypatch):
    calls = {}

    def fake_run(query, **params):
        calls["query"] = query
        calls["params"] = params
        return [_row()]

    monkeypatch.setattr("app.rag.graph_retrieval.run_query", fake_run)

    facts = search_graph(user_id=7, terms=["Acme Corp", "2024"], limit=5)

    assert calls["params"]["user_id"] == 7
    assert calls["params"]["terms"] == ["Acme Corp", "2024"]
    assert "$user_id" in calls["query"]
    assert len(facts) == 1
    fact = facts[0]
    assert fact["source"] == "graph"
    assert fact["doc_id"] == "doc-1"
    assert fact["chunk_id"] == "doc-1:3"
    assert fact["fact"]["relation"] == "COMMITTED"
    assert "Acme Corp" in fact["text"]


def test_search_graph_dedupes_same_fact(monkeypatch):
    monkeypatch.setattr(
        "app.rag.graph_retrieval.run_query",
        lambda query, **params: [_row(), _row()],
    )
    assert len(search_graph(1, ["Acme Corp"])) == 1


def test_search_graph_skips_query_without_terms(monkeypatch):
    def fail(*args, **kwargs):
        raise AssertionError("should not query without terms")

    monkeypatch.setattr("app.rag.graph_retrieval.run_query", fail)
    assert search_graph(1, []) == []


def test_search_graph_degrades_on_db_error(monkeypatch):
    def boom(*args, **kwargs):
        raise RuntimeError("neo4j down")

    monkeypatch.setattr("app.rag.graph_retrieval.run_query", boom)
    assert search_graph(1, ["Acme Corp"]) == []


def test_merge_rank_combines_sources_for_same_chunk():
    vector_items = [
        {
            "text": "actual chunk text",
            "doc_id": "doc-1",
            "chunk_id": "doc-1:0",
            "filename": "contract.pdf",
            "score": 0.9,
            "source": "vector",
        }
    ]
    graph_items = [
        {
            "text": "Acme Corp -[COMMITTED]-> Violation",
            "doc_id": "doc-1",
            "chunk_id": "doc-1:0",
            "score": 0.8,
            "source": "graph",
            "fact": {"source": "Acme Corp", "relation": "COMMITTED", "target": "Violation"},
        }
    ]

    merged = retrieval.merge_rank(vector_items, graph_items, limit=5)

    assert len(merged) == 1
    assert merged[0]["text"] == "actual chunk text"
    assert set(merged[0]["sources"]) == {"vector", "graph"}
    assert merged[0]["facts"][0]["relation"] == "COMMITTED"


def test_merge_rank_orders_by_fusion_score():
    vector_items = [
        {"text": "a", "chunk_id": "a", "score": 0.9, "source": "vector"},
        {"text": "b", "chunk_id": "b", "score": 0.6, "source": "vector"},
    ]
    graph_items = [
        {"text": "g", "chunk_id": "c", "score": 0.8, "source": "graph"},
    ]

    merged = retrieval.merge_rank(vector_items, graph_items, limit=2)

    assert len(merged) == 2
    assert merged[0]["chunk_id"] == "a"
    assert merged[1]["chunk_id"] == "c"


def test_retrieve_hybrid_merges_and_filters_weak_vector(monkeypatch):
    monkeypatch.setattr(
        retrieval,
        "retrieve_vector",
        lambda user_id, query, top_k=5, doc_ids=None: [
            {
                "text": "strong",
                "chunk_id": "c1",
                "score": 0.9,
                "source": "vector",
            },
            {
                "text": "weak",
                "chunk_id": "c2",
                "score": 0.1,
                "source": "vector",
            },
        ],
    )
    monkeypatch.setattr(
        retrieval,
        "search_graph",
        lambda user_id, terms, limit=10, doc_ids=None: [
            {"text": "fact", "chunk_id": "c3", "score": 0.8, "source": "graph"}
        ],
    )

    evidence = retrieval.retrieve_hybrid(1, ["Who breached 4.2?"], top_k=5)
    ids = {item["chunk_id"] for item in evidence}

    assert "c1" in ids
    assert "c3" in ids
    assert "c2" not in ids


def test_retrieve_hybrid_empty_queries():
    assert retrieval.retrieve_hybrid(1, ["", "   "]) == []


def test_retrieve_hybrid_passes_doc_ids(monkeypatch):
    seen = {}

    def fake_vector(user_id, query, top_k=5, doc_ids=None):
        seen["vector"] = doc_ids
        return []

    def fake_graph(user_id, terms, limit=10, doc_ids=None):
        seen["graph"] = doc_ids
        return []

    monkeypatch.setattr(retrieval, "retrieve_vector", fake_vector)
    monkeypatch.setattr(retrieval, "search_graph", fake_graph)

    assert retrieval.retrieve_hybrid(1, ["q?"], doc_ids=["d1"]) == []
    assert seen == {"vector": ["d1"], "graph": ["d1"]}


def test_retrieve_hybrid_empty_scope_skips_stores(monkeypatch):
    def fail(*args, **kwargs):
        raise AssertionError("stores must not be queried for an empty collection")

    monkeypatch.setattr(retrieval, "retrieve_vector", fail)
    monkeypatch.setattr(retrieval, "search_graph", fail)

    assert retrieval.retrieve_hybrid(1, ["q?"], doc_ids=[]) == []


def test_search_graph_scopes_to_collection(monkeypatch):
    calls = {}

    def fake_run(query, **params):
        calls["query"] = query
        calls["params"] = params
        return []

    monkeypatch.setattr("app.rag.graph_retrieval.run_query", fake_run)

    search_graph(1, ["Acme"], doc_ids=["d1"])

    assert calls["params"]["scoped"] is True
    assert calls["params"]["doc_ids"] == ["d1"]
    assert "$doc_ids" in calls["query"]


class _FakeQdrant:
    def __init__(self):
        self.kwargs = None

    def collection_exists(self, name):
        return True

    def query_points(self, **kwargs):
        self.kwargs = kwargs

        class _Result:
            points = []

        return _Result()


def test_search_chunks_scopes_doc_ids(monkeypatch):
    fake = _FakeQdrant()
    monkeypatch.setattr(vectorstore, "get_qdrant", lambda: fake)

    result = vectorstore.search_chunks(
        1, [0.1, 0.2], limit=3, doc_ids=["d1", "d2"]
    )

    assert result == []
    condition = fake.kwargs["query_filter"].must[0]
    assert condition.key == "doc_id"
    assert condition.match.any == ["d1", "d2"]


def test_search_chunks_empty_scope_returns_early(monkeypatch):
    def fail():
        raise AssertionError("Qdrant must not be queried for an empty scope")

    monkeypatch.setattr(vectorstore, "get_qdrant", fail)

    assert vectorstore.search_chunks(1, [0.1], doc_ids=[]) == []
