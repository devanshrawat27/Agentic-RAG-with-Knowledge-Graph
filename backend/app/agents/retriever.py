"""Retriever agent: hybrid search over the user's vector + graph stores."""

import logging

from app.agents.graph_state import AgentState
from app.rag.retrieval import retrieve_hybrid

logger = logging.getLogger("app.agents.retriever")


def retrieve(state: AgentState) -> AgentState:
    question = (state.get("question") or "").strip()
    user_id = state.get("user_id")
    if not question or user_id is None:
        return {"evidence": [], "needs_more_evidence": False}

    queries = state.get("sub_questions") or [question]
    top_k = state.get("top_k") or 5

    try:
        evidence = retrieve_hybrid(
            user_id,
            queries,
            top_k=top_k,
            doc_ids=state.get("doc_ids"),
        )
    except Exception as exc:  # noqa: BLE001 - never break the agent chain
        logger.warning("hybrid retrieval failed: %s", str(exc)[:200])
        evidence = []

    # A retrieval run requested by the Verifier is a verification loop.
    loop_count = int(state.get("loop_count") or 0)
    if state.get("needs_more_evidence"):
        loop_count += 1

    return {
        "evidence": evidence,
        "needs_more_evidence": False,
        "loop_count": loop_count,
    }
