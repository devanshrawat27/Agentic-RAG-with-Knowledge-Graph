"""PostgreSQL engine helper (relational metadata).

Phase 2 will add ORM models / migrations for document metadata.
"""

from functools import lru_cache

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine

from app.core.config import get_settings


@lru_cache
def get_engine() -> Engine:
    settings = get_settings()
    return create_engine(settings.sqlalchemy_url, pool_pre_ping=True)
