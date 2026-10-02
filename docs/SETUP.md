# Development Setup (Quickstart)

## Repository layout

- `backend/` — FastAPI + LangChain/LangGraph (Planner → Retriever → Verifier → Answerer)
- `frontend/` — Next.js 14 (App Router) + TypeScript + Tailwind
- `docs/` — project design docs
- `docker-compose.yml` — Qdrant, Neo4j, PostgreSQL, backend, frontend

## Prerequisites

Already checked on the team machine:

- **Docker Desktop** (running) — for Qdrant, Neo4j, PostgreSQL
- **Python 3.10+** (team runs 3.14)
- **Node.js 18+** (team runs 20.x)

No need to install Neo4j, PostgreSQL, or Qdrant manually — Docker runs them.

## 1. Configure environment

Copy the example env file **to the repo root** (the backend and docker-compose
both read the root `.env`):

```powershell
Copy-Item .env.example .env
```

Then fill in at least these (all optional until Phase C):

```ini
GEMINI_API_KEY=your-key-here
NEO4J_PASSWORD=your-password
POSTGRES_PASSWORD=your-password
JWT_SECRET=<run the command below and paste>
```

Generate a JWT secret:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

## 2. Option A — run everything with Docker (recommended)

```powershell
docker compose up --build
```

| Service | URL |
|---|---|
| Backend API | http://localhost:8000 |
| Backend health | http://localhost:8000/api/health |
| Frontend | http://localhost:3000 |
| Neo4j Browser | http://localhost:7474 |
| Qdrant dashboard | http://localhost:6333/dashboard |
| PostgreSQL | localhost:5432 |

Data persists in Docker volumes (`pgdata`, `neo4j-data`, `qdrant-storage`).

## 3. Option B — run backend/frontend natively (dev, hot reload)

Start only the data stores in Docker, then run the apps locally:

```powershell
docker compose up -d qdrant neo4j postgres
```

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Health check: http://localhost:8000/api/health
Import sanity check: `.\.venv\Scripts\python.exe -c "from app.main import app"`

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Dashboard: http://localhost:3000

## 3b. Local LLM (Ollama) — for development

The free Gemini tier allows only ~20 requests/day, which is not enough to
extract a whole contract. Use **Ollama** locally for unlimited, offline
extraction during development.

> On this machine Ollama is installed portably at `D:\Ollama` (C: had almost no
> space) with models on `D:\Ollama\models`. The user env vars `OLLAMA_MODELS`
> and `PATH` are already set, so `ollama` works after a new shell.

```powershell
# start the server (keep it running)
ollama serve

# pull the model (once) — ~4.7 GB
ollama pull llama3.1:8b
```

Then in `.env` set `LLM_PROVIDER=ollama` (and switch back to `gemini` for
demos/production). Verify:

```powershell
ollama run llama3.1:8b "say hi"
```

Notes:
- Local generation on CPU is **slow** (~1 min per chunk). Fine for dev; use
  Gemini (or expect waits) for the demo.
- The model files live on `D:\Ollama\models`, not on C:.

## 4. Testing the auth flow (Phase A)

With Postgres running (Docker), the backend auto-creates its tables at startup.

1. Open http://localhost:3000/signup and create an account.
2. No SMTP configured? The verification link is printed in the **backend
   console** (dev mode) — copy it into the browser.
3. Log in → you should land on `/dashboard`.

```powershell
# inspect users created
docker compose exec postgres psql -U postgres -d agentic_rag -c "select id,email,is_verified from users;"
```

## What you need to provide

| Value | Env var | Used for | Where to get it |
|---|---|---|---|
| Gemini API key | `GEMINI_API_KEY` | Primary LLM + embeddings | https://aistudio.google.com/apikey |
| Neo4j password | `NEO4J_PASSWORD` | Knowledge graph DB | Set your own |
| PostgreSQL password | `POSTGRES_PASSWORD` | Relational DB (users, chats, docs) | Set your own |
| JWT secret | `JWT_SECRET` | Auth session signing | Generate with command above |
| Qdrant URL/key | `QDRANT_URL`, `QDRANT_API_KEY` | Vector store | Local: leave defaults. Cloud: from Qdrant dashboard |
| (optional) Ollama | `OLLAMA_BASE_URL` | Local LLM fallback | https://ollama.com |

The backend boots and `/health` responds even without any of these — they are
only required once you ingest documents and run the agents (Phase C/D).

## Live deployment (later)

Config is env-driven, so deployment needs **no code change** — only new `.env`
values: Postgres → Neon/Supabase, Neo4j → Aura Free, Qdrant → Qdrant Cloud Free,
backend → Render/Railway, frontend → Vercel. See `AGENTS.md` for details.
