"""Ingestion orchestrator: document -> chunks (Qdrant) + graph (Neo4j).

Runs the full pipeline for one document, scoped to the owning user. Persists
extracted entities/relationships to Neo4j and chunk vectors to Qdrant.
"""

import logging
import uuid

from app.db.neo4j_client import ensure_schema
from app.ingestion.chunker import chunk_text
from app.ingestion.embedder import embed_and_store
from app.ingestion.extractor import (
    ExtractionQuotaError,
    extract_from_text,
    store_extraction,
)
from app.ingestion.loader import load_document

logger = logging.getLogger("app.ingestion.pipeline")

# Cap how many chunks we send to the LLM extractor for one document. The free
# Gemini tier allows very few requests/day, so keep this small by default;
# raise it via settings once a paid key / Ollama is used.
MAX_EXTRACT_CHUNKS = 8


def ingest_document(
    user_id: int,
    filename: str,
    data: bytes,
    doc_id: str | None = None,
) -> dict:
    """Ingest one document: embed all chunks, extract entities from a subset.

    Embedding always completes (cheap, quota-independent). Extraction stops
    early on quota errors and reports how many chunks were extracted.
    """
    doc_id = doc_id or uuid.uuid4().hex[:12]
    ensure_schema()

    text = load_document(filename, data)
    chunks = chunk_text(text)
    if not chunks:
        return {"doc_id": doc_id, "chunks": 0, "entities": 0,
                "relationships": 0, "extracted_chunks": 0, "quota_hit": False}

    stored = embed_and_store(user_id, doc_id, filename, chunks)

    entity_total = 0
    rel_total = 0
    extracted = 0
    quota_hit = False
    for i, chunk in enumerate(chunks[:MAX_EXTRACT_CHUNKS]):
        try:
            result = extract_from_text(chunk)
        except ExtractionQuotaError as exc:
            logger.warning("extraction stopped: LLM quota/rate limit hit: %s", str(exc)[:160])
            quota_hit = True
            break
        stats = store_extraction(user_id, doc_id, f"{doc_id}:{i}", filename, result)
        entity_total += stats["entities"]
        rel_total += stats["relationships"]
        extracted += 1

    return {
        "doc_id": doc_id,
        "chunks": stored,
        "entities": entity_total,
        "relationships": rel_total,
        "extracted_chunks": extracted,
        "quota_hit": quota_hit,
    }
