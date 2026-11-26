"""Request/response schemas for collections."""

from datetime import datetime

from pydantic import BaseModel, Field


class CollectionCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str = Field(default="", max_length=500)


class CollectionUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=500)


class CollectionDocumentAdd(BaseModel):
    document_id: int


class CollectionDocumentOut(BaseModel):
    id: int
    filename: str
    status: str
    chunk_count: int
    entity_count: int
    relationship_count: int
    created_at: datetime | None = None


class CollectionOut(BaseModel):
    id: int
    name: str
    description: str
    document_count: int
    created_at: datetime
    updated_at: datetime


class CollectionDetail(CollectionOut):
    documents: list[CollectionDocumentOut] = Field(default_factory=list)
