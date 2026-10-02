# Development Setup (Quickstart)

## Repository layout

- `backend/` — FastAPI + LangChain/LangGraph (Planner → Retriever → Verifier → Answerer)
- `frontend/` — Next.js 14 (App Router) + TypeScript + Tailwind
- `docs/` — project design docs
- `docker-compose.yml` — Neo4j, PostgreSQL, backend, frontend

## 1. Configure environment

```bash
cp .env.example .env
```

Fill in the placeholders (see "What you need to provide" below).

## 2. Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate   |   macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Health check: http://localhost:8000/api/health

## 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Dashboard: http://localhost:3000

## 4. Everything via Docker

```bash
docker compose up --build
```

## What you need to provide (all optional at scaffold time)

| Value | Env var | Used for | Where to get it |
|---|---|---|---|
| Gemini API key | `GEMINI_API_KEY` | Primary LLM + embeddings | https://aistudio.google.com/apikey |
| Neo4j password | `NEO4J_PASSWORD` | Knowledge graph DB | Set your own (local Neo4j) |
| PostgreSQL password | `POSTGRES_PASSWORD` | Relational metadata DB | Set your own |
| (optional) Ollama base URL | `OLLAMA_BASE_URL` | Local LLM fallback | Local install, defaults to localhost:11434 |

The backend boots and `/health` responds even without any of these — they are
only required once you start ingesting documents and running the agents (Phase 2).
