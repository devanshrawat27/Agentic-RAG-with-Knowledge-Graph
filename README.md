# Agentic RAG with Knowledge Graph — Project Roadmap

An AI assistant that helps enterprise teams get accurate answers from large document collections (contracts, policies, compliance records) by connecting facts across multiple documents and verifying every answer against source evidence — reducing hallucination in complex, multi-hop queries.

**Project ID:** CSE27-229 · B.Tech CSE, Graphic Era Hill University, Dehradun
**Mentor:** Kapil Rajput, Assistant Professor
**Team:** Varun Rana, Devansh Rawat, Siddhant Rawat, Dhruv Purohit

## 1. Problem Statement

Standard "chat with your PDF" RAG tools retrieve isolated text chunks and answer
single-document questions well, but fail on multi-hop questions that require
connecting facts across documents — e.g. *"Which vendor breached clause 4.2 in
2024, and what changed in the 2025 revision?"* This requires linking a vendor,
a clause, a violation event, and a document revision — four pieces of
information a flat-chunk retriever cannot naturally connect.

This project combines vector-based RAG with a Neo4j knowledge graph,
orchestrated by a multi-agent pipeline (Planner → Retriever → Verifier →
Answerer). The **Verifier agent** — which cross-checks every generated claim
against retrieved evidence before it reaches the user — is the project's core
original contribution and its main hallucination-mitigation mechanism.

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js dashboard |
| Backend | FastAPI |
| Orchestration | LangChain / LangGraph |
| Vector store | Qdrant (free-forever cloud tier; local via Docker) |
| Knowledge graph | Neo4j (Community Edition, or Aura free tier) |
| Relational metadata | PostgreSQL |
| LLM API | Google Gemini (free tier) — Ollama as a free local fallback |
| Deployment | Docker; GitHub + Vercel / Render / Railway |
| Dataset | Contract Understanding Atticus Dataset (CUAD) + self-authored sample docs |

## 3. Prerequisites

**Hardware:** Any laptop with 8GB+ RAM. No GPU needed — LLM calls go through
an API, not local training.

**Software:**
- Python 3.10+, Node.js 18+
- LangChain, LangGraph, Hugging Face Transformers (`pip install`)
- Neo4j Community Edition (local) or Neo4j Aura (free cloud tier)
- Qdrant (local via Docker, or Qdrant Cloud free tier)
- PostgreSQL, Docker

**Accounts (all free tiers, no paid subscriptions required):**
- Google Gemini API key
- GitHub, Vercel, Render or Railway

**Team prep before Phase 1 starts:**
- Everyone runs one basic RAG example end to end
- Everyone writes and runs a few basic Cypher queries against a local Neo4j instance
- Agree on the graph schema (entity types: Vendor, Contract, Clause, Revision,
  Violation; relationship types: SIGNED, CONTAINS, COMMITTED, BREACHED,
  REVISED_IN) before any extraction code is written — changing this mid-project
  means re-running extraction on everything already ingested

## 5. Phase 1 — Foundations & Ingestion Pipeline (Weeks 1–4)

**Goal:** Prove the data pipeline works end to end, before any agent logic exists.

**Tasks:**
- Set up LangChain/LangGraph environment; each member runs a basic RAG example
- Install Neo4j locally; practice Cypher queries against the agreed schema
- Prepare the dataset (CUAD contracts + self-written samples)
- Build document upload → text extraction → chunking pipeline
- Embed chunks and store them in Qdrant
- Build an LLM-prompted entity/relationship extractor; populate Neo4j
- Get a baseline flat-chunk RAG answering simple, single-hop questions

**What to demo:** upload a contract live, show it being chunked and embedded,
show the resulting graph in Neo4j Browser, and show baseline RAG answering a
single-hop question correctly — set up as stage 1 of the three-stage
comparison (flat RAG → graph RAG → verified graph RAG) that Phase 3 will
complete.

**GitHub:** tag `phase-1` — ingestion pipeline + populated graph +
working baseline RAG, all runnable from a fresh clone.

## 6. Phase 2 — Multi-Agent System & Integration (Weeks 5–9)

**Goal:** Build the full agentic pipeline and the interface around it.

**Tasks:**
- Build the LangGraph pipeline: Planner → Retriever → Verifier → Answerer
- Implement hybrid retrieval (vector similarity + graph traversal)
- Implement the Verifier: cross-check each claim against retrieved evidence
- Expose the pipeline through FastAPI endpoints
- Build the Next.js chat interface with inline citations and a source/graph
  trace view

**What to demo:** the multi-hop example question answered correctly with the
full agent chain, citations, and a visible trace of which documents and graph
paths were used — this is where the project's core contribution becomes visible.

**GitHub:** tag `phase-2` — full agent pipeline + working dashboard.

## 7. Phase 3 — Evaluation, Research Write-up & Polish (Weeks 10–12)

**Goal:** Quantify the improvement and package the project for final submission.

**Tasks:**
- Run the staged comparison: flat-chunk RAG vs graph-augmented RAG vs verified
  graph-augmented RAG, on a set of multi-hop test questions
- Measure and report how often the Verifier catches unsupported claims
- Write up results (suitable structure: "Fine-Grained Hallucination Mitigation
  in Domain RAG via Graph-Anchored Verification")
- Dockerize the full system
- Prepare final demo script and report

**What to demo:** the comparison results (a chart showing accuracy/faithfulness
improving at each stage), the dockerized system running from a single command,
and the final report.

**GitHub:** tag `phase-3` / `v1.0` — final, dockerized, documented
submission.

## 8. Future Improvements (post-submission)

- Agent memory across multiple questions in a session
- Cost-aware model routing (cheap model for simple questions, stronger model
  for complex multi-hop ones)
- Support for additional document types (spreadsheets, scanned/OCR documents)
