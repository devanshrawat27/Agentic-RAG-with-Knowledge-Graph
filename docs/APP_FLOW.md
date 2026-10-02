# Application Flow (end to end)

Complete flow of the application from the user's point of view, including
authentication (signup, login, forgot/reset password) and the core
chat + graph experience.

> **Scope note:** Authentication is **not** part of the original project
> roadmap (`README.md` Phases 1–3). It is added here as an application-layer
> feature so the product feels complete for the final demo. It does **not**
> change any locked architecture decision (Neo4j, Qdrant, Gemini, pipeline
> order, Verifier). It only adds a user-accounts layer (PostgreSQL) in front
> of the existing pipeline.

## Actors

| Actor | Description |
|---|---|
| **Anonymous visitor** | Not logged in. Can see landing page + auth pages only. |
| **Registered user** | Logged in. Can upload docs, chat, view graph, see history. |
| **Admin** (optional) | Manages users / ingestion corpus. Post-submission stretch. |

## Route map & access control

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Landing: product pitch, "Sign in / Get started" |
| `/login` | Public (redirect if logged in) | Email + password login |
| `/signup` | Public (redirect if logged in) | Create account |
| `/forgot-password` | Public | Enter email → send reset link |
| `/reset-password` | Public (token in URL) | Set a new password |
| `/verify-email` | Public (token in URL) | Confirm email address |
| `/dashboard` | **Protected** | Overview: recent chats, doc count, quick ask |
| `/chat` | **Protected** | Main chat + answers + citations |
| `/graph` | **Protected** | Knowledge graph visualization |
| `/documents` | **Protected** | Upload + manage ingested documents |
| `/settings` | **Protected** | Profile, change password, logout |

Protected routes redirect to `/login?next=<path>` when there is no valid
session.

## Part 1 — Authentication flows

### 1.1 Signup

```
User → /signup → enters (name, email, password, confirm password)
      │
      ▼
Frontend validates (email format, password rules, passwords match)
      │
      ▼
POST /api/auth/signup
      │
      ▼
Backend: hash password (bcrypt), create user (PostgreSQL), status = "unverified"
      │  send verification email with token
      ▼
Response → "Check your email to verify"
      │
      ▼
User clicks link → /verify-email?token=... → POST /api/auth/verify-email
      │
      ▼
Account verified → redirect to /login
```

### 1.2 Login

```
User → /login → enters (email, password)
      │
      ▼
POST /api/auth/login
      │
      ▼
Backend: verify password hash → issue session / JWT (httpOnly cookie)
      │
      ├─ invalid        → 401 "Invalid email or password" (generic message)
      ├─ not verified    → 403 "Please verify your email"
      └─ valid           → set auth cookie
      ▼
Redirect to /dashboard (or ?next= target)
```

### 1.3 Forgot password

```
User → /forgot-password → enters email
      │
      ▼
POST /api/auth/forgot-password
      │
      ▼
Backend: if email exists → create one-time reset token (expires ~30 min),
         email reset link. Always responds "If that email exists, we sent a link"
         (do not reveal whether the email is registered)
      │
      ▼
User clicks link → /reset-password?token=...
      │
      ▼
POST /api/auth/reset-password { token, new_password }
      │
      ▼
Backend: validate token + expiry → update password hash → invalidate token
      │
      ▼
Redirect to /login with "Password updated"
```

### 1.4 Logout

```
User → /settings or header menu → Logout
      │
      ▼
POST /api/auth/logout → clear session/cookie → redirect to /login
```

### 1.5 Session / guard

- Auth token stored in an **httpOnly cookie** (safer than localStorage).
- Frontend middleware protects `/dashboard`, `/chat`, `/graph`, `/documents`,
  `/settings`; redirects unauthenticated users to `/login`.
- Backend verifies the token on every protected `/api/*` call.

## Part 2 — Core app flow (after login)

### 2.1 Document ingestion

```
User → /documents → drag & drop PDF/DOCX → POST /api/documents
      │
      ▼
Backend: loader → chunker → embedder (Qdrant)
                         └→ extractor (LLM) → Neo4j
                         └→ metadata row (PostgreSQL), status = processing
      │
      ▼
Frontend polls GET /api/documents → status: processing → ready
      │
      ▼
Document appears in table with chunk count + entity count
```

### 2.2 Ask a question

```
User → /chat → types question → POST /api/chat
      │
      ▼
Agent pipeline: Planner → Retriever (hybrid) → Verifier → Answerer
      │            (Verifier loops back to Retriever if unsupported)
      ▼
Response: { final_answer, claims[], citations[], graph_trace }
      │
      ▼
AnswerCard shows answer with inline [1][2] citations
CitationList shows source documents/chunks (click → source view)
AgentStatus shows the step trace
Chat saved to history (PostgreSQL)
```

### 2.3 Inspect the graph

```
User → /graph (or clicks "view graph" from an answer)
      │
      ▼
GET /api/graph?answer_id=...  → subgraph of entities/edges actually used
      │
      ▼
GraphView (react-force-graph) renders nodes/edges, color by type
Click node → NodeDetails side panel (properties + source docs)
```

### 2.4 History & settings

- `/dashboard` lists recent chats → click reopens in `/chat`.
- `/settings` → update name, change password (reuses reset logic while logged in), logout.

## Part 3 — New backend surface (for auth)

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/auth/signup` | create account, send verification email |
| `POST` | `/api/auth/login` | authenticate, set session cookie |
| `POST` | `/api/auth/logout` | clear session |
| `GET` | `/api/auth/me` | current user (for guards) |
| `POST` | `/api/auth/verify-email` | confirm email token |
| `POST` | `/api/auth/forgot-password` | send reset link |
| `POST` | `/api/auth/reset-password` | set new password |

Existing pipeline endpoints stay the same (`/api/health`, `/api/documents`,
`/api/chat`, `/api/graph`), now requiring an authenticated session.

## Part 4 — Data model & per-user isolation

**Every user's data is fully isolated** — own documents, own chats, own graph.
A user must never see another user's documents, chunks, chats, or graph
entities. This is the hard rule that shapes the whole data model.

| Table | Key fields |
|---|---|
| `users` | id, name, email (unique), password_hash, is_verified, created_at |
| `tokens` | id, user_id, type (verify/reset), token_hash, expires_at, used_at |
| `chats` | id, user_id, title, created_at, updated_at |
| `messages` | id, chat_id, role (user/assistant), content, created_at |
| `documents` | id, user_id, filename, status, chunk_count, created_at |

**Isolation extends into the other stores** (they stay document/knowledge
stores, but every record is scoped by user):

- **Qdrant** — each collection is per-user (e.g. `user_{user_id}_chunks`), or
  every point carries a `user_id` payload field. No cross-user similarity search.
- **Neo4j** — every `Document` node is owned by a user; traversals always
  start from `(:Document {user_id: $uid})`. No query may cross user
  boundaries.
- **PostgreSQL** — every query filters by the authenticated `user_id`.

Postgres is the source of truth for ownership; Qdrant and Neo4j mirror the
same `user_id` so filtering stays consistent everywhere.

### Chat history behavior (ChatGPT-style)

- Sidebar lists the user's chats (titles auto-generated from the first
  question).
- Opening a chat loads its messages; follow-up questions continue in the same
  chat with prior turns as context (this is the "agent memory" open item —
  now effectively required by the chat-history feature).
- A user can delete their own chats; deletion never affects others.

See `docs/DATA_MODEL.md` for the full schema and isolation rules.

## Part 5 — Build order for this addition

Auth is a separable, self-contained feature. Recommended sequence:

1. PostgreSQL `users` + `tokens` models, password hashing, JWT/session.
2. `/api/auth/*` endpoints + email sending (use a free dev SMTP or console
   logging in dev — no paid email service required).
3. Next.js `/login`, `/signup`, `/forgot-password`, `/reset-password`,
   `/verify-email` pages + auth middleware + cookie handling.
4. Attach `user_id` to documents/chats; guard pipeline endpoints.

Do this **as its own branch/PR**, independently testable, and only after (or
alongside) the Phase 1/2 core — so it never blocks the core pipeline. Per
`AGENTS.md`: one focused change per branch, test locally before merge.

## Open decisions for auth (flag, resolve when reached)

- **Email delivery:** real SMTP (Gmail app password / free provider) vs
  dev-mode console logging of links. Dev console is enough for the demo;
  real SMTP needed only if testing the full flow end to end.
- **Session strategy:** httpOnly cookie session vs JWT. Cookie session is
  simpler and more secure for a same-origin dashboard.
- **User isolation:** **decided — fully per-user.** Each user has their own
  documents, chunks, graph entities, chats, and history. No shared corpus.
