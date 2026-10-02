"""Vector retrieval over a user's Qdrant collection.

This is the flat (no-graph) retriever used by the baseline RAG and later as one
half of the hybrid retriever in the agent pipeline.
"""

from app.core.embeddings import embed_query
from app.core.vectorstore import search_chunks


def retrieve_vector(user_id: int, query: str, top_k: int = 5) -> list[dict]:
    """Return the top-k relevant chunks for a user, scoped to them only."""
    if not query.strip():
        return []
    vector = embed_query(query)
    return search_chunks(user_id, vector, limit=top_k)


def format_evidence(evidence: list[dict]) -> str:
    """Render retrieved chunks as a numbered context block for the LLM."""
    lines: list[str] = []
    for i, item in enumerate(evidence, start=1):
        source = item.get("filename") or item.get("doc_id") or "source"
        lines.append(f"[{i}] ({source})\n{item.get('text', '')}")
    return "\n\n".join(lines)
