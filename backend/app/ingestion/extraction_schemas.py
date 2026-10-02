"""Extraction schemas: what the LLM returns per chunk.

Locked to the graph schema in docs/GRAPH_SCHEMA.md — the extractor may only
emit these labels and relationship types.
"""

from typing import Literal

from pydantic import BaseModel, Field

EntityLabel = Literal[
    "Vendor",
    "Contract",
    "Clause",
    "Revision",
    "Violation",
    "Person",
    "Entity",
]

RelationshipType = Literal[
    "SIGNED",
    "CONTAINS",
    "HAS_REVISION",
    "REVISES",
    "COMMITTED",
    "BREACHED",
    "MENTIONS",
]


class ExtractedEntity(BaseModel):
    label: EntityLabel
    name: str = Field(description="Canonical name of the entity")
    # Optional type-specific fields; omit when unknown.
    number: str | None = Field(default=None, description="Clause number, e.g. 4.2")
    date: str | None = Field(default=None, description="ISO date if known")
    summary: str | None = Field(default=None, description="Short description")


class ExtractedRelationship(BaseModel):
    type: RelationshipType
    source: str = Field(description="Name of the source entity")
    target: str = Field(description="Name of the target entity")
    change_summary: str | None = Field(default=None, description="For REVISES")


class ExtractionResult(BaseModel):
    entities: list[ExtractedEntity] = Field(default_factory=list)
    relationships: list[ExtractedRelationship] = Field(default_factory=list)
