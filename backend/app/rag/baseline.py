"""Baseline flat RAG: retrieve chunks and answer with inline citations.

This is stage 1 of the three-stage evaluation (flat RAG -> graph RAG ->
verified graph RAG). It deliberately uses only vector retrieval, no graph, no
Verifier, so its output is the baseline to compare against.
"""

import logging
import re

from app.core.llm import content_to_text, get_llm_with_fallback
from app.rag.retrieval import format_evidence, retrieve_vector

logger = logging.getLogger("app.rag.baseline")

_SYSTEM = (
    "You are TrueDocs, a helpful assistant for enterprise documents "
    "(contracts, policies, compliance records). "
    "When context is provided, answer ONLY from that context and cite sources "
    "inline with [n] markers matching the context items. "
    "If the context does not contain the answer, say you could not find it in their documents. "
    "If the user is just greeting you or making small talk (no document question), "
    "reply naturally and briefly, and invite them to ask about their documents. Be concise."
)

_PROMPT = """Context:
{context}

Question: {question}

Answer the question. If it is a greeting or small talk, respond naturally. Otherwise use only the context above, with [n] citations:"""

# Small-talk / greeting detection — these should never trigger a forced,
# citation-only answer. Matched against the trimmed question.
# A message is small talk if EVERY word is a greeting/filler/thanks word
# (so "ok thanks", "hey there", "hi bro" all match) and it is short.
_FILLER_WORDS = {
    "hi", "hii", "hiii", "hey", "heyy", "hello", "helo", "yo", "sup", "hola",
    "namaste", "morning", "afternoon", "evening", "good", "thanks", "thank",
    "you", "thx", "tysm", "bye", "goodbye", "ok", "okay", "k", "cool", "great",
    "nice", "bro", "buddy", "friend", "there", "and", "so", "the",
}

_SMALLTALK_PHRASES = re.compile(
    r"^(who\s+are\s+you|what\s+are\s+you|what\s+can\s+you\s+do|"
    r"what\s+do\s+you\s+do|how\s+are\s+you|what'?s\s+up|help\s*me?\s*)\b[\s!.?]*$",
    re.IGNORECASE,
)


def _is_smalltalk(question: str) -> bool:
    q = question.strip()
    if not q:
        return False
    if _SMALLTALK_PHRASES.match(q):
        return True
    words = [w for w in re.findall(r"[a-z']+", q.lower())]
    # Short message made up entirely of greetings/fillers → small talk.
    if 0 < len(words) <= 5 and all(w in _FILLER_WORDS for w in words):
        return True
    return False


# Minimum cosine similarity for a chunk to count as real evidence. Below this
# the "match" is only a nearest-neighbour artefact (e.g. greeting queries still
# return *some* chunk), so we treat it as no relevant evidence.
_MIN_SCORE = 0.35


def _as_chat(question: str, user_id: int, temperature: float) -> dict:
    """Answer small talk / greetings without forcing document grounding."""
    llm = get_llm_with_fallback(temperature=temperature)
    try:
        response = llm.invoke([("system", _SYSTEM), ("human", question)])
        answer = content_to_text(response.content).strip()
    except Exception as exc:  # noqa: BLE001
        logger.warning("baseline LLM (chat) failed: %s", str(exc)[:200])
        answer = "Hi! Ask me anything about your uploaded documents and I'll answer with sources."
    return {
        "answer": answer,
        "citations": [],
        "evidence": [],
        "mode": "baseline",
    }


def answer_baseline(
    user_id: int,
    question: str,
    top_k: int = 5,
    temperature: float = 0.0,
) -> dict:
    # Greetings / small talk never need retrieval — answer them directly.
    if _is_smalltalk(question):
        return _as_chat(question, user_id, temperature)

    evidence = retrieve_vector(user_id, question, top_k=top_k)
    # Drop weak nearest-neighbour matches so unrelated questions don't get
    # answered from whatever chunk happens to be closest.
    evidence = [
        item
        for item in evidence
        if item.get("score") is None or item.get("score", 0) >= _MIN_SCORE
    ]

    if not evidence:
        return {
            "answer": (
                "I couldn't find anything relevant in your documents for that. "
                "Try rephrasing, or upload the document that covers it."
            ),
            "citations": [],
            "evidence": [],
            "mode": "baseline",
        }

    prompt = _PROMPT.format(context=format_evidence(evidence), question=question)
    llm = get_llm_with_fallback(temperature=temperature)
    try:
        response = llm.invoke([("system", _SYSTEM), ("human", prompt)])
        answer = content_to_text(response.content).strip()
    except Exception as exc:  # noqa: BLE001
        logger.warning("baseline LLM failed: %s", str(exc)[:200])
        answer = "LLM unavailable, but here are the most relevant passages."

    citations = [
        {
            "index": i,
            "doc_id": item.get("doc_id"),
            "chunk_id": item.get("chunk_id"),
            "filename": item.get("filename"),
            "snippet": (item.get("text") or "")[:240],
            "score": item.get("score"),
        }
        for i, item in enumerate(evidence, start=1)
    ]

    return {
        "answer": answer,
        "citations": citations,
        "evidence": evidence,
        "mode": "baseline",
    }
