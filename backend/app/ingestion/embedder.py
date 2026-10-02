"""Embedder: turn chunk text into vectors and store them in Qdrant."""

from app.core.embeddings import embed_texts
from app.core.vectorstore import upsert_chunks


def embed_and_store(
    user_id: int,
    doc_id: str,
    filename: str,
    chunks: list[str],
) -> int:
    """Embed chunks and store them in the user's Qdrant collection."""
    if not chunks:
        return 0
    vectors = embed_texts(chunks)
    return upsert_chunks(user_id, doc_id, filename, chunks, vectors)
