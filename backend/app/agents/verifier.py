"""Verifier agent: checks every claim against retrieved evidence.

This is the project's core contribution. The node:

1. writes a draft answer from the retrieved evidence,
2. splits it into atomic claims (dropping refusals and citation markers),
3. verifies each claim against the evidence (one strict LLM judge call; a
   conservative lexical-overlap check if the judge is unavailable),
4. keeps supported claims and, when anything is unsupported, asks the graph to
   loop back to the Retriever with the unsupported claims as new queries.

The loop itself is bounded by the LangGraph router (`MAX_VERIFIER_LOOPS`); this
node only counts iterations so the router can stop it.
"""

import json
import logging
import re

from app.agents.graph_state import MAX_VERIFIER_LOOPS, AgentState
from app.core.llm import content_to_text, get_llm_with_fallback
from app.rag.retrieval import format_evidence

logger = logging.getLogger("app.agents.verifier")

MAX_CLAIMS = 10
MAX_REFINED_QUERIES = 4
MIN_CLAIM_CHARS = 8
LEXICAL_SUPPORT_RATIO = 0.6

_CITATION = re.compile(r"\[\d+(?:\s*,\s*\d+)*\]")
_SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+")
_BULLET_PREFIX = re.compile(r"^\s*(?:[-*•]|\d+[.)])\s*")
_FENCE = re.compile(r"^```(?:json)?\s*|\s*```$", re.IGNORECASE)
_SPACE_BEFORE_PUNCT = re.compile(r"\s+([.!?,;:])")
_REFUSAL = re.compile(
    r"(could(n't| not) find|not found in|no information|unable to find|"
    r"not mentioned|does not (state|contain|mention))",
    re.IGNORECASE,
)
_TOKEN = re.compile(r"[a-z0-9]+")

_STOPWORDS = {
    "the", "and", "for", "that", "with", "this", "from", "was", "were",
    "has", "have", "had", "are", "is", "its", "their", "they", "not", "but",
    "you", "your", "our", "can", "could", "would", "should", "into", "about",
    "which", "what", "who", "when", "where", "why", "how", "than", "then",
    "them", "there", "here", "also", "been", "being", "does", "did", "doing",
    "over", "under", "after", "before", "between", "during", "such", "only",
    "more", "most", "some", "any", "all", "each", "other", "will", "shall",
    "may", "might", "must", "per", "via",
}

_DRAFT_SYSTEM = (
    "You answer questions about enterprise documents using ONLY the supplied "
    "evidence. Write a short, factual answer (1-4 sentences). Attach an inline "
    "[n] citation to every factual sentence using the evidence numbers. Never "
    "add facts that are not in the evidence. If the evidence does not answer "
    "the question, say you could not find it in the documents."
)

_DRAFT_PROMPT = """Evidence:
{evidence}

Question: {question}

Answer using only the evidence above, with [n] citations:"""

_VERIFY_SYSTEM = (
    "You are a strict verifier. Given numbered evidence and a list of claims, "
    "decide for EACH claim whether the evidence explicitly supports it. Reject "
    "claims that are merely plausible, inferred, or not stated. Return ONLY a "
    'JSON array with one object per claim: {"claim": <claim number>, '
    '"supported": true|false, "evidence": [<evidence numbers>], '
    '"reason": "<short reason>"}.'
)

_VERIFY_PROMPT = """Question: {question}

Evidence:
{evidence}

Claims:
{claims}

JSON verdicts:"""


def _clean_claim(text: str) -> str:
    text = _CITATION.sub("", text)
    text = _SPACE_BEFORE_PUNCT.sub(r"\1", text)
    return " ".join(text.split()).strip(" -•*")


def _split_claims(draft: str) -> list[str]:
    """Split a draft answer into atomic claims, dropping refusals/citations."""
    claims: list[str] = []
    for line in draft.splitlines():
        line = _BULLET_PREFIX.sub("", line).strip()
        if not line:
            continue
        for piece in _SENTENCE_SPLIT.split(line):
            claim = _clean_claim(piece)
            if len(claim) < MIN_CLAIM_CHARS or _REFUSAL.search(claim):
                continue
            claims.append(claim)
            if len(claims) >= MAX_CLAIMS:
                return claims
    return claims


def _draft(question: str, evidence: list[dict]) -> str:
    llm = get_llm_with_fallback(temperature=0.0)
    prompt = _DRAFT_PROMPT.format(
        evidence=format_evidence(evidence), question=question or "N/A"
    )
    response = llm.invoke([("system", _DRAFT_SYSTEM), ("human", prompt)])
    return content_to_text(response.content).strip()


def _as_bool(value: object) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in {"true", "yes", "1", "supported"}
    return bool(value)


def _claim_index(item: dict, claims: list[str], position: int) -> int | None:
    value = item.get("claim", item.get("index", item.get("id")))
    if isinstance(value, int) and not isinstance(value, bool):
        return value - 1 if 1 <= value <= len(claims) else None
    if isinstance(value, str):
        text = value.strip()
        if text.isdigit():
            number = int(text)
            return number - 1 if 1 <= number <= len(claims) else None
        for index, claim in enumerate(claims):
            if claim.casefold() == text.casefold():
                return index
        for index, claim in enumerate(claims):
            if text.casefold() in claim.casefold():
                return index
    return position if position < len(claims) else None


def _unverified() -> dict:
    return {
        "supported": False,
        "evidence_refs": [],
        "reason": "not verified",
    }


def _parse_verification(
    raw: str, claims: list[str], evidence_count: int
) -> list[dict] | None:
    """Parse the judge's JSON array into one verdict per claim."""
    text = _FENCE.sub("", (raw or "").strip()).strip()
    data = None
    try:
        data = json.loads(text)
    except (ValueError, TypeError):
        data = None

    items = None
    if isinstance(data, list):
        items = data
    elif isinstance(data, dict):
        for key in ("claims", "results", "verdicts"):
            if isinstance(data.get(key), list):
                items = data[key]
                break
    if items is None:
        match = re.search(r"\[.*\]", text, re.DOTALL)
        if match:
            try:
                parsed = json.loads(match.group(0))
                if isinstance(parsed, list):
                    items = parsed
            except (ValueError, TypeError):
                pass

    if not items:
        return None

    verdicts = [_unverified() for _ in claims]
    for position, item in enumerate(items):
        if not isinstance(item, dict):
            continue
        index = _claim_index(item, claims, position)
        if index is None:
            continue

        supported = _as_bool(item.get("supported"))
        refs_raw = (
            item.get("evidence_refs")
            or item.get("evidence")
            or item.get("evidence_indices")
            or []
        )
        if isinstance(refs_raw, (int, str)):
            refs_raw = [refs_raw]

        refs: list[int] = []
        if isinstance(refs_raw, list):
            for ref in refs_raw:
                try:
                    number = int(ref)
                except (TypeError, ValueError):
                    continue
                if 1 <= number <= evidence_count and number not in refs:
                    refs.append(number)

        verdicts[index] = {
            "supported": supported,
            "evidence_refs": refs if supported else [],
            "reason": str(item.get("reason") or "")[:240],
        }

    return verdicts


def _tokens(text: str) -> set[str]:
    return {
        token
        for token in _TOKEN.findall((text or "").casefold())
        if len(token) >= 3 and token not in _STOPWORDS
    }


def _lexical_check(claims: list[str], evidence: list[dict]) -> list[dict]:
    """Conservative fallback when the LLM judge is unavailable."""
    evidence_tokens = [_tokens(item.get("text") or "") for item in evidence]
    verdicts: list[dict] = []
    for claim in claims:
        claim_tokens = _tokens(claim)
        best_ratio = 0.0
        best_index: int | None = None
        best_overlap = 0
        if claim_tokens:
            for index, tokens in enumerate(evidence_tokens, start=1):
                overlap = len(claim_tokens & tokens)
                ratio = overlap / len(claim_tokens)
                if ratio > best_ratio:
                    best_ratio = ratio
                    best_index = index
                    best_overlap = overlap

        supported = (
            best_index is not None
            and best_ratio >= LEXICAL_SUPPORT_RATIO
            and best_overlap >= min(2, len(claim_tokens))
        )
        verdicts.append(
            {
                "supported": supported,
                "evidence_refs": [best_index] if supported else [],
                "reason": f"lexical overlap {best_ratio:.2f}",
            }
        )
    return verdicts


def _verify_with_llm(
    question: str, claims: list[str], evidence: list[dict]
) -> list[dict] | None:
    llm = get_llm_with_fallback(temperature=0.0)
    numbered = "\n".join(
        f"{index}. {claim}" for index, claim in enumerate(claims, start=1)
    )
    prompt = _VERIFY_PROMPT.format(
        question=question or "N/A",
        evidence=format_evidence(evidence),
        claims=numbered,
    )
    response = llm.invoke([("system", _VERIFY_SYSTEM), ("human", prompt)])
    raw = content_to_text(response.content)
    return _parse_verification(raw, claims, len(evidence))


def _refine_queries(unsupported: list[dict], existing: list[str]) -> list[str]:
    queries: list[str] = []
    seen: set[str] = set()
    for claim in unsupported:
        text = (claim.get("text") or "").strip()
        key = text.casefold()
        if not text or key in seen:
            continue
        seen.add(key)
        queries.append(text)
        if len(queries) >= MAX_REFINED_QUERIES:
            break
    return queries or list(existing)[:MAX_REFINED_QUERIES]


def verify(state: AgentState) -> AgentState:
    evidence = list(state.get("evidence") or [])
    question = (state.get("question") or "").strip()

    if not evidence:
        return {"draft_answer": "", "claims": [], "needs_more_evidence": False}

    try:
        draft = _draft(question, evidence)
    except Exception as exc:  # noqa: BLE001 - fall back to no draft
        logger.warning("draft generation failed: %s", str(exc)[:200])
        draft = ""

    if not draft:
        return {"draft_answer": "", "claims": [], "needs_more_evidence": False}

    claim_texts = _split_claims(draft)
    if not claim_texts:
        return {"draft_answer": draft, "claims": [], "needs_more_evidence": False}

    verdicts = None
    try:
        verdicts = _verify_with_llm(question, claim_texts, evidence)
    except Exception as exc:  # noqa: BLE001 - fall back to lexical grounding
        logger.warning("claim verification failed: %s", str(exc)[:200])
    if verdicts is None:
        verdicts = _lexical_check(claim_texts, evidence)

    claims = [
        {
            "text": text,
            "supported": verdict["supported"],
            "evidence_refs": verdict["evidence_refs"],
            "reason": verdict["reason"],
        }
        for text, verdict in zip(claim_texts, verdicts)
    ]

    unsupported = [claim for claim in claims if not claim["supported"]]
    if not unsupported:
        return {
            "draft_answer": draft,
            "claims": claims,
            "needs_more_evidence": False,
        }

    # Only ask for another retrieval cycle while the router still allows one.
    current_loops = int(state.get("loop_count") or 0)
    if current_loops >= MAX_VERIFIER_LOOPS:
        return {
            "draft_answer": draft,
            "claims": claims,
            "needs_more_evidence": False,
        }

    return {
        "draft_answer": draft,
        "claims": claims,
        "needs_more_evidence": True,
        "sub_questions": _refine_queries(
            unsupported, state.get("sub_questions") or []
        ),
    }
