"""Shared LangGraph state definition for the 4-agent pipeline.

Flow: Planner -> Retriever -> Verifier -> Answerer.
The Verifier may loop back to the Retriever if claims are unsupported.
"""

from typing import Annotated, Any, TypedDict

from langgraph.graph import add_messages

# Bound on Verifier -> Retriever cycles. Shared by the router and the Verifier
# so both agree on when to stop asking for more evidence.
MAX_VERIFIER_LOOPS = 2


class AgentState(TypedDict, total=False):
    # User input (user_id scopes every store lookup that a node performs)
    question: str
    user_id: int
    top_k: int
    # Planner output
    sub_questions: list[str]
    # Retriever output (hybrid: vector + graph)
    evidence: list[dict[str, Any]]
    # Verifier output: a draft produced from evidence, then checked claim by claim
    draft_answer: str
    claims: list[dict[str, Any]]  # each claim: text, supported, evidence_refs
    # Answerer output
    final_answer: str
    citations: list[dict[str, Any]]
    # Control flow
    messages: Annotated[list, add_messages]
    needs_more_evidence: bool
    loop_count: int  # verifier -> retriever cycles used (bounded by the graph)
