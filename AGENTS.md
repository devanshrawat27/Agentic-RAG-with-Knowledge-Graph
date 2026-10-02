# AGENTS.md

Guidance for coding agents and contributors working in this repo.

## What this project is

Agentic RAG over enterprise documents (contracts, policies, compliance records)
that answers multi-hop questions by connecting facts across documents via a
Neo4j knowledge graph, and verifies every answer against source evidence before
showing it. The **Verifier agent** (cross-checking each claim against retrieved
evidence, looping back to the Retriever when unsupported) is the project's core
original contribution and main hallucination-mitigation mechanism.

## Project metadata

- **Project ID:** CSE27-229 · B.Tech CSE, Graphic Era Hill University, Dehradun
- **Mentor:** Kapil Rajput, Assistant Professor
- **Team (4):** Varun Rana, Devansh Rawat, Siddhant Rawat, Dhruv Purohit
- **Repo:** https://github.com/devanshrawat27/Agentic-RAG-with-Knowledge-Graph
- **Dataset:** Contract Understanding Atticus Dataset (CUAD) + self-authored
  sample documents

## Documentation index

| Doc | What it covers |
|---|---|
| `README.md` | Full project roadmap (Phases 1–3), problem statement, stack, alternatives |
| `docs/GRAPH_SCHEMA.md` | Entity/relationship schema (**draft**, pending team review) |
| `docs/IMPLEMENTATION_PLAN.md` | Step-by-step build order (Phases A–F), checkpoints |
| `docs/FLOW.md` | System flow: architecture, ingestion, query, frontend, evaluation |
| `docs/APP_FLOW.md` | User-facing flow incl. auth (signup/login/reset), routes, isolation |
| `docs/DATA_MODEL.md` | Data model + per-user isolation rules |
| `docs/SETUP.md` | Dev quickstart + what credentials to provide |

## Feature set

- Document ingestion: PDF/DOCX → chunking → embeddings → Qdrant
- Entity/relationship extraction via LLM prompting → Neo4j knowledge graph
- Hybrid retrieval (vector + graph) for multi-hop questions
- **Verification layer** that reduces hallucination (core differentiator)
- Chat dashboard with source citations
- Graph visualization of entities/documents an answer used
- Three-stage evaluation (no-graph vs graph vs graph+verification)
- (Added scope) user accounts + per-user isolation (ChatGPT-style history)

## Alternatives considered (and why not chosen)

- **ChromaDB vs Qdrant** — ChromaDB runs embedded (one less moving part) and was
  the original pick. **Switched to Qdrant** because ChromaDB's embedded store
  loses embeddings on redeploy on hosts with an ephemeral filesystem, and its
  cloud tier is usage-based, whereas Qdrant offers a genuinely free-forever
  hosted tier (4GB) and keeps data safe when live. Local setup pays for one
  extra container (Qdrant) in exchange for a clean path to deployment.
- **Dedicated NER model vs LLM-prompted extraction** — a trained NER model is
  more accurate at scale but needs a separate training/fine-tuning step;
  LLM prompting is faster to implement correctly given the team's LangChain
  experience.

## Locked architecture decisions (do not change)

- **Knowledge graph:** Neo4j (Community Edition)
- **Verifier as core contribution:** every answer passes through the Verifier
- **Pipeline order:** Planner → Retriever → Verifier → Answerer (Verifier may
  loop back to Retriever)
- **Vector DB:** Qdrant (hosted free tier; local via Docker)
- **LLM:** Google Gemini 2.0 Flash primary, Ollama + Llama 3.1 8B as zero-cost fallback
- **Embeddings:** Gemini text-embedding-004 primary, HF `all-MiniLM-L6-v2` fallback
- **Relational metadata:** PostgreSQL
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind; `react-force-graph`
- **Backend:** FastAPI; orchestration via LangChain + LangGraph

Do not silently substitute a different tool. If you identify a clearly better
technical choice for the same goal, say so, explain why, and wait for a decision
before switching.

## Added scope: authentication & per-user isolation (NOT in original roadmap)

Beyond the roadmap, the app includes a **user-accounts layer** so each user has
their own documents, chats, and history (ChatGPT-style), fully isolated from
other users. This is an application-layer feature; it does **not** change any
locked architecture decision. Details in `docs/APP_FLOW.md` and
`docs/DATA_MODEL.md`.

Isolation is a hard rule: every Postgres query, Qdrant search, and Neo4j
traversal must be scoped by the authenticated `user_id`. Never return another
user's data. Auth is built as its own branch/PR so it never blocks the core
pipeline.

**Frontend design is not decided yet.** Until Phase E, the frontend is a plain,
minimal **testing UI only** (bare signup/login forms that redirect to
`/dashboard` on success). Do not do design/styling work in Phase A — the real UI
is built later by the team (see `docs/IMPLEMENTATION_PLAN.md`, Phase E).

## Phase naming (avoid confusion)

Three documents use different labels for the same work. Use these as the
canonical mapping:

| Roadmap (`README.md`) | Plan (`IMPLEMENTATION_PLAN.md`) | What it is |
|---|---|---|
| Phase 1 (Weeks 1–4) | Phase C | Ingestion pipeline |
| Phase 2 (Weeks 5–9) | Phase D | Multi-agent system + integration |
| Phase 3 (Weeks 10–12) | Phase F | Evaluation, research, packaging |

Auth/per-user isolation is an **added** line of work (Phase A in the plan); it
is not part of the original roadmap phases.

## Draft schema (pending team review)

Entity/relationship types in `docs/GRAPH_SCHEMA.md` are a **draft**, not locked.
They must be agreed before extraction code is written — changing the schema
later means re-running extraction on already-ingested documents.

## Dependency note (important)

The project targets **Python 3.10+**, but the team's environment currently runs
**Python 3.14**. Early exact-pinned deps (e.g. `psycopg2-binary==2.9.10`,
`chromadb==0.5.23`) had no 3.14 wheels, so `backend/requirements.txt` uses `>=`
lower bounds and the resolver currently pulls **LangChain 1.4.x / LangGraph 1.2.x**
(1.x majors), plus `psycopg[binary]` v3 instead of psycopg2. Be aware of the 1.x
API surface when writing agent/pipeline code.

## Deployment & data stores (important)

**Local (development):** data lives in Docker volumes.

| Store | Local location | Git? | Persistent? |
|---|---|---|---|
| PostgreSQL | Docker volume `pgdata` | no | yes |
| Neo4j | Docker volume `neo4j-data` | no | yes |
| Qdrant | Docker volume `qdrant-storage` | no | yes |

**Live (deployment):** data moves to hosted stores so public users and redeploys
don't lose it. Config is already env-driven (`pydantic-settings`), so **no code
change is needed** — only `.env` values change.

| Store | Hosted option (free tier) |
|---|---|
| PostgreSQL | Neon / Supabase / Render Postgres |
| Neo4j | Neo4j Aura Free |
| Qdrant | **Qdrant Cloud Free** (free forever; 4GB — set `QDRANT_URL` + `QDRANT_API_KEY`) |
| Backend | Render / Railway (set env vars in the dashboard, never in git) |
| Frontend | Vercel |
| LLM / embeddings | Gemini API (already cloud) |

Qdrant is a separate server both locally (Docker) and live (Cloud), so embeddings
persist across redeploys with no extra disk — that is why it was chosen over the
embedded ChromaDB.

## Build / run commands

### Backend (Windows PowerShell, from `backend/`)
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```
- Health check: `http://localhost:8000/api/health`
- Import sanity check: `.\.venv\Scripts\python.exe -c "from app.main import app"`

### Frontend (from `frontend/`)
```powershell
npm install
npm run dev      # dev server
npm run build    # production build (also type-checks)
npm run lint
```

### Everything via Docker
```powershell
docker compose up --build
```

## Conventions

- **Monorepo layout:** `backend/` and `frontend/` at repo root; design docs in `docs/`.
- **Backend config:** `pydantic-settings` (`app/core/config.py`) reading from
  `.env`. All secrets/credentials are placeholders in `.env.example` — never
  commit real keys. App must boot and `/health` respond without credentials set.
- **Backend package layout:** `app/agents/` (4 agents + `graph_state.py`),
  `app/api/routes/` (FastAPI routers), `app/api/deps.py` (auth dependencies),
  `app/core/` (config + security + email + LLM/embedding/vector factories),
  `app/db/` (Neo4j + Postgres clients + ORM models), `app/schemas/` (Pydantic
  request/response models), `app/ingestion/` (loader/chunker/embedder/extractor).
- **No comments** unless they add meaning (interface/docstring headers and
  `TODO(phase-N)` markers are fine).
- **Line endings:** `.gitattributes` normalizes to LF for text files.
- **Git:** commit only when asked; stage only intended files; never commit secrets.

## Git workflow (mandatory for every contributor/agent)

Before writing or pushing any code, follow this order **every time**:

1. **Pull first.** Before starting any work, pull the latest `main` into your
   own branch: `git fetch origin` then `git pull origin main`. Never work on a
   stale checkout.
2. **Work in your own branch.** Never push directly to `main`. Create/use a
   feature branch (e.g. `dev`, `varun`, `devansh`, or a focused branch name)
   and do all work there.
3. **Local test before merge.** Run the app locally and confirm nothing is
   broken (backend import + `/health`, frontend `npm run build`) before
   proposing a merge.
4. **Merge carefully.** When merging, verify the change does **not break**
   existing code — resolve conflicts deliberately, re-run the checks above
   after resolving, and only then merge to `main`.
5. **Small, scoped changes only.** Do **not** build the whole project at once.
   Build exactly what was asked, nothing more. One focused change per branch/PR.

A merge must leave `main` in a working state (boots + `/health` responds +
frontend builds). If it doesn't, do not merge.

## Time budget & quality bar

The project has a **~5 month (about 20 week)** runway — more than the 12-week
roadmap. That extra time is a real advantage: use it to **understand the system
deeply and build quality**.

- **Build it properly, not fast.** We have time, so favour correctness,
  testing, and clean structure over rushing a feature out.
- **Still one step at a time.** Having time is **not** permission to build
  everything at once. Finish and verify each step, then move on. Extra time goes
  into doing each step well and re-testing, not into parallel-building the app.
- **Growth by understanding, not by rushing.** The scope can and should grow as
  the team learns more — adding functionality is welcome when it comes from a
  clear understanding of the problem, a deliberate decision (flagged per the
  rules above), and a tested implementation. What we avoid is *unplanned* scope
  creep, gold-plating, or swapping locked decisions without reason.
- **Protect the core.** Spend the most effort on the **Verifier** (core
  contribution) and the evaluation — that is what the project is judged on.
- **Leave buffer.** Do not schedule work to the last week; keep slack for
  integration bugs and the final report/demo.
- Follow `docs/IMPLEMENTATION_PLAN.md` for the step order, and update it
  deliberately when the plan changes.

## Current status

**Setup (Phase 0)** is complete: monorepo layout, backend + frontend skeleton,
dependency install, docker-compose, and all design docs — committed and pushed.

**Auth / per-user isolation (Phase A)** backend + frontend scaffolding is in
place (security utils, DB models, `/api/auth` router, plain test UI), but has
**not yet been tested end to end** (Postgres not started).

**Ingestion and agents have not started.** Do not begin ingestion until the
graph schema (`docs/GRAPH_SCHEMA.md`) is finalized by the team. Follow
`docs/IMPLEMENTATION_PLAN.md` step by step.

## Open items (resolve when reached; no need to block)

- Streaming (SSE) vs fixed-sequence status text for the frontend during the
  4-agent run.
- Agent memory (multi-turn context) as a stretch goal after the core pipeline.
