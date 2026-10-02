"""Answerer agent: writes the final answer using only verified claims.

Phase 2 implementation. Interface defined for the LangGraph pipeline.
"""

from app.agents.graph_state import AgentState


def answer(state: AgentState) -> AgentState:
    # TODO(phase-2): compose final_answer from verified claims + citations.
    return {
        **state,
        "final_answer": state.get("draft_answer", ""),
        "citations": state.get("citations", []),
    }
