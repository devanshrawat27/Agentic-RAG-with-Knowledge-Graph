# AGENTS.md

Guidance for coding agents and contributors working in this repo.

## What this project is

Agentic RAG over enterprise documents (contracts, policies, compliance records)
that answers multi-hop questions by connecting facts across documents via a
Neo4j knowledge graph, and verifies every answer against source evidence before
showing it. The **Verifier agent** (cross-checking each claim against retrieved
evidence, looping back to the Retriever when unsupported) is the project's core
original contribution and main hallucination-mitigation mechanism.

See `README.md` for the full roadmap and `docs/GRAPH_SCHEMA.md` for the schema.

## Locked architecture decisions (do not change)

- **Knowledge graph:** Neo4j (Community Edition)
- **Verifier as core contribution:** every answer passes through the Verifier
- **Pipeline order:** Planner → Retriever → Verifier → Answerer (Verifier may
  loop back to Retriever)
- **Vector DB:** ChromaDB (embedded), not Qdrant
- **LLM:** Google Gemini 2.0 Flash primary, Ollama + Llama 3.1 8B as zero-cost fallback
- **Embeddings:** Gemini text-embedding-004 primary, HF `all-MiniLM-L6-v2` fallback
- **Relational metadata:** PostgreSQL
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind; `react-force-graph`
- **Backend:** FastAPI; orchestration via LangChain + LangGraph

Do not silently substitute a different tool. If you identify a clearly better
technical choice for the same goal, say so, explain why, and wait for a decision
before switching.

## Draft schema (pending team review)

Entity/relationship types in `docs/GRAPH_SCHEMA.md` are a **draft**, not locked.
They must be agreed before Phase 2 extraction code is written — changing the
schema later means re-running extraction on already-ingested documents.

## Dependency note (important)

The project targets **Python 3.10+**, but the team's environment currently runs
**Python 3.14**. Early exact-pinned deps (e.g. `psycopg2-binary==2.9.10`,
`chromadb==0.5.23`) had no 3.14 wheels, so `backend/requirements.txt` uses `>=`
lower bounds and the resolver currently pulls **LangChain 1.4.x / LangGraph 1.2.x**
(1.x majors), plus `psycopg[binary]` v3 instead of psycopg2. Be aware of the 1.x
API surface when writing agent/pipeline code.

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
  `app/api/routes/` (FastAPI routers), `app/core/` (config + LLM/embedding/vector
  factories), `app/db/` (Neo4j + Postgres clients), `app/ingestion/` (Phase 2).
- **No comments** unless they add meaning (interface/docstring headers and
  `TODO(phase-N)` markers are fine).
- **Line endings:** `.gitattributes` normalizes to LF for text files.
- **Git:** commit only when asked; stage only intended files; never commit secrets.

## Current status

Phase 1 scaffolding is complete (backend + frontend + docker-compose + schema
doc), committed and pushed. Phase 2 (ingestion + agents) has **not** started —
hold until the team confirms the graph schema and gives the go-ahead.

## Open items (resolve when reached; no need to block)

- Streaming (SSE) vs fixed-sequence status text for the frontend during the
  4-agent run.
- Agent memory (multi-turn context) as a stretch goal after the core pipeline.
