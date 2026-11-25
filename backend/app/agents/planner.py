"""Planner agent: breaks a complex question into sub-questions.

Only questions that look multi-part take an LLM call; short or simple ones pass
through unchanged. The Planner never breaks the pipeline: if the model call or
parsing fails, the original question becomes the single sub-question.
"""

import json
import logging
import re

from app.agents.graph_state import AgentState
from app.core.llm import content_to_text, get_llm_with_fallback

logger = logging.getLogger("app.agents.planner")

MAX_SUB_QUESTIONS = 4
# Word count at or below which decomposition adds no value (also covers
# greetings / small talk, so those never cost an LLM request).
_SHORT_QUESTION_WORDS = 6

_SYSTEM = (
    "You decompose a user's question about enterprise documents (contracts, "
    "policies, compliance records) into the smallest set of self-contained "
    "sub-questions needed to answer it. Split only when the question genuinely "
    "needs facts from different places (multi-hop). Keep each sub-question "
    "answerable on its own and preserve names, dates and clause numbers "
    "exactly. Do not answer the question. Return ONLY a JSON array of strings."
)

_PROMPT = """Question: {question}

Return at most {limit} sub-questions as a JSON array of strings. If the
question is already simple, return a single-element array containing it
verbatim."""

_BULLET = re.compile(r"^\s*(?:[-*•]|\d+[.)])\s*")
_FENCE = re.compile(r"^```(?:json)?\s*|\s*```$", re.IGNORECASE)


def _word_count(text: str) -> int:
    return len(re.findall(r"\S+", text))


def _needs_decomposition(question: str) -> bool:
    return _word_count(question) > _SHORT_QUESTION_WORDS


def _clean(items: list[object], original: str) -> list[str]:
    """Normalize, dedupe and cap parsed sub-questions."""
    seen: set[str] = set()
    out: list[str] = []
    for item in items:
        if not isinstance(item, str):
            continue
        text = item.strip().strip("\"'").strip()
        if not text:
            continue
        key = text.casefold()
        if key in seen:
            continue
        seen.add(key)
        out.append(text)
        if len(out) >= MAX_SUB_QUESTIONS:
            break
    return out or [original]


def _parse_sub_questions(raw: str, original: str) -> list[str]:
    """Parse model output that should be a JSON array, tolerating wrappers."""
    text = _FENCE.sub("", raw.strip()).strip()

    candidates: list[object] = []
    try:
        data = json.loads(text)
    except (ValueError, TypeError):
        data = None

    if isinstance(data, list):
        candidates = data
    elif isinstance(data, dict):
        for key in ("sub_questions", "subquestions", "questions"):
            if isinstance(data.get(key), list):
                candidates = data[key]
                break
    else:
        # Model added prose around the array — grab the first bracketed block.
        match = re.search(r"\[.*\]", text, re.DOTALL)
        if match:
            try:
                parsed = json.loads(match.group(0))
                if isinstance(parsed, list):
                    candidates = parsed
            except (ValueError, TypeError):
                pass

    if not candidates:
        # Last resort: one sub-question per line, stripping bullets/numbering.
        candidates = [_BULLET.sub("", line) for line in text.splitlines()]

    return _clean(candidates, original)


def plan(state: AgentState) -> AgentState:
    question = (state.get("question") or "").strip()
    if not question:
        return {"sub_questions": []}
    if not _needs_decomposition(question):
        return {"sub_questions": [question]}

    try:
        llm = get_llm_with_fallback(temperature=0.0)
        response = llm.invoke(
            [
                ("system", _SYSTEM),
                ("human", _PROMPT.format(
                    question=question, limit=MAX_SUB_QUESTIONS
                )),
            ]
        )
        sub_questions = _parse_sub_questions(
            content_to_text(response.content), question
        )
    except Exception as exc:  # noqa: BLE001 - planner must never break the run
        logger.warning("planner decomposition failed: %s", str(exc)[:200])
        sub_questions = [question]

    return {"sub_questions": sub_questions}
