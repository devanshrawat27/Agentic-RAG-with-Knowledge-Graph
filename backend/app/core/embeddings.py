"""Embedding factory: Google Gemini primary, Hugging Face local fallback.

Both return a LangChain `Embeddings` object, so callers use `.embed_documents`
and `.embed_query` the same way. The `embedding_dim` property lets the Qdrant
client size collections correctly.
"""

from functools import lru_cache

from langchain_core.embeddings import Embeddings

from app.core.config import get_settings


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


def embed_texts(texts: list[str]) -> list[list[float]]:
    return get_embeddings().embed_documents(texts)


def embed_query(text: str) -> list[float]:
    return get_embeddings().embed_query(text)
