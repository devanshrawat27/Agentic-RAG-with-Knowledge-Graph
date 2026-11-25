"""Read-only snapshot of one user's knowledge graph for visualization.

The snapshot is intentionally shallow (nodes + typed edges, no chunk text) so
the graph page can render it directly. Every query is scoped by `user_id`; no
node or edge from another user can appear in the result.
"""

import logging

from app.db.neo4j_client import run_query

logger = logging.getLogger("app.db.graph_snapshot")

_NODES_QUERY = """
MATCH (n)
WHERE n.user_id = $user_id
RETURN labels(n) AS labels,
       n.id AS id,
       coalesce(n.name, n.title, '') AS name,
       coalesce(n.number, '') AS number,
       coalesce(n.summary, '') AS summary,
       coalesce(n.date, '') AS date
ORDER BY id
LIMIT $limit
"""

_EDGES_QUERY = """
MATCH (s)-[r]->(t)
WHERE s.user_id = $user_id
  AND t.user_id = $user_id
  AND ($include_mentions OR type(r) <> 'MENTIONS')
RETURN s.id AS source,
       t.id AS target,
       type(r) AS type,
       coalesce(r.doc_id, '') AS doc_id,
       coalesce(r.chunk_id, '') AS chunk_id
LIMIT $limit
"""


def _field(row: object, key: str):
    try:
        return row[key]  # type: ignore[index]
    except (KeyError, IndexError, TypeError):
        return None


def fetch_graph(
    user_id: int,
    limit: int = 300,
    include_mentions: bool = False,
) -> dict:
    """Return nodes + edges for one user. Raises if Neo4j is unreachable."""
    node_rows = run_query(_NODES_QUERY, user_id=user_id, limit=limit)
    edge_rows = run_query(
        _EDGES_QUERY,
        user_id=user_id,
        limit=limit,
        include_mentions=include_mentions,
    )

    nodes: list[dict] = []
    node_ids: set[str] = set()
    for row in node_rows:
        node_id = _field(row, "id")
        if not node_id:
            continue
        node_id = str(node_id)
        labels = [str(label) for label in (_field(row, "labels") or [])]
        name = (_field(row, "name") or "").strip()
        number = (_field(row, "number") or "").strip()
        nodes.append(
            {
                "id": node_id,
                "label": labels[0] if labels else "Entity",
                "labels": labels,
                "name": name or number or node_id,
                "number": number,
                "summary": _field(row, "summary") or "",
                "date": _field(row, "date") or "",
            }
        )
        node_ids.add(node_id)

    edges: list[dict] = []
    seen: set[str] = set()
    for row in edge_rows:
        source = _field(row, "source")
        target = _field(row, "target")
        if not source or not target:
            continue
        source, target = str(source), str(target)
        # A truncated node list can leave dangling endpoints; drop those links.
        if source not in node_ids or target not in node_ids:
            continue
        relation = _field(row, "type") or "RELATED"
        edge_id = f"{source}->{relation}->{target}"
        if edge_id in seen:
            continue
        seen.add(edge_id)
        edges.append(
            {
                "id": edge_id,
                "source": source,
                "target": target,
                "type": relation,
                "doc_id": _field(row, "doc_id") or "",
                "chunk_id": _field(row, "chunk_id") or "",
            }
        )

    return {
        "nodes": nodes,
        "edges": edges,
        "counts": {"nodes": len(nodes), "edges": len(edges)},
    }
