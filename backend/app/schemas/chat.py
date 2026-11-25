"""Request/response schemas for the chat / RAG endpoints."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)
    top_k: int = Field(default=5, ge=1, le=20)
    # "baseline" = flat vector RAG (stage 1); "verified" = full agent pipeline.
    mode: Literal["baseline", "verified"] = "baseline"
    chat_id: int | None = Field(default=None)  # continue an existing chat


class Citation(BaseModel):
    index: int
    doc_id: str | None = None
    chunk_id: str | None = None
    filename: str | None = None
    snippet: str = ""
    score: float | None = None


class Claim(BaseModel):
    text: str
    supported: bool
    evidence_refs: list[int] = Field(default_factory=list)
    reason: str = ""


class ChatResponse(BaseModel):
    answer: str
    citations: list[Citation] = Field(default_factory=list)
    mode: str
    chat_id: int
    claims: list[Claim] = Field(default_factory=list)
    sub_questions: list[str] = Field(default_factory=list)
    loop_count: int = 0


class ChatSummary(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime


class MessageOut(BaseModel):
    id: int
    role: str
    content: str
    citations: list[Citation] = Field(default_factory=list)
    created_at: datetime


class ChatDetail(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    messages: list[MessageOut] = Field(default_factory=list)
