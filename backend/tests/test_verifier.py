from app.agents import verifier
from app.agents.graph_state import MAX_VERIFIER_LOOPS
from app.pipeline.graph import run_pipeline

EVIDENCE = [
    {
        "text": "Acme Corp breached clause 4.2 in 2024.",
        "doc_id": "doc-1",
        "chunk_id": "doc-1:0",
        "filename": "acme.pdf",
        "score": 0.9,
        "source": "vector",
    }
]


class _Response:
    def __init__(self, content):
        self.content = content


class _LLM:
    def __init__(self, responses):
        self.responses = list(responses)
        self.calls = []

    def invoke(self, messages):
        self.calls.append(messages)
        item = self.responses.pop(0)
        if isinstance(item, Exception):
            raise item
        return _Response(item)


def _install(monkeypatch, llm):
    monkeypatch.setattr(
        verifier, "get_llm_with_fallback", lambda temperature=0.0: llm
    )


def test_all_claims_supported(monkeypatch):
    llm = _LLM(
        [
            "Acme Corp breached clause 4.2 in 2024 [1].",
            '[{"claim": 1, "supported": true, "evidence": [1], "reason": "exact"}]',
        ]
    )
    _install(monkeypatch, llm)

    out = verifier.verify({"question": "Who breached 4.2?", "evidence": EVIDENCE})

    assert out["needs_more_evidence"] is False
    assert out["claims"][0]["supported"] is True
    assert out["claims"][0]["evidence_refs"] == [1]
    assert "loop_count" not in out
    assert len(llm.calls) == 2


def test_unsupported_claim_requests_more_evidence(monkeypatch):
    llm = _LLM(
        [
            "Acme breached 4.2. Beta violated 7.1 [1].",
            '[{"claim": 1, "supported": true, "evidence": [1], "reason": "ok"},'
            ' {"claim": 2, "supported": false, "evidence": [], "reason": "no evidence"}]',
        ]
    )
    _install(monkeypatch, llm)

    out = verifier.verify(
        {"question": "Who breached?", "evidence": EVIDENCE, "loop_count": 1}
    )

    assert out["needs_more_evidence"] is True
    assert "loop_count" not in out
    assert out["claims"][1]["supported"] is False
    assert out["sub_questions"] == ["Beta violated 7.1."]


def test_unsupported_claim_stops_at_loop_cap(monkeypatch):
    llm = _LLM(
        [
            "Beta violated 7.1.",
            '[{"claim": 1, "supported": false, "evidence": [], "reason": "no"}]',
        ]
    )
    _install(monkeypatch, llm)

    out = verifier.verify(
        {
            "question": "Who breached?",
            "evidence": EVIDENCE,
            "loop_count": MAX_VERIFIER_LOOPS,
        }
    )

    assert out["needs_more_evidence"] is False
    assert "loop_count" not in out


def test_no_evidence_skips_llm(monkeypatch):
    def fail(temperature=0.0):
        raise AssertionError("LLM must not be called without evidence")

    monkeypatch.setattr(verifier, "get_llm_with_fallback", fail)

    out = verifier.verify({"question": "q?", "evidence": []})

    assert out == {
        "draft_answer": "",
        "claims": [],
        "needs_more_evidence": False,
    }


def test_refusal_has_no_claims(monkeypatch):
    llm = _LLM(["I could not find that in your documents."])
    _install(monkeypatch, llm)

    out = verifier.verify({"question": "q?", "evidence": EVIDENCE})

    assert out["claims"] == []
    assert out["needs_more_evidence"] is False
    assert len(llm.calls) == 1


def test_lexical_fallback_when_judge_fails(monkeypatch):
    llm = _LLM(
        ["Acme Corp breached clause 4.2 in 2024.", RuntimeError("judge down")]
    )
    _install(monkeypatch, llm)

    out = verifier.verify({"question": "q?", "evidence": EVIDENCE})

    assert out["claims"][0]["supported"] is True
    assert out["claims"][0]["evidence_refs"] == [1]
    assert out["claims"][0]["reason"].startswith("lexical overlap")
    assert out["needs_more_evidence"] is False


def test_lexical_fallback_marks_unrelated_claim_unsupported(monkeypatch):
    llm = _LLM(["Beta violated clause 7.1.", RuntimeError("judge down")])
    _install(monkeypatch, llm)

    out = verifier.verify({"question": "q?", "evidence": EVIDENCE})

    assert out["claims"][0]["supported"] is False
    assert out["needs_more_evidence"] is True


def test_parse_verification_dict_and_filters_bad_refs():
    raw = (
        '```json\n{"results": [{"claim": 1, "supported": "true", '
        '"evidence": [1, 9], "reason": "ok"}]}\n```'
    )
    verdicts = verifier._parse_verification(raw, ["claim"], evidence_count=3)

    assert verdicts is not None
    assert verdicts[0]["supported"] is True
    assert verdicts[0]["evidence_refs"] == [1]


def test_parse_verification_missing_claim_is_unverified():
    raw = '[{"claim": 1, "supported": true, "evidence": [1]}]'
    verdicts = verifier._parse_verification(
        raw, ["first claim", "second claim"], evidence_count=1
    )

    assert verdicts is not None
    assert verdicts[0]["supported"] is True
    assert verdicts[1] == {
        "supported": False,
        "evidence_refs": [],
        "reason": "not verified",
    }


def test_parse_verification_garbage_returns_none():
    assert verifier._parse_verification("nope", ["c"], 1) is None


def test_split_claims_strips_bullets_and_citations():
    claims = verifier._split_claims(
        "- Acme breached 4.2 [1].\n- Beta signed in 2023 [2]."
    )
    assert claims == ["Acme breached 4.2.", "Beta signed in 2023."]


def test_split_claims_caps_count():
    draft = " ".join(f"Claim number {i} is here." for i in range(30))
    assert len(verifier._split_claims(draft)) == verifier.MAX_CLAIMS


def test_pipeline_stops_at_max_loops(monkeypatch):
    class _AlwaysUnsupported:
        def __init__(self):
            self.drafts = 0
            self.verdicts = 0

        def invoke(self, messages):
            text = str(messages)
            if "Claims:" in text:
                self.verdicts += 1
                return _Response(
                    '[{"claim": 1, "supported": false, "evidence": [], '
                    '"reason": "missing"}]'
                )
            self.drafts += 1
            return _Response("Beta violated clause 7.1 [1].")

    llm = _AlwaysUnsupported()
    _install(monkeypatch, llm)
    monkeypatch.setattr(
        "app.agents.retriever.retrieve_hybrid",
        lambda user_id, queries, top_k=5, doc_ids=None: [dict(EVIDENCE[0])],
    )

    state = run_pipeline("Who breached 4.2?", user_id=1)

    assert state["loop_count"] == MAX_VERIFIER_LOOPS
    assert state["needs_more_evidence"] is False
    assert llm.drafts == MAX_VERIFIER_LOOPS + 1
    assert llm.verdicts == MAX_VERIFIER_LOOPS + 1
    assert state["claims"][0]["supported"] is False