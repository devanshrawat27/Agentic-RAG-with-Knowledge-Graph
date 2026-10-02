"""Health check endpoints."""

from fastapi import APIRouter

from app.core.config import get_settings

router = APIRouter()


@router.get("/health")
def health() -> dict:
    settings = get_settings()
    return {
        "status": "ok",
        "service": "agentic-rag-backend",
        "version": "0.1.0",
        "llm_configured": bool(settings.gemini_api_key),
        "embedding_provider": settings.embedding_provider,
    }
