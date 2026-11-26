"""Embedding factory: rotating Gemini keys primary, Hugging Face fallback.

Like the chat model, embeddings rotate across all `GEMINI_API_KEYS`. A key that
hits quota is cooled down and the next one is used. Batches remain paced so the
free-tier per-minute cap is respected even with a single key.
"""

import logging
import time
from functools import lru_cache

from langchain_core.embeddings import Embeddings

from app.core.config import get_settings
from app.core.keypool import ApiKeyPool, is_quota_error

logger = logging.getLogger("app.core.embeddings")

# Batch size kept well under the per-minute cap so a burst can't trip 429.
_EMBED_BATCH = 25
_MAX_RETRIES = 6


class RotatingGeminiEmbeddings(Embeddings):
    """GoogleGenerativeAIEmbeddings with per-call API-key rotation."""

    def __init__(
        self,
        model_name: str,
        keys: list[str],
        cooldown_seconds: float = 60.0,
    ):
        self._model_name = model_name
        self._pool = ApiKeyPool(keys, cooldown_seconds=cooldown_seconds)

    def _run(self, call):
        from langchain_google_genai import GoogleGenerativeAIEmbeddings

        last_error: Exception | None = None
        for _ in range(len(self._pool)):
            key = self._pool.acquire()
            if key is None:
                break
            try:
                model = GoogleGenerativeAIEmbeddings(
                    model=self._model_name,
                    google_api_key=key,
                )
                result = call(model)
                self._pool.mark_ok(key)
                return result
            except Exception as exc:  # noqa: BLE001 - inspect quota errors
                if not is_quota_error(exc):
                    raise
                self._pool.mark_failed(key)
                last_error = exc

        if last_error is not None:
            raise last_error
        raise RuntimeError(
            "All Gemini API keys are cooling down; try again shortly"
        )

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return self._run(lambda model: model.embed_documents(texts))

    def embed_query(self, text: str) -> list[float]:
        return self._run(lambda model: model.embed_query(text))


@lru_cache
def _gemini_embeddings() -> Embeddings:
    settings = get_settings()
    keys = settings.all_gemini_api_keys
    if not keys:
        raise RuntimeError("GEMINI_API_KEY or GEMINI_API_KEYS is not set")
    return RotatingGeminiEmbeddings(
        model_name=settings.gemini_embedding_model,
        keys=keys,
        cooldown_seconds=settings.gemini_key_cooldown_seconds,
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
                if not is_quota_error(exc) or attempt == _MAX_RETRIES - 1:
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
            if not is_quota_error(exc) or attempt == _MAX_RETRIES - 1:
                raise
            time.sleep(min(30, 4 * (2**attempt)))
    return emb.embed_query(text)  # unreachable, satisfies type checkers
