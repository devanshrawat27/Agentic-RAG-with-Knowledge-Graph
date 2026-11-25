def test_graph_endpoint_passes_user_and_filters(client, monkeypatch):
    captured = {}

    def fake_fetch(user_id, limit=300, include_mentions=False):
        captured.update(
            user_id=user_id, limit=limit, include_mentions=include_mentions
        )
        return {"nodes": [], "edges": [], "counts": {"nodes": 0, "edges": 0}}

    monkeypatch.setattr("app.api.routes.graph.fetch_graph", fake_fetch)

    response = client.get("/api/graph?limit=50&include_mentions=true")

    assert response.status_code == 200
    assert response.json()["counts"] == {"nodes": 0, "edges": 0}
    assert captured == {"user_id": 1, "limit": 50, "include_mentions": True}


def test_graph_endpoint_rejects_bad_limit(client):
    assert client.get("/api/graph?limit=0").status_code == 422
    assert client.get("/api/graph?limit=5000").status_code == 422


def test_graph_endpoint_returns_503_when_store_down(client, monkeypatch):
    def boom(*args, **kwargs):
        raise RuntimeError("neo4j down")

    monkeypatch.setattr("app.api.routes.graph.fetch_graph", boom)

    response = client.get("/api/graph")

    assert response.status_code == 503
