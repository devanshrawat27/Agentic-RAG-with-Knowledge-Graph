"""Chat endpoint: baseline flat RAG (stage 1 of the evaluation).

Later phases add graph-augmented and verified modes behind the same endpoint.
"""

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.db.models import User
from app.rag.baseline import answer_baseline
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter(prefix="/chat")


@router.post("", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    current: User = Depends(get_current_user),
) -> dict:
    if payload.mode not in {"baseline"}:
        # Only baseline exists so far; default to it rather than erroring.
        pass
    result = answer_baseline(
        current.id, payload.question, top_k=payload.top_k
    )
    return {
        "answer": result["answer"],
        "citations": result["citations"],
        "mode": result["mode"],
    }
