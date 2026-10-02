"""Verifier agent: checks each claim against retrieved evidence.

Core original contribution of the project. If any claim is unsupported,
sets `needs_more_evidence` to loop back to the Retriever.

Phase 2 implementation. Interface defined for the LangGraph pipeline.
"""

from app.agents.graph_state import AgentState


def verify(state: AgentState) -> AgentState:
    # TODO(phase-2): cross-check each claim against `evidence`.
    return {
        **state,
        "claims": state.get("claims", []),
        "needs_more_evidence": False,
    }
