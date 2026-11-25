"""Graph-side retrieval: find user-owned facts connected to query terms.

Given terms extracted from the question (entity names, clause numbers, years),
we match starting nodes inside the user's graph and expand one hop to collect
the relationships that make multi-hop answers possible. Every query is scoped
by `user_id`, and every fact keeps the `doc_id` + `chunk_id` recorded on its
edge so the answer can cite the source chunk.
"""

import logging

from app.db.neo4j_client import run_query

logger = logging.getLogger("app.rag.graph_retrieval")

_GRAPH_QUERY = """
MATCH (n)
WHERE n.user_id = $user_id
  AND any(term IN $terms WHERE
        toLower(coalesce(n.name, '')) CONTAINS toLower(term)
        OR toLower(coalesce(n.number, '')) = toLower(term)
        OR toLower(coalesce(n.title, '')) CONTAINS toLower(term)
        OR toLower(coalesce(n.date, '')) CONTAINS toLower(term))
MATCH (n)-[r]-(m)
WHERE m.user_id = $user_id
RETURN labels(n) AS source_labels,
       coalesce(n.name, n.title, '') AS source_name,
       coalesce(n.number, '') AS source_number,
       n.id AS source_id,
       type(r) AS rel,
       labels(m) AS target_labels,
       coalesce(m.name, m.title, '') AS target_name,
       coalesce(m.number, '') AS target_number,
       m.id AS target_id,
       coalesce(r.doc_id, '') AS doc_id,
       coalesce(r.chunk_id, '') AS chunk_id,
       startNode(r) = n AS outgoing
LIMIT $limit
"""


def _field(row: object, key: str):
    try:
        return row[key]  # type: ignore[index]
    except (KeyError, IndexError, TypeError):
        return None


def _display(labels, name, number) -> str:
    label = labels[0] if labels else "Entity"
    value = (name or "").strip() or (number or "").strip()
    return f"{label} {value}".strip()


def _score(terms: list[str], row: object) -> float:
    haystack = " ".join(
        str(_field(row, key) or "")
        for key in ("source_name", "target_name", "source_number", "target_number")
    ).casefold()
    hits = sum(1 for term in terms if term.casefold() in haystack)
    return round(min(0.95, 0.6 + 0.1 * hits), 3)


def search_graph(user_id: int, terms: list[str], limit: int = 10) -> list[dict]:
    """Return one-hop facts around user-owned nodes matching `terms`."""
    cleaned = [t.strip() for t in terms if t and t.strip()]
    if not cleaned:
        return []

    try:
        rows = run_query(
            _GRAPH_QUERY, user_id=user_id, terms=cleaned, limit=limit
        )
    except Exception as exc:  # noqa: BLE001 - graph store must not break the run
        logger.warning("graph search failed: %s", str(exc)[:200])
        return []

    facts: list[dict] = []
    seen: set[tuple] = set()
    for row in rows:
        source_id = _field(row, "source_id")
        target_id = _field(row, "target_id")
        relation = _field(row, "rel") or ""
        chunk_id = _field(row, "chunk_id") or ""
        key = (relation, source_id, target_id, chunk_id)
        if key in seen:
            continue
        seen.add(key)

        source = _display(
            _field(row, "source_labels"),
            _field(row, "source_name"),
            _field(row, "source_number"),
        )
        target = _display(
            _field(row, "target_labels"),
            _field(row, "target_name"),
            _field(row, "target_number"),
        )
        facts.append(
            {
                "text": f"{source} -[{relation}]-> {target}",
                "doc_id": _field(row, "doc_id") or None,
                "chunk_id": chunk_id or None,
                "filename": None,
                "score": _score(cleaned, row),
                "source": "graph",
                "fact": {
                    "source": source,
                    "relation": relation,
                    "target": target,
                },
            }
        )

    facts.sort(key=lambda fact: fact["score"], reverse=True)
    return facts[:limit]
