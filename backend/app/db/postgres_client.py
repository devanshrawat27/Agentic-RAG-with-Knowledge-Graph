"""PostgreSQL engine + session helpers (relational metadata, users, chats)."""

from functools import lru_cache

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings
from app.db.models import Base


@lru_cache
def get_engine() -> Engine:
    settings = get_settings()
    connect_args = {"connect_timeout": 3}
    return create_engine(
        settings.sqlalchemy_url,
        pool_pre_ping=True,
        connect_args=connect_args,
    )


@lru_cache
def get_session_factory() -> sessionmaker[Session]:
    return sessionmaker(bind=get_engine(), autoflush=False, expire_on_commit=False)


def get_db():
    """FastAPI dependency yielding a scoped session."""
    session = get_session_factory()()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def create_tables() -> None:
    """Create tables if they do not exist (dev convenience; use migrations later)."""
    Base.metadata.create_all(bind=get_engine())
    _apply_dev_migrations()


def _apply_dev_migrations() -> None:
    """Idempotent column adds for dev (no migration tool yet)."""
    from sqlalchemy import text

    statements = [
        "ALTER TABLE documents ADD COLUMN IF NOT EXISTS doc_id VARCHAR(32)",
        "ALTER TABLE documents ADD COLUMN IF NOT EXISTS entity_count INTEGER DEFAULT 0",
        "ALTER TABLE documents ADD COLUMN IF NOT EXISTS relationship_count INTEGER DEFAULT 0",
    ]
    with get_engine().begin() as conn:
        for stmt in statements:
            conn.execute(text(stmt))
