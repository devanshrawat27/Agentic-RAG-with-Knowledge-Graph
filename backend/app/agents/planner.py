"""Planner agent: breaks a complex question into sub-questions.

Phase 2 implementation. Interface defined for the LangGraph pipeline.
"""

from app.agents.graph_state import AgentState


def plan(state: AgentState) -> AgentState:
    # TODO(phase-2): use LLM to decompose `question` into sub-questions.
    question = state.get("question", "")
    return {**state, "sub_questions": [question]}
