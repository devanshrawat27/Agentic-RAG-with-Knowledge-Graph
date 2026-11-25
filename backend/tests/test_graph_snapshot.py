import pytest

from app.db import graph_snapshot

NODE_ROWS = [
    {
        "labels": ["Vendor"],
        "id": "v1",
        "name": "Acme Corp",
        "number": "",
        "summary": "",
        "date": "",
    },
    {
        "labels": ["Clause"],
        "id": "c1",
        "name": "Liability cap",
        "number": "4.2",
        "summary": "Caps liability",
        "date": "",
    },
]

EDGE_ROWS = [
    {
        "source": "v1",
        "target": "c1",
        "type": "BREACHED",
        "doc_id": "doc-1",
        "chunk_id": "doc-1:0",
    },
    {
        "source": "v1",
        "target": "c1",
        "type": "BREACHED",
        "doc_id": "doc-1",
        "chunk_id": "doc-1:0",
    },
    {
        "source": "v1",
        "target": "missing",
        "type": "MENTIONS",
        "doc_id": "doc-1",
        "chunk_id": "",
    },
]


def test_fetch_graph_maps_nodes_and_drops_dangling_edges(monkeypatch):
    calls = []

    def fake_run(query, **params):
        calls.append(params)
        return NODE_ROWS if "MATCH (n)" in query else EDGE_ROWS

    monkeypatch.setattr(graph_snapshot, "run_query", fake_run)

    result = graph_snapshot.fetch_graph(7, limit=50, include_mentions=True)

    assert calls[0] == {"user_id": 7, "limit": 50}
    assert calls[1] == {"user_id": 7, "limit": 50, "include_mentions": True}
    assert result["counts"] == {"nodes": 2, "edges": 1}
    assert result["nodes"][0]["label"] == "Vendor"
    assert result["nodes"][1]["name"] == "Liability cap"
    assert result["edges"][0]["type"] == "BREACHED"
    assert result["edges"][0]["doc_id"] == "doc-1"


def test_fetch_graph_skips_nodes_without_id(monkeypatch):
    rows = [{"labels": ["Entity"], "id": None, "name": "X"}]

    monkeypatch.setattr(
        graph_snapshot, "run_query", lambda query, **params: rows
    )

    result = graph_snapshot.fetch_graph(1)

    assert result["nodes"] == []
    assert result["counts"] == {"nodes": 0, "edges": 0}


def test_fetch_graph_propagates_store_errors(monkeypatch):
    def boom(query, **params):
        raise RuntimeError("neo4j down")

    monkeypatch.setattr(graph_snapshot, "run_query", boom)

    with pytest.raises(RuntimeError):
        graph_snapshot.fetch_graph(1)
