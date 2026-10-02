"""Entity/relationship extractor: LLM prompts -> structured graph -> Neo4j.

For each chunk the LLM returns entities and relationships restricted to the
locked schema (docs/GRAPH_SCHEMA.md). We then write them to Neo4j, tagging
every node/edge with `user_id`, `doc_id`, and `chunk_id` for provenance.
"""

import json
import logging

from app.core.llm import content_to_text, get_llm
from app.db.neo4j_client import get_driver
from app.ingestion.extraction_schemas import (
    ExtractedEntity,
    ExtractedRelationship,
    ExtractionResult,
)

logger = logging.getLogger("app.ingestion.extractor")

_ALLOWED_LABELS = {
    "Vendor",
    "Contract",
    "Clause",
    "Revision",
    "Violation",
    "Person",
    "Entity",
}
_ALLOWED_RELS = {
    "SIGNED",
    "CONTAINS",
    "HAS_REVISION",
    "REVISES",
    "COMMITTED",
    "BREACHED",
    "MENTIONS",
}

_PROMPT = """You extract structured knowledge from legal/business document text.

Return ONLY JSON with this exact shape:
{{
  "entities": [
    {{"label": "<one of: Vendor, Contract, Clause, Revision, Violation, Person, Entity>",
      "name": "<unique canonical name>",
      "number": "<clause number if a Clause, else omit>",
      "date": "<ISO date if known, else omit>",
      "summary": "<short description, optional>"}}
  ],
  "relationships": [
    {{"type": "<one of: SIGNED, CONTAINS, HAS_REVISION, REVISES, COMMITTED, BREACHED, MENTIONS>",
      "source": "<entity name>", "target": "<entity name>",
      "change_summary": "<for REVISES only, else omit>"}}
  ]
}}

Rules:
- Use ONLY the labels and relationship types listed above. Never invent new ones.
- Relationship directions: SIGNED Vendor->Contract; CONTAINS Contract->Clause;
  HAS_REVISION Contract->Revision; REVISES Revision->Clause;
  COMMITTED Vendor->Violation; BREACHED Violation->Clause; MENTIONS Document->entity.
- If something is mentioned but does not fit a typed label, use "Entity".
- Extract real parties, defined terms, numbered clauses, dates, breaches.
- Prefer fewer, high-confidence items over guesses.

TEXT:
{text}
"""


class ExtractionQuotaError(RuntimeError):
    """Raised when the LLM provider is rate-limited / out of quota."""


def extract_from_text(text: str) -> ExtractionResult:
    """Run the LLM on a chunk and parse the JSON (best-effort).

    Raises ExtractionQuotaError on 429/quota so the pipeline can stop early
    instead of hammering a rate-limited endpoint.
    """
    llm = get_llm(temperature=0.0)
    prompt = _PROMPT.format(text=text[:6000])
    try:
        response = llm.invoke(prompt)
        raw = content_to_text(response.content)
        return _parse(raw)
    except Exception as exc:  # noqa: BLE001
        message = str(exc)
        if "429" in message or "RESOURCE_EXHAUSTED" in message or "quota" in message.lower():
            raise ExtractionQuotaError(message) from exc
        logger.warning("extraction failed: %s", message[:200])
        return ExtractionResult()


def _parse(raw: str) -> ExtractionResult:
    data = _extract_json(raw)
    if not data:
        return ExtractionResult()
    entities = [
        ExtractedEntity(**e)
        for e in data.get("entities", [])
        if isinstance(e, dict) and e.get("label") in _ALLOWED_LABELS and e.get("name")
    ]
    relationships = [
        ExtractedRelationship(**r)
        for r in data.get("relationships", [])
        if isinstance(r, dict) and r.get("type") in _ALLOWED_RELS and r.get("source") and r.get("target")
    ]
    return ExtractionResult(entities=entities, relationships=relationships)


def _extract_json(raw: str) -> dict | None:
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```", 2)[1]
        if raw.startswith("json"):
            raw = raw[4:]
    start = raw.find("{")
    end = raw.rfind("}")
    if start == -1 or end == -1:
        return None
    try:
        return json.loads(raw[start : end + 1])
    except json.JSONDecodeError:
        return None


def store_extraction(
    user_id: int,
    doc_id: str,
    chunk_id: str,
    filename: str,
    result: ExtractionResult,
) -> dict:
    """Write extracted entities/relationships to Neo4j, scoped by user.

    Entities are MERGEd by (label, name, user_id) to avoid duplicates across
    chunks. Relationships are written between matched nodes.
    """
    if not result.entities and not result.relationships:
        return {"entities": 0, "relationships": 0}

    with get_driver().session() as session:
        session.execute_write(_write_document, user_id, doc_id, filename, chunk_id)
        entity_ids: list[str] = []
        for entity in result.entities:
            eid = session.execute_write(_write_entity, user_id, entity)
            entity_ids.append(eid)
        # Provenance: every extracted entity is MENTIONed by its source document.
        for eid in entity_ids:
            session.execute_write(_write_mentions, user_id, doc_id, eid, chunk_id)
        rel_count = 0
        for rel in result.relationships:
            if rel.type == "MENTIONS":
                continue  # handled automatically above
            session.execute_write(_write_relationship, user_id, rel, doc_id, chunk_id)
            rel_count += 1

    return {"entities": len(result.entities), "relationships": rel_count}


def _write_document(tx, user_id: int, doc_id: str, filename: str, chunk_id: str):
    tx.run(
        """
        MERGE (d:Document {id: $doc_id, user_id: $user_id})
        SET d.title = coalesce(d.title, $filename),
            d.doc_type = coalesce(d.doc_type, 'contract')
        """,
        doc_id=doc_id,
        user_id=user_id,
        filename=filename,
    )


def _write_entity(tx, user_id: int, entity: ExtractedEntity) -> str:
    eid = _entity_id(user_id, entity.label, entity.name)
    extra = {}
    if entity.number is not None:
        extra["number"] = entity.number
    if entity.date is not None:
        extra["date"] = entity.date
    if entity.summary is not None:
        extra["summary"] = entity.summary
    tx.run(
        f"""
        MERGE (e:{entity.label} {{id: $id}})
        SET e.user_id = $user_id, e.name = $name,
            e += $extra
        """,
        id=eid,
        user_id=user_id,
        name=entity.name,
        extra=extra,
    )
    return eid


def _write_mentions(tx, user_id: int, doc_id: str, entity_id: str, chunk_id: str):
    tx.run(
        """
        MATCH (d:Document {id: $doc_id, user_id: $user_id})
        MATCH (e {id: $entity_id, user_id: $user_id})
        MERGE (d)-[r:MENTIONS]->(e)
        SET r.user_id = $user_id, r.doc_id = $doc_id, r.chunk_id = $chunk_id
        """,
        doc_id=doc_id,
        user_id=user_id,
        entity_id=entity_id,
        chunk_id=chunk_id,
    )


def _write_relationship(tx, user_id: int, rel: ExtractedRelationship, doc_id: str, chunk_id: str):
    props = {"user_id": user_id, "doc_id": doc_id, "chunk_id": chunk_id}
    if rel.change_summary:
        props["change_summary"] = rel.change_summary
    # Match source/target by name within this user's graph.
    tx.run(
        f"""
        MATCH (s {{user_id: $user_id, name: $source}})
        MATCH (t {{user_id: $user_id, name: $target}})
        MERGE (s)-[r:{rel.type}]->(t)
        SET r += $props
        """,
        user_id=user_id,
        source=rel.source,
        target=rel.target,
        props=props,
    )


def _entity_id(user_id: int, label: str, name: str) -> str:
    import hashlib

    digest = hashlib.sha1(f"{user_id}:{label}:{name}".encode("utf-8")).hexdigest()
    return digest[:20]
