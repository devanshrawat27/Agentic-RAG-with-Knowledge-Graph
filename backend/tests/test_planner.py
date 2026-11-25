from unittest.mock import patch

from app.agents.planner import (
    MAX_SUB_QUESTIONS,
    _needs_decomposition,
    _parse_sub_questions,
    plan,
)

Q = (
    "Which vendor breached clause 4.2 in 2024, "
    "and what changed in the 2025 revision?"
)


def test_short_question_skips_llm():
    with patch("app.agents.planner.get_llm_with_fallback") as llm:
        assert plan({"question": "hi"})["sub_questions"] == ["hi"]
        assert plan({"question": "Who breached clause 4.2?"})["sub_questions"] == [
            "Who breached clause 4.2?"
        ]
        llm.assert_not_called()


def test_empty_question_returns_no_sub_questions():
    assert plan({"question": "   "})["sub_questions"] == []


def test_needs_decomposition():
    assert _needs_decomposition(Q) is True
    assert _needs_decomposition("Who breached clause 4.2?") is False


def test_parse_plain_json_array():
    raw = '["Who breached 4.2?", "What changed in 2025?"]'
    assert _parse_sub_questions(raw, Q) == [
        "Who breached 4.2?",
        "What changed in 2025?",
    ]


def test_parse_dict_wrapper():
    raw = '{"sub_questions": ["a?", "b?"]}'
    assert _parse_sub_questions(raw, Q) == ["a?", "b?"]


def test_parse_fenced_json():
    raw = '```json\n["x?", "y?"]\n```'
    assert _parse_sub_questions(raw, Q) == ["x?", "y?"]


def test_parse_json_inside_prose():
    raw = 'Here you go:\n["p?", "q?"]\nDone.'
    assert _parse_sub_questions(raw, Q) == ["p?", "q?"]


def test_parse_bullet_lines():
    raw = "1. first?\n2. second?"
    assert _parse_sub_questions(raw, Q) == ["first?", "second?"]


def test_parse_garbage_falls_back_to_original():
    assert _parse_sub_questions("no json here", Q) == ["no json here"]


def test_parse_dedupes_and_caps():
    raw = '["A?", "a?", "A? ", "B?", "C?", "D?", "E?"]'
    parsed = _parse_sub_questions(raw, Q)
    assert parsed == ["A?", "B?", "C?", "D?"]
    assert len(parsed) == MAX_SUB_QUESTIONS


def test_planner_uses_llm_output():
    class _Response:
        content = '["Who breached clause 4.2?", "What changed in 2025?"]'

    class _LLM:
        def invoke(self, messages):
            return _Response()

    with patch("app.agents.planner.get_llm_with_fallback", return_value=_LLM()):
        out = plan({"question": Q})

    assert out["sub_questions"] == [
        "Who breached clause 4.2?",
        "What changed in 2025?",
    ]


def test_planner_falls_back_when_llm_fails():
    with patch(
        "app.agents.planner.get_llm_with_fallback",
        side_effect=RuntimeError("no key"),
    ):
        out = plan({"question": Q})

    assert out["sub_questions"] == [Q]
