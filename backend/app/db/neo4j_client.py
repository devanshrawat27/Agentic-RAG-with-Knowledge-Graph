"""Neo4j driver helper (knowledge graph).

Phase 2 will add schema creation + graph traversal helpers here.
"""

from functools import lru_cache

from neo4j import GraphDatabase

from app.core.config import get_settings


@lru_cache
def get_driver():
    settings = get_settings()
    driver = GraphDatabase.driver(
        settings.neo4j_uri,
        auth=(settings.neo4j_user, settings.neo4j_password),
    )
    return driver
