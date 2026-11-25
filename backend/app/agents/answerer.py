"""Answerer agent: compose the final answer from verified claims only.

No LLM call happens here on purpose. The Verifier already produced a claim
list with `supported` flags and evidence references; the Answerer simply:

- renders only supported claims,
- renumbers their evidence references into a citation list,
- appends unsupported claims under an explicit "not verified" note,
- returns a clear no-answer message when nothing is usable.

This keeps the final answer grounded: every sentence the user sees either came
from a verified claim or is labelled as unverified.
"""

import re

from app.agents.graph_state import AgentState

NO_ANSWER = (
    "I couldn't find anything relevant in your documents for that. "
    "Try rephrasing, or upload the document that covers it."
)

_UNVERIFIED_HEADER = "Unverified (not found in sources):"
_NOTHING_SUPPORTED = (
    "I couldn't verify an answer from your documents. "
    "These claims were not supported by the retrieved sources:"
)
_MAX_UNVERIFIED_LISTED = 8
_TRAILING_PUNCT = re.compile(r"([.!?])$")


def _with_markers(text: str, markers: list[str]) -> str:
    if not markers:
        return text
    joined = "".join(markers)
    match = _TRAILING_PUNCT.search(text)
    if match:
        return f"{text[:-1]} {joined}{match.group(1)}"
    return f"{text} {joined}"


def _citation(index: int, item: dict) -> dict:
    text = item.get("text") or ""
    return {
        "index": index,
        "doc_id": item.get("doc_id"),
        "chunk_id": item.get("chunk_id"),
        "filename": item.get("filename"),
        "snippet": text[:240],
        "score": item.get("score"),
    }


def _unsupported_lines(unsupported: list[dict]) -> list[str]:
    return [
        f"- {(claim.get('text') or '').strip()}"
        for claim in unsupported[:_MAX_UNVERIFIED_LISTED]
        if (claim.get('text') or '').strip()
    ]


def _unsupported_note(unsupported: list[dict]) -> str:
    lines = _unsupported_lines(unsupported)
    return f"\n\n{_UNVERIFIED_HEADER}\n" + "\n".join(lines) if lines else ""


def _nothing_supported_message(unsupported: list[dict]) -> str:
    lines = _unsupported_lines(unsupported)
    return _NOTHING_SUPPORTED + (("\n" + "\n".join(lines)) if lines else "")


def answer(state: AgentState) -> AgentState:
    claims = list(state.get("claims") or [])
    evidence = list(state.get("evidence") or [])

    if not claims:
        draft = (state.get("draft_answer") or "").strip()
        return {"final_answer": draft or NO_ANSWER, "citations": []}

    supported = [claim for claim in claims if claim.get("supported")]
    unsupported = [claim for claim in claims if not claim.get("supported")]

    if not supported:
        return {
            "final_answer": _nothing_supported_message(unsupported),
            "citations": [],
        }

    # Renumber evidence references into a compact citation list.
    ref_map: dict[int, int] = {}
    for claim in supported:
        for ref in claim.get("evidence_refs") or []:
            if isinstance(ref, int) and 1 <= ref <= len(evidence) and ref not in ref_map:
                ref_map[ref] = len(ref_map) + 1

    sentences: list[str] = []
    for claim in supported:
        text = (claim.get("text") or "").strip()
        if not text:
            continue
        refs = [
            ref
            for ref in claim.get("evidence_refs") or []
            if isinstance(ref, int) and ref in ref_map
        ]
        markers = [f"[{ref_map[ref]}]" for ref in refs]
        sentences.append(_with_markers(text, markers))

    if not sentences:
        return {
            "final_answer": _nothing_supported_message(unsupported),
            "citations": [],
        }

    final_answer = " ".join(sentences) + _unsupported_note(unsupported)
    citations = [
        _citation(new_index, evidence[old_index - 1])
        for old_index, new_index in ref_map.items()
    ]

    return {"final_answer": final_answer, "citations": citations}
