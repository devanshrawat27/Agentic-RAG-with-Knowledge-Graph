"""Qdrant vector store client + per-user collection helpers.

Chunks are stored in a per-user collection (`user_{user_id}_chunks`) so no
similarity search can ever cross user boundaries (see docs/DATA_MODEL.md).
"""

from functools import lru_cache

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams

from app.core.config import get_settings
from app.core.embeddings import get_embedding_dim


@lru_cache
def get_qdrant() -> QdrantClient:
    settings = get_settings()
    return QdrantClient(
        url=settings.qdrant_url,
        api_key=settings.qdrant_api_key or None,
    )


def collection_name(user_id: int) -> str:
    return f"user_{user_id}_chunks"


def ensure_collection(user_id: int) -> str:
    """Create the user's collection if missing; return its name."""
    client = get_qdrant()
    name = collection_name(user_id)
    if not client.collection_exists(name):
        client.create_collection(
            collection_name=name,
            vectors_config=VectorParams(
                size=get_embedding_dim(),
                distance=Distance.COSINE,
            ),
        )
    return name


def upsert_chunks(
    user_id: int,
    doc_id: str,
    filename: str,
    chunks: list[str],
    vectors: list[list[float]],
) -> int:
    """Store chunk vectors with metadata. Returns number of points written."""
    client = get_qdrant()
    name = ensure_collection(user_id)
    points = [
        PointStruct(
            id=_point_id(doc_id, i),
            vector=vector,
            payload={
                "user_id": user_id,
                "doc_id": doc_id,
                "chunk_id": f"{doc_id}:{i}",
                "chunk_index": i,
                "filename": filename,
                "text": text,
            },
        )
        for i, (text, vector) in enumerate(zip(chunks, vectors, strict=True))
    ]
    if points:
        client.upsert(collection_name=name, points=points)
    return len(points)


def search_chunks(user_id: int, query_vector: list[float], limit: int = 5) -> list[dict]:
    """Search only the user's collection. Returns text + provenance payloads."""
    client = get_qdrant()
    name = collection_name(user_id)
    if not client.collection_exists(name):
        return []
    result = client.query_points(
        collection_name=name,
        query=query_vector,
        limit=limit,
        with_payload=True,
    )
    return [
        {
            "text": hit.payload.get("text", ""),
            "doc_id": hit.payload.get("doc_id"),
            "chunk_id": hit.payload.get("chunk_id"),
            "filename": hit.payload.get("filename"),
            "score": hit.score,
            "source": "vector",
        }
        for hit in result.points
    ]


def delete_document(user_id: int, doc_id: str) -> None:
    from qdrant_client.models import FieldCondition, Filter, MatchValue

    client = get_qdrant()
    name = collection_name(user_id)
    if not client.collection_exists(name):
        return
    client.delete(
        collection_name=name,
        points_selector=Filter(
            must=[FieldCondition(key="doc_id", match=MatchValue(value=doc_id))]
        ),
    )


def _point_id(doc_id: str, index: int) -> int:
    """Deterministic positive integer point id from doc_id + chunk index."""
    import hashlib

    digest = hashlib.sha1(f"{doc_id}:{index}".encode("utf-8")).hexdigest()
    return int(digest[:15], 16)
