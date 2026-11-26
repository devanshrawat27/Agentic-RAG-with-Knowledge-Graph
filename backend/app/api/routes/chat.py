"""Chat endpoints: baseline RAG now persists chats + messages.

`POST /api/chat` answers a question (optionally continuing an existing chat by
`chat_id`) and stores both the user message and the assistant reply.
`GET /api/chats` lists a user's chats; `GET /api/chats/{id}` returns one with
its full message history.
"""

import json
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import Chat, Collection, Message, User
from app.db.postgres_client import get_db
from app.pipeline.graph import run_pipeline
from app.rag.baseline import answer_baseline, is_smalltalk
from app.schemas.chat import (
    ChatDetail,
    ChatRequest,
    ChatResponse,
    ChatSummary,
    MessageOut,
)

logger = logging.getLogger("app.api.chat")
router = APIRouter()


def _verified_result(
    user_id: int, question: str, top_k: int, doc_ids: list[str] | None = None
) -> dict:
    """Run the full Planner -> Retriever -> Verifier -> Answerer chain."""
    state = run_pipeline(question, user_id, top_k=top_k, doc_ids=doc_ids)
    return {
        "answer": (state.get("final_answer") or "").strip(),
        "citations": state.get("citations") or [],
        "mode": "verified",
        "claims": state.get("claims") or [],
        "sub_questions": state.get("sub_questions") or [],
        "loop_count": state.get("loop_count") or 0,
    }


def _title_from(question: str) -> str:
    q = " ".join(question.strip().split())
    return (q[:57] + "…") if len(q) > 58 else (q or "New chat")


@router.post("/chat", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    # Resolve or create the chat row (user-scoped).
    chat_row: Chat | None = None
    if payload.chat_id is not None:
        chat_row = db.get(Chat, payload.chat_id)
        if chat_row is None or chat_row.user_id != current.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found"
            )
    else:
        chat_row = Chat(user_id=current.id, title=_title_from(payload.question))
        db.add(chat_row)
        db.flush()  # assign id

    doc_ids: list[str] | None = None
    if payload.collection_id is not None:
        collection = db.get(Collection, payload.collection_id)
        if collection is None or collection.user_id != current.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Collection not found",
            )
        doc_ids = [
            document.doc_id
            for document in collection.documents
            if document.doc_id
        ]

    if payload.mode == "verified" and not is_smalltalk(payload.question):
        try:
            result = _verified_result(
                current.id, payload.question, payload.top_k, doc_ids=doc_ids
            )
        except Exception as exc:  # noqa: BLE001 - surface a clean API error
            logger.exception("verified pipeline failed")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="The verified pipeline failed. Please try again.",
            ) from exc
    else:
        result = answer_baseline(
            current.id,
            payload.question,
            top_k=payload.top_k,
            doc_ids=doc_ids,
        )
        if payload.mode == "verified":
            # Greetings/small talk are answered directly, not by the pipeline.
            result = {**result, "mode": "chat"}

    citations = result["citations"]
    chat_row.updated_at = datetime.now(timezone.utc)
    db.add(Message(chat_id=chat_row.id, role="user", content=payload.question))
    db.add(
        Message(
            chat_id=chat_row.id,
            role="assistant",
            content=result["answer"],
            citations_json=json.dumps(citations),
        )
    )
    db.flush()

    return {
        "answer": result["answer"],
        "citations": citations,
        "mode": result["mode"],
        "chat_id": chat_row.id,
        "claims": result.get("claims", []),
        "sub_questions": result.get("sub_questions", []),
        "loop_count": result.get("loop_count", 0),
        "collection_id": payload.collection_id,
    }


@router.get("/chats", response_model=list[ChatSummary])
def list_chats(
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Chat]:
    rows = db.scalars(
        select(Chat)
        .where(Chat.user_id == current.id)
        .order_by(Chat.updated_at.desc())
    ).all()
    return list(rows)


@router.get("/chats/{chat_id}", response_model=ChatDetail)
def get_chat(
    chat_id: int,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    chat_row = db.get(Chat, chat_id)
    if chat_row is None or chat_row.user_id != current.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found"
        )
    messages = [
        MessageOut(
            id=m.id,
            role=m.role,
            content=m.content,
            citations=json.loads(m.citations_json or "[]"),
            created_at=m.created_at,
        )
        for m in chat_row.messages
    ]
    return {
        "id": chat_row.id,
        "title": chat_row.title,
        "created_at": chat_row.created_at,
        "updated_at": chat_row.updated_at,
        "messages": messages,
    }


@router.delete("/chats/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat(
    chat_id: int,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    chat_row = db.get(Chat, chat_id)
    if chat_row is None or chat_row.user_id != current.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found"
        )
    db.delete(chat_row)
