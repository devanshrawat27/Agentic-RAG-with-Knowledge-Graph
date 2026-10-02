# Project Flow

End-to-end flow of the system: how a document gets ingested, how a question
gets answered, and what the frontend shows at each step.

## High-level architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (Next.js 14)                        │
│   Chat dashboard · Source citations · Graph visualization            │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ REST (FastAPI /api/*)
┌───────────────────────────────▼─────────────────────────────────────┐
│                          BACKEND (FastAPI)                            │
│                                                                       │
│   ┌──────────── AGENT PIPELINE (LangGraph) ────────────┐             │
│   │   Planner → Retriever → Verifier → Answerer          │             │
│   │                  ▲              │                    │             │
│   │                  └──── loop ────┘ (unsupported)      │             │
│   └──────────┬───────────────────────────────┬───────────┘             │
│              │                               │                         │
│       ┌──────▼──────┐                 ┌──────▼──────┐                  │
│       │   Qdrant    │                 │   Neo4j     │                  │
│       │ (vectors)   │                 │  (graph)    │                  │
│       └─────────────┘                 └─────────────┘                  │
│                      ┌─────────────┐                                    │
│                      │ PostgreSQL  │ (document metadata)                │
│                      └─────────────┘                                    │
└─────────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │  LLM: Gemini 2.0 Flash │  (fallback: Ollama)
                    │  Embeddings: Gemini    │  (fallback: HF MiniLM)
                    └───────────────────────┘
```

## Part A — Ingestion flow (Phase 1)

This runs when a user uploads documents; it populates both stores.

```
Upload (PDF/DOCX)
      │
      ▼
[1] Loader        extract raw text              ingestion/loader.py
      │
      ▼
[2] Chunker       split into overlapping chunks  ingestion/chunker.py
      │
      ├──────────────► [3a] Embedder   embed each chunk  ──► Qdrant
      │                ingestion/embedder.py
      │
      └──────────────► [3b] Extractor  LLM extracts entities + relationships
                       ingestion/extractor.py
                            │
                            ▼
                        Neo4j graph  (Vendor, Contract, Clause, Revision,
                        Violation + SIGNED, CONTAINS, BREACHED, ...)
                            │
                            ▼
                        PostgreSQL  (document record, status, chunk count)
```

**Result:** every document exists as (a) embedded chunks in Qdrant,
(b) entities/relationships in Neo4j, (c) a metadata row in PostgreSQL.

## Part B — Query flow (Phase 2)

This runs when a user asks a question. The Verifier loop is the core
contribution.

```
User question (frontend)
      │
      ▼
┌─────────────┐
│  PLANNER    │  break question into sub-questions
└──────┬──────┘  e.g. "Which vendor breached clause 4.2 in 2024,
       │               and what changed in the 2025 revision?"
       │               → ["Who breached clause 4.2 in 2024?",
       │                  "What changed in the 2025 revision?"]
       ▼
┌─────────────┐
│  RETRIEVER  │  HYBRID search:
└──────┬──────┘   • vector similarity  → Qdrant (relevant chunks)
       │          • graph traversal    → Neo4j (connected facts / multi-hop)
       │          • merge + rank both into `evidence`
       ▼
┌─────────────┐
│  VERIFIER   │  for each claim in the draft answer:
└──────┬──────┘   • supported?   → keep, attach evidence refs
       │          • unsupported? → mark, set needs_more_evidence = true
       │
       ├── needs_more_evidence? ──yes──► back to RETRIEVER (loop)
       │                                  (with refined sub-questions)
       ▼ no
┌─────────────┐
│  ANSWERER   │  compose final answer from ONLY verified claims
└──────┬──────┘  + attach source citations
       │
       ▼
Final answer → frontend (with citations + graph trace)
```

**Guardrail:** the Verifier has a max loop count to prevent infinite loops;
if evidence never supports a claim, the Answerer explicitly marks it as
"unverified / not found in sources" rather than hallucinating.

## Part C — Frontend (what we build)

### Pages (Next.js App Router)

| Route | Purpose | Key components |
|---|---|---|
| `/` | Chat dashboard — ask questions, see answers | `ChatPanel`, `MessageList`, `AnswerCard`, `CitationList`, `AgentStatus` |
| `/graph` | Graph visualization of entities/documents used | `GraphView` (react-force-graph), `NodeDetails` |
| `/documents` | Upload + list ingested documents | `UploadDropzone`, `DocumentTable` |

### Components (planned)

```
components/
  chat/
    ChatPanel.tsx       input + submit, holds conversation state
    MessageList.tsx     scrollable list of user/assistant messages
    AnswerCard.tsx      final answer with inline [1][2] citation markers
    CitationList.tsx    clickable source chips → opens source view
    AgentStatus.tsx     live status: Planner ✓ → Retriever …
  graph/
    GraphView.tsx       react-force-graph rendering nodes/edges used
    NodeDetails.tsx     side panel for a selected node
  documents/
    UploadDropzone.tsx  drag-drop PDF/DOCX → POST /api/documents
    DocumentTable.tsx   list + ingestion status
```

### Data flow in the UI

```
User types question
   │
   ▼
POST /api/chat  ──►  backend runs the 4-agent pipeline
   │
   ▼
Response: { final_answer, claims[], citations[], graph_trace }
   │
   ├─► AnswerCard renders answer + inline citation markers
   ├─► CitationList renders source chips (doc + chunk refs)
   └─► GraphView highlights the nodes/edges actually used
```

### Progress display (open item)

Two options while the pipeline runs — decide based on time left:
- **SSE streaming**: each agent pushes status/partial result live (nicer UX,
  more work). Endpoint `GET /api/chat/stream`.
- **Fixed-sequence status text**: frontend shows a scripted sequence
  ("Planning… → Retrieving… → Verifying… → Answering…") while awaiting the
  single JSON response (simpler).

### API surface (backend ↔ frontend)

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | health / readiness check (done) |
| `POST` | `/api/documents` | upload a document, start ingestion |
| `GET` | `/api/documents` | list documents + ingestion status |
| `POST` | `/api/chat` | run the pipeline for a question |
| `GET` | `/api/chat/stream` | (optional) SSE status/progress stream |
| `GET` | `/api/graph` | graph subgraph for visualization |

## Part D — Evaluation flow (Phase 3)

```
Multi-hop test question set
      │
      ├─► Stage 1: flat-chunk RAG        (no graph)
      ├─► Stage 2: graph RAG             (no verifier)
      └─► Stage 3: graph RAG + Verifier  (full system)
              │
              ▼
      Measure accuracy + faithfulness at each stage
      + how often Verifier catches unsupported claims
              │
              ▼
      Chart + research write-up ("Fine-Grained Hallucination
      Mitigation in Domain RAG via Graph-Anchored Verification")
```

## Build order (what to implement, in sequence)

1. **Phase 1** — ingestion: loader → chunker → embedder → extractor → baseline RAG
2. **Phase 2** — agents: Planner → Retriever (hybrid) → Verifier → Answerer
   → FastAPI endpoints → Next.js dashboard + graph view
3. **Phase 3** — evaluation harness → dockerize → report

Do **not** build all at once — one focused piece per branch/PR (see `AGENTS.md`).
