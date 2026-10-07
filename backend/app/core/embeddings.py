"""Embedding factory: Google Gemini primary, Hugging Face local fallback.

Both return a LangChain `Embeddings` object, so callers use `.embed_documents`
and `.embed_query` the same way. The `embedding_dim` property lets the Qdrant
client size collections correctly.

Gemini's free tier caps embedding at ~100 requests/minute, so `embed_texts`
sends small batches with pacing + retry/backoff to avoid blowing the quota on
large documents.
"""

import logging
import time
from functools import lru_cache

from langchain_core.embeddings import Embeddings

from app.core.config import get_settings

logger = logging.getLogger("app.core.embeddings")

# Batch size kept well under the per-minute cap so a burst can't trip 429.
_EMBED_BATCH = 25
_MAX_RETRIES = 6


@lru_cache
def _gemini_embeddings() -> Embeddings:
    from langchain_google_genai import GoogleGenerativeAIEmbeddings

    settings = get_settings()
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is not set")
    return GoogleGenerativeAIEmbeddings(
        model=settings.gemini_embedding_model,
        google_api_key=settings.gemini_api_key,
    )


@lru_cache
def _hf_embeddings() -> Embeddings:
    from langchain_huggingface import HuggingFaceEmbeddings

    settings = get_settings()
    return HuggingFaceEmbeddings(model_name=settings.hf_embedding_model)


def get_embeddings() -> Embeddings:
    settings = get_settings()
    if settings.embedding_provider == "huggingface":
        return _hf_embeddings()
    return _gemini_embeddings()


def get_embedding_dim() -> int:
    """Vector size used to size Qdrant collections."""
    settings = get_settings()
    if settings.embedding_provider == "huggingface":
        return 384  # all-MiniLM-L6-v2
    return settings.gemini_embedding_dim


def _is_quota_error(exc: Exception) -> bool:
    msg = str(exc)
    return "429" in msg or "RESOURCE_EXHAUSTED" in msg or "quota" in msg.lower()


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Embed many texts in paced batches with retry/backoff on 429.

    Gemini free tier allows ~100 embedding requests/minute; embedding a whole
    contract in one shot can trip the limit. We batch, and on a quota error we
    wait and retry rather than failing the whole upload.
    """
    if not texts:
        return []
    emb = get_embeddings()
    out: list[list[float]] = []
    for start in range(0, len(texts), _EMBED_BATCH):
        batch = texts[start : start + _EMBED_BATCH]
        for attempt in range(_MAX_RETRIES):
            try:
                out.extend(emb.embed_documents(batch))
                break
            except Exception as exc:  # noqa: BLE001
                if not _is_quota_error(exc) or attempt == _MAX_RETRIES - 1:
                    raise
                wait = min(60, 5 * (2**attempt))
                logger.warning(
                    "embedding quota hit (batch %d), retrying in %ds",
                    start // _EMBED_BATCH,
                    wait,
                )
                time.sleep(wait)
        # Gentle pacing between batches to stay under the per-minute cap.
        if start + _EMBED_BATCH < len(texts):
            time.sleep(1.5)
    return out


def embed_query(text: str) -> list[float]:
    emb = get_embeddings()
    for attempt in range(_MAX_RETRIES):
        try:
            return emb.embed_query(text)
        except Exception as exc:  # noqa: BLE001
            if not _is_quota_error(exc) or attempt == _MAX_RETRIES - 1:
                raise
            time.sleep(min(30, 4 * (2**attempt)))
    return emb.embed_query(text)  # unreachable, satisfies type checkers
