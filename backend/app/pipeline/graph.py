"""LangGraph wiring for Planner -> Retriever -> Verifier -> Answerer.

The Verifier is allowed to send control back to the Retriever when claims are
not supported by the evidence. `MAX_VERIFIER_LOOPS` bounds that cycle so a
question that can never be grounded still terminates; the Answerer then marks
the remaining claims as unverified instead of inventing support.

Node behaviour lives in `app/agents/*`; this module only defines topology,
routing and the entry point.
"""

from functools import lru_cache

from langgraph.graph import END, START, StateGraph

from app.agents.answerer import answer
from app.agents.graph_state import MAX_VERIFIER_LOOPS, AgentState
from app.agents.planner import plan
from app.agents.retriever import retrieve
from app.agents.verifier import verify


def _route_after_verification(state: AgentState) -> str:
    """Loop back to the Retriever while evidence is missing, up to the cap."""
    if not state.get("needs_more_evidence"):
        return "answerer"
    if state.get("loop_count", 0) >= MAX_VERIFIER_LOOPS:
        return "answerer"
    return "retriever"


@lru_cache
def build_graph():
    """Compile the agent graph once and reuse it across requests."""
    graph = StateGraph(AgentState)

    graph.add_node("planner", plan)
    graph.add_node("retriever", retrieve)
    graph.add_node("verifier", verify)
    graph.add_node("answerer", answer)

    graph.add_edge(START, "planner")
    graph.add_edge("planner", "retriever")
    graph.add_edge("retriever", "verifier")
    graph.add_conditional_edges(
        "verifier",
        _route_after_verification,
        {"retriever": "retriever", "answerer": "answerer"},
    )
    graph.add_edge("answerer", END)

    return graph.compile()


def run_pipeline(question: str, user_id: int, top_k: int = 5) -> AgentState:
    """Run the full agent chain for one question, scoped to a single user."""
    state: AgentState = {
        "question": question,
        "user_id": user_id,
        "top_k": top_k,
        "loop_count": 0,
    }
    return build_graph().invoke(state)
