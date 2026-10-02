# Knowledge Graph Schema

**Status: LOCKED v1** (decided to unblock ingestion). This defines the entity
and relationship types used by the Neo4j knowledge graph, extracted from
ingested documents by the LLM-prompted extractor.

> Changing this after ingestion means re-running extraction on all
> already-ingested documents, so treat it as frozen. If a real blocker appears,
> raise it with the team **before** changing anything.

## Design goal

The schema must let the pipeline answer multi-hop questions such as:

> *"Which vendor breached clause 4.2 in 2024, and what changed in the 2025
> revision?"*

That requires a traversable path connecting a **vendor → violation → clause →
revision**, all anchored to the source **document**. Every typed edge below
exists to make some part of that path reachable.

## Entity types

Every node carries `user_id` for isolation and a globally-unique `id` (UUID).

| Label | Description | Key properties |
|---|---|---|
| `Document` | A source file (contract, policy, or compliance record). | `id`, `user_id`, `title`, `doc_type` (`contract`/`policy`/`compliance`), `file_type`, `uploaded_at` |
| `Vendor` | A company/organization party to a contract. | `id`, `user_id`, `name` |
| `Contract` | A legal agreement. | `id`, `user_id`, `title`, `effective_date`, `expiration_date` |
| `Clause` | A numbered provision/section (e.g. 4.2). Also used for policy provisions. | `id`, `user_id`, `number`, `text`, `summary` |
| `Revision` | A version/amendment of a contract. | `id`, `user_id`, `version`, `date` |
| `Violation` | A breach event where a clause was not upheld. | `id`, `user_id`, `date`, `description` |
| `Person` | An individual (signatory, officer, employee). | `id`, `user_id`, `name` |
| `Entity` | Catch-all for a mentioned entity not yet classified. Staging only. | `id`, `user_id`, `name`, `type` |

## Relationship types

| Type | From → To | Meaning | Extra props |
|---|---|---|---|
| `SIGNED` | `Vendor` → `Contract` | Vendor signed the contract. | `date` |
| `CONTAINS` | `Contract` → `Clause` | Contract contains a clause. | — |
| `HAS_REVISION` | `Contract` → `Revision` | Contract has this revision. | — |
| `REVISES` | `Revision` → `Clause` | The revision changes this clause. | `change_summary` |
| `COMMITTED` | `Vendor` → `Violation` | Vendor committed the violation. | — |
| `BREACHED` | `Violation` → `Clause` | The violation breached this clause. | `date` |
| `MENTIONS` | `Document` → any node | Provenance: the document mentions this entity. | `chunk_id` |

## Source anchoring (provenance)

Answers must cite evidence, and `/api/graph` shows where facts came from, so
provenance is first-class:

- Typed edges also carry `doc_id` + `chunk_id` so a claim traces to a chunk.
- `MENTIONS` links each entity back to its source `Document` with `chunk_id`
  (the fallback/anchoring edge).

## Isolation

Every node has `user_id`. All traversals start from user-owned nodes, e.g.
`MATCH (d:Document {user_id: $uid}) ...`. No query may cross user boundaries.
See `docs/DATA_MODEL.md`.

## Neo4j constraints / indexes

Create once (Phase C, step B3):

```cypher
CREATE CONSTRAINT entity_id_unique IF NOT EXISTS
FOR (n:Document) REQUIRE n.id IS UNIQUE;   -- repeat per label
CREATE INDEX entity_user_id IF NOT EXISTS FOR (n:Document) ON (n.user_id);
CREATE INDEX clause_number IF NOT EXISTS FOR (n:Clause) ON (n.number);
```

## Extractor rules

- Use only the labels/types above. Never invent new ones at extraction time.
- If a mentioned thing does not fit a typed label, add it as `Entity` and link
  the document with `MENTIONS` — do not force a wrong type.
- Prefer a typed edge when the text supports it; `MENTIONS` is the fallback.
- Always attach `doc_id` + `chunk_id`; never emit a node without `user_id`.

## Why these choices

- **`REVISES` (Revision → Clause) only** — one direction. An earlier draft had
  both `REVISED_IN` and `REVISES`; inverses add confusion for the extractor with
  no query benefit.
- **`HAS_REVISION`** — lets a revision be reached from its contract.
- **`Entity` catch-all** — avoids over-claiming semantics and keeps graph
  connectivity while preserving provenance.
- **`Document.doc_type`** — one Document label covers contracts, policies, and
  compliance records without extra labels.
