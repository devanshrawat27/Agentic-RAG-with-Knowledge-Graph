"""Ingestion orchestrator: document -> chunks (Qdrant) + graph (Neo4j).

`prepare_document` does the fast, quota-independent work (load, chunk, embed).
`extract_document` does the slow LLM extraction and is meant to run in the
background so an upload returns promptly.
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

# Cap how many chunks we send to the LLM extractor per document. The free
# Gemini tier allows very few requests/day; raise once Ollama/paid key is used.
MAX_EXTRACT_CHUNKS = 8


def prepare_document(
    user_id: int,
    filename: str,
    data: bytes,
    doc_id: str | None = None,
) -> dict:
    """Load, chunk, and embed a document. Returns the chunk list + summary."""
    doc_id = doc_id or uuid.uuid4().hex[:12]
    text = load_document(filename, data)
    chunks = chunk_text(text)
    stored = embed_and_store(user_id, doc_id, filename, chunks) if chunks else 0
    return {"doc_id": doc_id, "chunks": chunks, "stored": stored}


def extract_document(
    user_id: int,
    doc_id: str,
    filename: str,
    chunks: list[str],
) -> dict:
    """Run LLM extraction over a document's chunks, writing to Neo4j."""
    if not chunks:
        return {"entities": 0, "relationships": 0, "extracted_chunks": 0, "quota_hit": False}
    ensure_schema()
    entity_total = 0
    rel_total = 0
    extracted = 0
    quota_hit = False
    for i, chunk in enumerate(chunks[:MAX_EXTRACT_CHUNKS]):
        try:
            result = extract_from_text(chunk)
        except ExtractionQuotaError as exc:
            logger.warning("extraction stopped (quota): %s", str(exc)[:160])
            quota_hit = True
            break
        stats = store_extraction(user_id, doc_id, f"{doc_id}:{i}", filename, result)
        entity_total += stats["entities"]
        rel_total += stats["relationships"]
        extracted += 1
    return {
        "entities": entity_total,
        "relationships": rel_total,
        "extracted_chunks": extracted,
        "quota_hit": quota_hit,
    }


def ingest_document(
    user_id: int,
    filename: str,
    data: bytes,
    doc_id: str | None = None,
) -> dict:
    """Synchronous full ingestion (load/chunk/embed/extract). Kept for tests."""
    prep = prepare_document(user_id, filename, data, doc_id)
    stats = extract_document(user_id, prep["doc_id"], filename, prep["chunks"])
    return {"doc_id": prep["doc_id"], "chunks": prep["stored"], **stats}
