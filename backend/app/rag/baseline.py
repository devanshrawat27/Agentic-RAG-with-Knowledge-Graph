"""Baseline flat RAG: retrieve chunks and answer with inline citations.

This is stage 1 of the three-stage evaluation (flat RAG -> graph RAG ->
verified graph RAG). It deliberately uses only vector retrieval, no graph, no
Verifier, so its output is the baseline to compare against.
"""

import logging

from app.core.llm import content_to_text, get_llm_with_fallback
from app.rag.retrieval import format_evidence, retrieve_vector

logger = logging.getLogger("app.rag.baseline")

_SYSTEM = (
    "You are a helpful assistant answering questions about enterprise documents. "
    "Use ONLY the provided context. If the context does not contain the answer, "
    "say you could not find it. Cite sources inline with [n] markers matching "
    "the context items. Be concise."
)

_PROMPT = """Context:
{context}

Question: {question}

Answer using only the context above, with [n] citations:"""


def answer_baseline(
    user_id: int,
    question: str,
    top_k: int = 5,
    temperature: float = 0.0,
) -> dict:
    evidence = retrieve_vector(user_id, question, top_k=top_k)
    if not evidence:
        return {
            "answer": "I could not find any relevant documents in your workspace.",
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
