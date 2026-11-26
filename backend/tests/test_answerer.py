from app.agents import answerer
from app.pipeline.graph import run_pipeline

EVIDENCE = [
    {
        "text": "Acme Corp breached clause 4.2 in 2024.",
        "doc_id": "doc-1",
        "chunk_id": "doc-1:0",
        "filename": "acme.pdf",
        "score": 0.9,
        "source": "vector",
    },
    {
        "text": "The 2025 revision changed clause 4.2.",
        "doc_id": "doc-2",
        "chunk_id": "doc-2:1",
        "filename": "revision.pdf",
        "score": 0.7,
        "source": "graph",
    },
]


def _claim(text, supported=True, refs=None):
    return {
        "text": text,
        "supported": supported,
        "evidence_refs": refs or [],
        "reason": "test",
    }


def test_verified_claim_gets_citation_marker():
    state = answerer.answer(
        {"claims": [_claim("Acme Corp breached clause 4.2 in 2024.", True, [1])],
         "evidence": EVIDENCE}
    )

    assert state["final_answer"] == "Acme Corp breached clause 4.2 in 2024 [1]."
    assert state["citations"] == [
        {
            "index": 1,
            "doc_id": "doc-1",
            "chunk_id": "doc-1:0",
            "filename": "acme.pdf",
            "snippet": "Acme Corp breached clause 4.2 in 2024.",
            "score": 0.9,
        }
    ]


def test_unsupported_claims_are_labelled_not_used():
    state = answerer.answer(
        {
            "claims": [
                _claim("Acme Corp breached clause 4.2.", True, [1]),
                _claim("Beta violated clause 7.1.", False),
            ],
            "evidence": EVIDENCE,
        }
    )

    assert state["final_answer"].startswith(
        "Acme Corp breached clause 4.2 [1]."
    )
    assert answerer._UNVERIFIED_HEADER in state["final_answer"]
    assert "- Beta violated clause 7.1." in state["final_answer"]
    assert len(state["citations"]) == 1


def test_citations_are_renumbered_and_deduped():
    state = answerer.answer(
        {
            "claims": [
                _claim("The revision changed clause 4.2.", True, [2]),
                _claim("Acme breached it.", True, [1, 2]),
            ],
            "evidence": EVIDENCE,
        }
    )

    assert [c["index"] for c in state["citations"]] == [1, 2]
    assert [c["doc_id"] for c in state["citations"]] == ["doc-2", "doc-1"]
    assert "[1]" in state["final_answer"]
    assert "[2][1]" in state["final_answer"]


def test_nothing_supported_returns_explanation():
    state = answerer.answer(
        {
            "claims": [
                _claim("Beta violated clause 7.1.", False),
                _claim("Gamma breached clause 9.9.", False),
            ],
            "evidence": EVIDENCE,
        }
    )

    assert state["final_answer"].startswith(answerer._NOTHING_SUPPORTED)
    assert "- Beta violated clause 7.1." in state["final_answer"]
    assert "- Gamma breached clause 9.9." in state["final_answer"]
    assert state["citations"] == []


def test_no_claims_keeps_refusal_draft():
    draft = "I could not find that in your documents."
    state = answerer.answer({"claims": [], "draft_answer": draft, "evidence": []})
    assert state["final_answer"] == draft
    assert state["citations"] == []


def test_no_claims_and_no_draft_uses_no_answer():
    state = answerer.answer({"claims": [], "draft_answer": "", "evidence": []})
    assert state["final_answer"] == answerer.NO_ANSWER


def test_out_of_range_evidence_ref_is_ignored():
    state = answerer.answer(
        {
            "claims": [_claim("Acme breached clause 4.2.", True, [9])],
            "evidence": EVIDENCE,
        }
    )

    assert state["final_answer"] == "Acme breached clause 4.2."
    assert state["citations"] == []


def test_pipeline_returns_verified_answer(monkeypatch):
    class _Response:
        def __init__(self, content):
            self.content = content

    class _LLM:
        def __init__(self, responses):
            self.responses = list(responses)

        def invoke(self, messages):
            return _Response(self.responses.pop(0))

    llm = _LLM(
        [
            "Acme Corp breached clause 4.2 in 2024 [1].",
            '[{"claim": 1, "supported": true, "evidence": [1], "reason": "exact"}]',
        ]
    )
    monkeypatch.setattr(
        "app.agents.verifier.get_llm_with_fallback", lambda temperature=0.0: llm
    )
    monkeypatch.setattr(
        "app.agents.retriever.retrieve_hybrid",
        lambda user_id, queries, top_k=5, doc_ids=None: [dict(EVIDENCE[0])],
    )

    state = run_pipeline("Who breached 4.2?", user_id=1)

    assert state["final_answer"] == "Acme Corp breached clause 4.2 in 2024 [1]."
    assert state["citations"][0]["doc_id"] == "doc-1"
    assert state["loop_count"] == 0
    assert state["claims"][0]["supported"] is True
