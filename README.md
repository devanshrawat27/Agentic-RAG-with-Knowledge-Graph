# Agentic RAG with Knowledge Graph — Project Roadmap

An AI assistant that helps enterprise teams get accurate answers from large document collections (contracts, policies, compliance records) by connecting facts across multiple documents and verifying every answer against source evidence — reducing hallucination in complex, multi-hop queries.



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
- Agree on the graph schema before any extraction code is written — changing
  this mid-project means re-running extraction on everything already ingested.
  The schema is now **locked v1** in `docs/GRAPH_SCHEMA.md` (entity types:
  Document, Vendor, Contract, Clause, Revision, Violation, Person, Entity;
  relationship types: SIGNED, CONTAINS, HAS_REVISION, REVISES, COMMITTED,
  BREACHED, MENTIONS)

