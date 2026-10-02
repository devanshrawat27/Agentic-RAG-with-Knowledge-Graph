"""Neo4j driver helper + schema setup (knowledge graph).

Every node carries `user_id`; typed edges carry `doc_id` + `chunk_id` for
provenance. Schema is locked v1 — see docs/GRAPH_SCHEMA.md.
"""

from functools import lru_cache

from neo4j import GraphDatabase

from app.core.config import get_settings

ENTITY_LABELS = [
    "Document",
    "Vendor",
    "Contract",
    "Clause",
    "Revision",
    "Violation",
    "Person",
    "Entity",
]


@lru_cache
def get_driver():
    settings = get_settings()
    return GraphDatabase.driver(
        settings.neo4j_uri,
        auth=(settings.neo4j_user, settings.neo4j_password),
    )


def close_driver() -> None:
    try:
        get_driver().close()
    except Exception:
        pass
    get_driver.cache_clear()


def run_query(query: str, **params):
    with get_driver().session() as session:
        return list(session.run(query, **params))


def ensure_schema() -> None:
    """Create uniqueness constraints + indexes (idempotent)."""
    with get_driver().session() as session:
        for label in ENTITY_LABELS:
            session.run(
                f"CREATE CONSTRAINT {label.lower()}_id_unique IF NOT EXISTS "
                f"FOR (n:{label}) REQUIRE n.id IS UNIQUE"
            )
            session.run(
                f"CREATE INDEX {label.lower()}_user_id IF NOT EXISTS "
                f"FOR (n:{label}) ON (n.user_id)"
            )
        session.run(
            "CREATE INDEX clause_number IF NOT EXISTS FOR (n:Clause) ON (n.number)"
        )


def verify_connectivity() -> bool:
    try:
        get_driver().verify_connectivity()
        return True
    except Exception:
        return False
