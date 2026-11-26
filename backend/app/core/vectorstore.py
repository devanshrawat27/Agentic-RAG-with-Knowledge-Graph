"""Qdrant vector store client + per-user collection helpers.

Chunks are stored in a per-user collection (`user_{user_id}_chunks`) so no
similarity search can ever cross user boundaries (see docs/DATA_MODEL.md).
"""

from functools import lru_cache

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    FieldCondition,
    Filter,
    MatchAny,
    MatchValue,
    PointStruct,
    VectorParams,
)

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


def search_chunks(
    user_id: int,
    query_vector: list[float],
    limit: int = 5,
    doc_ids: list[str] | None = None,
) -> list[dict]:
    """Search only the user's collection. Returns text + provenance payloads.

    When `doc_ids` is provided, the search is restricted to those documents
    (used for collection-scoped chat). An empty list means "nothing in scope".
    """
    if doc_ids is not None and not doc_ids:
        return []

    client = get_qdrant()
    name = collection_name(user_id)
    if not client.collection_exists(name):
        return []

    query_filter = None
    if doc_ids is not None:
        query_filter = Filter(
            must=[
                FieldCondition(
                    key="doc_id",
                    match=MatchAny(any=list(doc_ids)),
                )
            ]
        )

    result = client.query_points(
        collection_name=name,
        query=query_vector,
        limit=limit,
        with_payload=True,
        query_filter=query_filter,
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


def get_chunk_context(
    user_id: int, chunk_id: str, context: int = 1
) -> list[dict]:
    """Return a chunk plus its neighbours, scoped to the user's collection."""
    if ":" not in chunk_id:
        return []
    doc_id, _, raw_index = chunk_id.rpartition(":")
    try:
        index = int(raw_index)
    except ValueError:
        return []
    if index < 0:
        return []

    client = get_qdrant()
    name = collection_name(user_id)
    if not client.collection_exists(name):
        return []

    start = max(0, index - context)
    ids = [_point_id(doc_id, i) for i in range(start, index + context + 1)]
    points = client.retrieve(collection_name=name, ids=ids, with_payload=True)

    chunks: list[dict] = []
    for point in points:
        payload = point.payload or {}
        payload_chunk_id = payload.get("chunk_id")
        if not payload_chunk_id:
            continue
        try:
            chunk_index = int(payload.get("chunk_index"))
        except (TypeError, ValueError):
            continue
        chunks.append(
            {
                "chunk_id": payload_chunk_id,
                "chunk_index": chunk_index,
                "doc_id": payload.get("doc_id"),
                "filename": payload.get("filename"),
                "text": payload.get("text") or "",
                "is_focus": payload_chunk_id == chunk_id,
            }
        )

    chunks.sort(key=lambda item: item["chunk_index"])
    if not any(chunk["is_focus"] for chunk in chunks):
        return []
    return chunks


def get_document_chunks(user_id: int, doc_id: str) -> list[dict]:
    """Return every stored chunk for one document, ordered by chunk index."""
    client = get_qdrant()
    name = collection_name(user_id)
    if not client.collection_exists(name):
        return []

    scroll_filter = Filter(
        must=[FieldCondition(key="doc_id", match=MatchValue(value=doc_id))]
    )
    chunks: list[dict] = []
    offset = None
    while True:
        points, offset = client.scroll(
            collection_name=name,
            scroll_filter=scroll_filter,
            limit=200,
            offset=offset,
            with_payload=True,
        )
        for point in points:
            payload = point.payload or {}
            chunk_id = payload.get("chunk_id")
            if not chunk_id:
                continue
            try:
                chunk_index = int(payload.get("chunk_index"))
            except (TypeError, ValueError):
                continue
            chunks.append(
                {
                    "chunk_id": chunk_id,
                    "chunk_index": chunk_index,
                    "doc_id": payload.get("doc_id"),
                    "filename": payload.get("filename"),
                    "text": payload.get("text") or "",
                    "is_focus": False,
                }
            )
        if offset is None:
            break

    chunks.sort(key=lambda item: item["chunk_index"])
    return chunks


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
