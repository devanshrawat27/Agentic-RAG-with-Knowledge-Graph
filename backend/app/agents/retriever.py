"""Retriever agent: hybrid search (vector + graph traversal).

Phase 2 implementation. Interface defined for the LangGraph pipeline.
"""

from app.agents.graph_state import AgentState


def retrieve(state: AgentState) -> AgentState:
    # TODO(phase-2): combine Qdrant vector similarity + Neo4j graph traversal.
    evidence = state.get("evidence", [])
    return {**state, "evidence": evidence, "needs_more_evidence": False}
