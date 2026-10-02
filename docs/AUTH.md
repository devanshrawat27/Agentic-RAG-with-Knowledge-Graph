# Auth Feature — Implementation Context

> **Read this whole file before writing any auth code.** It is the single
> source of truth for the authentication + per-user isolation feature. It tells
> you exactly what already exists, what to build, what NOT to build, and how to
> test. Pair it with `AGENTS.md` (repo rules) and `docs/DATA_MODEL.md`.
>
> **This feature is owned by one teammate.** Do not touch the core RAG pipeline
> (ingestion, agents, Neo4j, Qdrant). Work on its own branch, test locally,
> then merge per the `AGENTS.md` git workflow.

## 1. What this feature is

A **user-accounts layer** on top of the existing RAG app: signup, email
verification, login, forgot/reset password, sessions, and **full per-user
isolation** (each user has their own documents, chats, graph, and history —
ChatGPT-style).

It is **added scope**, not part of the original roadmap. It does **not** change
any locked architecture decision (Neo4j, Qdrant, Gemini, pipeline order,
Verifier). It only puts accounts in front of the existing pipeline.

## 2. What ALREADY EXISTS (do not recreate — extend/fix/verify)

A previous pass scaffolded this. **Read these files first, then verify them.**
They have **not been tested end to end yet** (Postgres was never started).

| File | What it has |
|---|---|
| `backend/app/core/config.py` | All auth settings (JWT, cookie, SMTP, token expiry) |
| `backend/app/core/security.py` | `hash_password`, `verify_password` (bcrypt + SHA-256 pre-hash), `create_access_token`, `decode_access_token`, `generate_token`, `hash_token` |
| `backend/app/core/email.py` | `send_email`, `send_verification_email`, `send_password_reset_email`; **dev mode** = logs link to console when `SMTP_HOST` empty |
| `backend/app/db/models.py` | SQLAlchemy models: `User`, `Token`, `Chat`, `Message`, `Document` (all with `user_id` where relevant) |
| `backend/app/db/postgres_client.py` | engine, session factory, `get_db` dependency, `create_tables()` |
| `backend/app/schemas/auth.py` | Pydantic request/response schemas |
| `backend/app/api/deps.py` | `get_current_user` (reads httpOnly cookie → JWT → user) |
| `backend/app/api/routes/auth.py` | 7 endpoints: signup, login, logout, me, verify-email, forgot-password, reset-password |
| `backend/app/main.py` | app factory, CORS, table auto-create on startup (non-fatal if DB down) |
| `backend/app/api/router.py` | mounts `/api/health` + `/api/auth/*` |
| `frontend/app/login|signup|forgot-password|reset-password|verify-email|dashboard/page.tsx` | **plain test UI only** (no design) |
| `frontend/lib/api.ts` | typed auth API calls (`credentials: "include"`) |
| `frontend/middleware.ts` | route guard by cookie presence |

The current auth endpoints (all under `/api/auth`):

```
POST /signup            POST /login         POST /logout
GET  /me                POST /verify-email
POST /forgot-password   POST /reset-password
```

## 3. What to BUILD / DO (in this order)

1. **Verify the existing code actually works.** Start Postgres, then run the
   end-to-end test in section 6. Fix bugs found. (Some were already fixed:
   bcrypt >72-byte bug, `.env` path, `DATABASE_URL` override.)
2. **Finish the auth vertical slice** so all 7 endpoints behave per the spec in
   section 4, with the exact status codes.
3. **Attach `user_id` to the core resources** when the core pipeline exposes
   them (documents, chats). Every query must be scoped — see section 5.
   (Core endpoints `/api/documents`, `/api/chat`, `/api/graph` don't exist yet;
   add them as auth-guarded stubs only if needed, otherwise leave to the core
   owner.)
4. **Real UI is NOT your job.** The current pages are a throwaway test UI.
   Keep them plain until Phase E, when the team builds the real design.

## 4. Exact behavior spec (endpoints)

| Endpoint | Input | Success | Failures |
|---|---|---|---|
| `POST /signup` | name, email, password | `201` "Check your email to verify"; user created `is_verified=false`; verify email sent | `409` email already registered; `422` invalid email/short password |
| `POST /login` | email, password | `200` user; sets httpOnly cookie | `401` invalid email/password (generic); `403` email not verified |
| `POST /logout` | — | `200`; clears cookie | — |
| `GET /me` | cookie | `200` current user | `401` not authenticated |
| `POST /verify-email` | token | `200` verified | `400` invalid/expired/used token |
| `POST /forgot-password` | email | `200` always same message | — (never reveal if email exists) |
| `POST /reset-password` | token, new_password | `200` password updated; token consumed | `400` invalid/expired/used token |

**Email verification is MANDATORY.** Login must be blocked (`403`) until the
email is verified. In dev there is no SMTP — the verify/reset link is printed
to the **backend console**. That is expected and correct.

## 5. Per-user isolation — the hard rule

Every stored record belongs to exactly one `user_id`. Every read/write must be
scoped by the authenticated user. Details in `docs/DATA_MODEL.md`.

- **PostgreSQL:** every query filters on `user_id`.
- **Qdrant** (when ingestion lands): per-user collection or `user_id` payload filter.
- **Neo4j** (when extraction lands): traversals start from user-owned nodes.
- Never return another user's data.

## 6. How to test locally (end to end)

Prerequisites: Docker running. Auth needs **only PostgreSQL** (Neo4j/Qdrant not
needed for auth).

```powershell
# from repo root
Copy-Item .env.example .env      # then fill POSTGRES_PASSWORD + JWT_SECRET
docker compose up -d postgres
```

Generate a JWT secret:
```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Run the backend (tables auto-create on startup):
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

Then, using FastAPI docs at http://localhost:8000/docs (or curl):

1. **Signup** → returns 201. Watch the **backend console** for the verify link.
2. **Login before verifying** → expect `403`.
3. **Verify** the token from the console link → 200.
4. **Login** → 200, cookie set. Then `GET /me` with the cookie → 200.
5. **Forgot password** → console shows reset link → **reset** → login with new password.
6. Confirm a second user cannot see the first user's data (once core endpoints exist).

Check users directly:
```powershell
docker compose exec postgres psql -U postgres -d agentic_rag -c "select id,email,is_verified from users;"
```

## 7. What NOT to do

- ❌ Do NOT change locked architecture (Neo4j, Qdrant, Gemini, pipeline order, Verifier).
- ❌ Do NOT build the real login/chat UI or do design/styling — that is Phase E.
- ❌ Do NOT touch ingestion/agents/Neo4j/Qdrant code.
- ❌ Do NOT store the auth token in localStorage — use the httpOnly cookie.
- ❌ Do NOT reveal whether an email is registered (forgot-password always says the same thing).
- ❌ Do NOT build the whole thing at once — one focused change per branch/PR.
- ❌ Do NOT commit `.env` or any real secret — placeholders only in `.env.example`.

## 8. Decisions already made (don't re-litigate)

- **Email verification:** mandatory.
- **Email delivery (dev):** console logging when `SMTP_HOST` empty; real SMTP later optional.
- **Session:** JWT in an **httpOnly cookie** (not localStorage).
- **User isolation:** fully per-user (no shared corpus).
- **Password hashing:** bcrypt with SHA-256 pre-hash (handles any password length).

## 9. Known caveats / watch-outs

- **Live cookie caveat:** locally backend (`:8000`) and frontend (`:3000`) are
  same-host so the middleware reads the cookie. On live, different domains make
  the cookie cross-site → middleware won't see it. Fix at deploy time (one
  domain / proxy `/api`, `secure=True`). See `AGENTS.md`.
- **Table creation** is `create_all` (dev convenience). Real migrations can come
  later; don't add Alembic unless the team asks.
- **Python 3.14:** dependencies use `>=` bounds; LangChain/LangGraph resolved to
  1.x. Auth itself has no LangChain dependency.

## 10. Definition of done (for this feature)

- [ ] All 7 endpoints match section 4, tested end to end with Postgres running.
- [ ] Signup → console verify link → verify → login → `/me` works.
- [ ] Forgot → reset → login with new password works.
- [ ] Unverified login is blocked; duplicate signup is blocked.
- [ ] No cross-user data leakage.
- [ ] Backend import + `/health` still pass; `frontend npm run build` still passes.
- [ ] Merged to `main` per the `AGENTS.md` git workflow (pull first, own branch,
      local test, no breakage).
