# Data Model & Per-User Isolation

Defines where each kind of data lives and the hard rule that **no user can
ever read another user's data**.

## Ownership rule

Every stored record belongs to exactly one `user_id`. All reads and writes are
scoped by the authenticated user. If a query cannot be filtered by `user_id`,
it must not run.

## PostgreSQL (source of truth for ownership)

| Table | Columns | Notes |
|---|---|---|
| `users` | `id` PK, `name`, `email` UNIQUE, `password_hash`, `is_verified` bool, `created_at` | accounts |
| `tokens` | `id` PK, `user_id` FK→users, `type` (verify/reset), `token_hash`, `expires_at`, `used_at` NULL | one-time email tokens |
| `chats` | `id` PK, `user_id` FK→users, `title`, `created_at`, `updated_at` | one chat = one conversation |
| `messages` | `id` PK, `chat_id` FK→chats, `role` (user/assistant), `content`, `created_at` | turns within a chat |
| `documents` | `id` PK, `user_id` FK→users, `filename`, `status`, `chunk_count`, `created_at` | uploaded docs |

Cascade: deleting a user removes their chats, messages, documents, tokens.

## ChromaDB (embeddings)

- One collection per user: `user_{user_id}_chunks` (preferred), **or** a single
  collection with a `user_id` metadata filter on every query.
- Never run a similarity search without the user scope.

## Neo4j (knowledge graph)

- Every `Document` node carries `user_id`.
- Every traversal starts from nodes owned by the user:
  `MATCH (d:Document {user_id: $uid}) ...`
- No cross-user path may be returned.

## Isolation enforcement points

1. **Session** — `get_current_user` dependency resolves the caller's `user_id`.
2. **Postgres** — every repository/query takes `user_id` and filters on it.
3. **ChromaDB** — collection name / metadata filter derived from `user_id`.
4. **Neo4j** — every Cypher query begins from the user's owned nodes.
5. **Response** — endpoints return only the authenticated user's data.

## Auth session

- Login issues a signed token (JWT) delivered in an **httpOnly cookie**.
- Frontend middleware guards protected routes; backend re-verifies on every
  protected call (never trust the client).

## Notes

- Postgres holds ownership; ChromaDB and Neo4j mirror `user_id` so filters stay
  consistent. If they ever disagree, Postgres wins.
- This document is the contract for the auth/isolation feature. It does not
  change the locked architecture (`AGENTS.md`).
