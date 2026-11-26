"""Health check endpoints."""

from fastapi import APIRouter

from app.core.config import get_settings

router = APIRouter()


@router.get("/health")
def health() -> dict:
    settings = get_settings()
    keys = settings.all_gemini_api_keys
    return {
        "status": "ok",
        "service": "agentic-rag-backend",
        "version": "0.1.0",
        "llm_configured": bool(keys),
        "llm_key_count": len(keys),
        "embedding_provider": settings.embedding_provider,
    }
