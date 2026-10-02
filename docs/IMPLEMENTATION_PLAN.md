# Implementation Plan

Step-by-step build order for the whole project. **One step at a time.** Do not
jump ahead or build multiple steps at once. Each step ends with a working,
testable state (see `AGENTS.md` for the git workflow: branch → test → merge).

Legend: `[x]` done · `[~]` in progress · `[ ]` not started

---

## Phase 0 — Setup (DONE)

- [x] Monorepo layout (`backend/`, `frontend/`, `docs/`)
- [x] Backend skeleton (FastAPI, config, health endpoint)
- [x] Frontend skeleton (Next.js 14 + TS + Tailwind)
- [x] Dependency install (backend venv, frontend npm)
- [x] `docker-compose.yml` (Neo4j + Postgres + backend + frontend)
- [x] Docs: `GRAPH_SCHEMA.md`, `FLOW.md`, `APP_FLOW.md`, `DATA_MODEL.md`, `AGENTS.md`

---

## Phase A — Auth vertical slice (finish + actually run it)

Goal: signup → verify → login → protected dashboard works **live**, and every
user sees only their own data.

> **Design note:** the real frontend design is **not decided yet** and will be
> built by the team later. For now the frontend exists only as a **plain,
> minimal testing UI** — no styling/design work. Its only job is to let us
> verify the backend auth flow (sign up / log in → redirect to dashboard).

**Backend first, then test, then the throwaway test UI.**

- [~] A1. Add `/api/chat`, `/api/documents`, `/api/graph` routers as **auth-guarded stubs**
- [ ] A2. **Backend:** start Postgres (`docker compose up -d postgres`) + confirm
       tables auto-create
- [ ] A3. **Backend:** end-to-end test via API/docs — signup → dev-console verify
       link → verify-email
- [ ] A4. **Backend:** end-to-end test — login (cookie set) → `/api/auth/me`
- [ ] A5. **Backend:** end-to-end test — forgot-password → reset-password →
       login with new password
- [ ] A6. Fix any bugs found; backend auth slice marked working
- [ ] A7. **Frontend (plain test UI only):** bare signup + login forms that call
       the API and **redirect to `/dashboard` on success** (exactly like a normal
       login). No design, no styling, no sidebar — just enough to click through
       and confirm the flow works.
- [ ] A8. Stop. Real UI design/polish is deferred to Phase E.

Checkpoint A: backend auth works end to end (tested via API); a plain test UI
can sign up, log in, and redirect to `/dashboard`. **No design work yet.**
No cross-user data anywhere.

> **Do not** build the real login/chat UI in Phase A. The team's designer/lead
> will decide the look later; this is throwaway scaffolding for testing.

---

## Phase B — Knowledge graph schema (lock before ingestion)

Goal: freeze the schema so extraction never has to be re-run.

- [x] B1. Finalize entity/relationship types → `docs/GRAPH_SCHEMA.md` (**LOCKED v1**,
       designed around the multi-hop vendor→violation→clause→revision path)
- [x] B2. Doc status set to "locked"; committed
- [ ] B3. Neo4j constraints/indexes (`CREATE CONSTRAINT` for entity ids) —
       run as part of Phase C setup

Checkpoint B: **schema is locked and documented** (done). If a real blocker
appears later, raise it before changing — re-extraction is the cost.

---

## Phase C — Ingestion pipeline (Phase 1 of the roadmap)

Goal: upload a document → chunks in Qdrant + entities in Neo4j + row in Postgres.

- [x] C1. LLM + embedding factories (`core/llm.py`, `core/embeddings.py`)
       — Gemini primary (`gemini-flash-latest`), Ollama / HF fallback.
       Note: Gemini free tier is only ~20 requests/day on the flash model.
- [x] C2. Qdrant client (`core/vectorstore.py`), per-user collections
- [x] C3. Loader: PDF/DOCX/TXT → raw text (`ingestion/loader.py`)
- [x] C4. Chunker: overlapping chunking (`ingestion/chunker.py`)
- [x] C5. Embedder: chunks → Qdrant (`ingestion/embedder.py`) — verified with CUAD samples
- [x] C6. Extractor: LLM → entities/relationships → Neo4j (`ingestion/extractor.py`),
       locked schema, `user_id` + `doc_id`/`chunk_id` provenance; fails fast on quota
- [x] C7. `POST /api/documents` (upload, user-scoped) + `GET /api/documents` (list)
- [ ] C8. Document upload UI (`/documents`) with status polling
- [ ] C9. Baseline flat-rag answer (single-hop) for the 3-stage comparison

Checkpoint C: upload a contract → chunks in Qdrant + metadata (done, verified);
graph extraction works but is limited by the free-tier LLM quota — use Ollama
or a paid key to extract a full contract. Baseline RAG (C9) still pending.

---

## Phase D — Multi-agent pipeline (Phase 2 of the roadmap)

Goal: Planner → Retriever → Verifier → Answerer over LangGraph, user-scoped.

- [ ] D1. Wire LangGraph graph (`pipeline/`) with `AgentState`
- [ ] D2. Planner: LLM decomposes question → sub-questions
- [ ] D3. Retriever: hybrid search (Qdrant vector + Neo4j traversal), merge/rank
- [ ] D4. Verifier: per-claim check against evidence; loop back when unsupported
       (max-loop guard) — **core contribution**
- [ ] D5. Answerer: final answer from verified claims only + citations
- [ ] D6. `POST /api/chat` runs the pipeline (auth-scoped); persist chat/messages
- [ ] D7. Decide status display: SSE streaming vs fixed-sequence status text

Checkpoint D: multi-hop question answered by the full chain, with citations and
a visible agent trace.

---

## Phase E — Frontend experience (real design lands here)

Goal: **replace the throwaway Phase-A test UI with the real, designed product UI**
around the pipeline. This is where visual design decisions are made and applied.

- [ ] E0. Design pass: agree on look/layout (header, sidebar, chat styling) —
       team/lead decides; apply a consistent design system (Tailwind tokens)
- [ ] E1. Chat dashboard (`/chat`): `ChatPanel`, `MessageList`, `AnswerCard`,
       `CitationList`, `AgentStatus`
- [ ] E2. Chat history sidebar (per-user); open/continue chats (multi-turn context)
- [ ] E3. `GET /api/graph` + Graph visualization (`/graph`) via react-force-graph
- [ ] E4. Source/citation viewer (open source chunk from a citation)

Checkpoint E: ChatGPT-style experience — chat, history, citations, graph trace.

---

## Phase F — Evaluation & packaging (Phase 3 of the roadmap)

- [ ] F1. Multi-hop test question set
- [ ] F2. Three-stage comparison: flat RAG vs graph RAG vs verified graph RAG
- [ ] F3. Measure how often the Verifier catches unsupported claims
- [ ] F4. Charts + research write-up
- [ ] F5. Full `docker compose up --build` works end to end
- [ ] F6. Final demo script + report; tag `v1.0`

---

## Cross-cutting rules (apply at every step)

- **Small steps only.** Finish and verify one step before the next.
- **Branch per change.** Pull latest `main` first; never push to `main` directly.
- **Test locally before merge.** Backend import + `/health`; frontend `npm run build`.
- **User isolation everywhere.** Every Postgres query, Qdrant search, and Neo4j
  traversal scoped by the authenticated `user_id`.
- **No secrets in git.** Placeholders live in `.env.example` only.

## Dependency notes

- Phase B must complete before Phase C (schema lock before extraction).
- Phase A can proceed independently of B–D.
- D depends on C (retrieval needs an ingested corpus).
- E depends on D (chat UI needs the pipeline endpoint).
