"""FastAPI application entry point."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings

logger = logging.getLogger("app.main")
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Best-effort table creation so the app can boot (and /health respond)
    # even when PostgreSQL is not yet running.
    try:
        from app.db.postgres_client import create_tables

        create_tables()
    except Exception as exc:  # pragma: no cover - environment dependent
        logger.warning("Skipping table creation (DB not reachable): %s", exc)
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="Agentic RAG with Knowledge Graph",
        description=(
            "Multi-agent retrieval-augmented generation over enterprise "
            "documents, with a knowledge graph and verification layer."
        ),
        version="0.1.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_base_url],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix="/api")
    return app


app = create_app()
