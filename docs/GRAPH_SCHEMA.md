# Knowledge Graph Schema

Finalized draft for team review. This defines the entity and relationship
types used by the Neo4j knowledge graph, extracted from ingested documents
by the LLM-prompted extractor.

> **Status:** PENDING TEAM REVIEW. Changing this after ingestion means
> re-running extraction on all already-ingested documents.

## Entity types

| Label | Description | Key properties |
|---|---|---|
| `Document` | A source file uploaded to the system (contract, policy, compliance record). | `doc_id`, `title`, `file_type`, `uploaded_at` |
| `Vendor` | A company or organization that is party to a contract. | `name`, `vendor_id` |
| `Contract` | A legal agreement between parties. | `contract_id`, `title`, `effective_date`, `expiration_date` |
| `Clause` | A specific numbered section within a contract (e.g. 4.2). | `clause_id`, `number`, `text`, `summary` |
| `Revision` | A later version of a contract or clause. | `revision_id`, `version`, `date` |
| `Violation` | A breach/event where a clause was not upheld. | `violation_id`, `date`, `description` |
| `Person` | An individual (signatory, employee) involved. | `name` |
| `Entity` | Generic catch-all for entities not yet classified (pre-classification). | `name`, `type` |

## Relationship types

| Type | From | To | Meaning |
|---|---|---|---|
| `SIGNED` | `Vendor` | `Contract` | A vendor signed the contract. |
| `CONTAINS` | `Contract` | `Clause` | A contract contains a clause. |
| `COMMITTED` | `Vendor` | `Violation` | A vendor committed a violation. |
| `BREACHED` | `Violation` | `Clause` | A violation breached a specific clause. |
| `REVISED_IN` | `Clause` | `Revision` | A clause was revised in a given revision. |
| `REVISES` | `Revision` | `Clause` | A revision changes a clause. |
| `MENTIONS` | `*` | `*` | Generic co-occurrence/mention relation (extraction fallback). |

## Source anchoring

Every extracted entity/relationship links back to a `Document` (and, where
possible, a `chunk_id`) so answers can cite the source evidence and the
graph trace view can show provenance.

## Notes

- `MENTIONS` is a fallback edge for spans the LLM cannot confidently
  classify into the typed relationships above. It preserves graph connectivity
  without over-claiming semantics.
- `Entity` is a pre-classification staging node; the extractor may promote
  an `Entity` to a typed label (`Vendor`, `Clause`, …) once context confirms it.
