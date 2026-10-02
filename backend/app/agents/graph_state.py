"""Shared LangGraph state definition for the 4-agent pipeline.

Flow: Planner -> Retriever -> Verifier -> Answerer.
The Verifier may loop back to the Retriever if claims are unsupported.
"""

from typing import Annotated, Any, TypedDict

from langgraph.graph import add_messages


class AgentState(TypedDict, total=False):
    # User input
    question: str
    # Planner output
    sub_questions: list[str]
    # Retriever output (hybrid: vector + graph)
    evidence: list[dict[str, Any]]
    # Verifier output
    draft_answer: str
    claims: list[dict[str, Any]]  # each claim: text, supported, evidence_refs
    # Answerer output
    final_answer: str
    citations: list[dict[str, Any]]
    # Control flow
    messages: Annotated[list, add_messages]
    needs_more_evidence: bool
