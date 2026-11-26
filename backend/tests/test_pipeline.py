from app.pipeline.graph import (
    MAX_VERIFIER_LOOPS,
    _route_after_verification,
    run_pipeline,
)


def test_route_to_answerer_when_supported():
    assert _route_after_verification({"needs_more_evidence": False}) == "answerer"


def test_route_loops_back_under_cap():
    assert (
        _route_after_verification(
            {"needs_more_evidence": True, "loop_count": 0}
        )
        == "retriever"
    )


def test_route_stops_looping_at_cap():
    assert (
        _route_after_verification(
            {"needs_more_evidence": True, "loop_count": MAX_VERIFIER_LOOPS}
        )
        == "answerer"
    )


def test_pipeline_runs_without_credentials(monkeypatch):
    monkeypatch.setattr(
        "app.agents.retriever.retrieve_hybrid",
        lambda user_id, queries, top_k=5, doc_ids=None: [],
    )

    state = run_pipeline("hello there", user_id=1)

    assert state["sub_questions"] == ["hello there"]
    assert state["evidence"] == []
    assert state["loop_count"] == 0
