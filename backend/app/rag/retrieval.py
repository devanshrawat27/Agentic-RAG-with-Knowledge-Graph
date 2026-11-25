"""Retrieval for the agent pipeline.

`retrieve_vector` is the flat Qdrant half (also used by the baseline). The
hybrid retriever combines it with Neo4j graph facts via reciprocal rank fusion
(RRF), so a multi-hop question can surface both the source chunks and the
relationships that connect them. Every lookup is scoped to one `user_id`.
"""

import logging
import re

from app.core.embeddings import embed_query
from app.core.vectorstore import search_chunks
from app.rag.graph_retrieval import search_graph

logger = logging.getLogger("app.rag.retrieval")

# Drop weak nearest-neighbour matches (same threshold the baseline uses).
MIN_VECTOR_SCORE = 0.35
# RRF dampening constant from the original paper; keeps rank differences sane.
_RRF_K = 60

_STOPWORDS = {
    "which", "what", "who", "whom", "whose", "when", "where", "why", "how",
    "the", "a", "an", "and", "or", "but", "if", "then", "than", "that",
    "this", "these", "those", "is", "are", "was", "were", "be", "been",
    "being", "do", "does", "did", "has", "have", "had", "can", "could",
    "should", "would", "will", "shall", "may", "might", "in", "on", "at",
    "to", "for", "of", "by", "with", "from", "as", "into", "about", "any",
    "all", "each", "per", "not", "no", "yes", "it", "its", "their", "there",
    "here", "tell", "give", "show", "list", "please", "me", "my", "our",
    "your",
}

_QUOTED = re.compile(r'"([^"]{2,})"')
_CLAUSE_NUMBER = re.compile(r"\b\d+(?:\.\d+)+\b")
_YEAR = re.compile(r"\b(?:19|20)\d{2}\b")
_CAPITALIZED = re.compile(
    r"\b[A-Z][A-Za-z0-9&.'-]*(?:\s+[A-Z][A-Za-z0-9&.'-]*)*\b"
)


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


def _strip_leading_stopwords(phrase: str) -> str:
    words = phrase.split()
    while words and words[0].casefold().strip(".'-") in _STOPWORDS:
        words.pop(0)
    return " ".join(words)


def extract_terms(question: str, limit: int = 8) -> list[str]:
    """Pull entity-like terms (names, clause numbers, years) from a question.

    These are intentionally conservative: capitalized phrases plus explicit
    numbers/dates, so the graph lookup stays precise instead of matching every
    common word.
    """
    text = question or ""
    terms: list[str] = []
    seen: set[str] = set()

    def add(value: str) -> None:
        term = " ".join(value.split()).strip(" .,;:()[]")
        if len(term) < 2:
            return
        key = term.casefold()
        if key in seen or key in _STOPWORDS:
            return
        seen.add(key)
        terms.append(term)

    for match in _QUOTED.finditer(text):
        add(match.group(1))
    for match in _CLAUSE_NUMBER.finditer(text):
        add(match.group(0))
    for match in _YEAR.finditer(text):
        add(match.group(0))
    for match in _CAPITALIZED.finditer(text):
        add(_strip_leading_stopwords(match.group(0)))

    return terms[:limit]


def _evidence_key(item: dict) -> str:
    chunk_id = item.get("chunk_id")
    if chunk_id:
        return f"chunk:{chunk_id}"
    return f"text:{item.get('doc_id', '')}:{(item.get('text') or '')[:120]}"


def merge_rank(
    vector_items: list[dict],
    graph_items: list[dict],
    limit: int = 5,
) -> list[dict]:
    """Fuse both ranked lists with reciprocal rank fusion, deduped by chunk."""
    buckets: dict[str, dict] = {}

    def add(items: list[dict]) -> None:
        ranked = sorted(
            items, key=lambda item: item.get("score") or 0.0, reverse=True
        )
        for rank, item in enumerate(ranked, start=1):
            key = _evidence_key(item)
            bucket = buckets.get(key)
            if bucket is None:
                bucket = {
                    "text": item.get("text", ""),
                    "doc_id": item.get("doc_id"),
                    "chunk_id": item.get("chunk_id"),
                    "filename": item.get("filename"),
                    "score": 0.0,
                    "sources": [],
                    "facts": [],
                }
                buckets[key] = bucket
            bucket["score"] += 1.0 / (_RRF_K + rank)
            source = item.get("source", "unknown")
            if source not in bucket["sources"]:
                bucket["sources"].append(source)
            if source == "vector" and item.get("text"):
                # Real chunk text is better context than a generated fact line.
                bucket["text"] = item["text"]
                bucket["filename"] = item.get("filename") or bucket["filename"]
            elif source == "graph":
                if item.get("fact"):
                    bucket["facts"].append(item["fact"])
                bucket["doc_id"] = bucket["doc_id"] or item.get("doc_id")
                bucket["chunk_id"] = bucket["chunk_id"] or item.get("chunk_id")
                if not bucket["text"]:
                    bucket["text"] = item.get("text", "")

    add(vector_items)
    add(graph_items)

    ranked = sorted(buckets.values(), key=lambda b: b["score"], reverse=True)
    return ranked[:limit]


def retrieve_hybrid(
    user_id: int,
    queries: list[str],
    top_k: int = 5,
) -> list[dict]:
    """Vector + graph retrieval for one or more sub-questions."""
    clean_queries = [q.strip() for q in queries if q and q.strip()]
    if not clean_queries:
        return []

    vector_items: list[dict] = []
    for query in clean_queries:
        try:
            vector_items.extend(retrieve_vector(user_id, query, top_k=top_k))
        except Exception as exc:  # noqa: BLE001 - degrade instead of failing
            logger.warning("vector search failed: %s", str(exc)[:200])

    vector_items = [
        item
        for item in vector_items
        if item.get("score") is None or (item.get("score") or 0) >= MIN_VECTOR_SCORE
    ]

    terms = extract_terms(" ".join(clean_queries))
    graph_items = search_graph(user_id, terms, limit=top_k * 2)

    return merge_rank(vector_items, graph_items, limit=top_k)
