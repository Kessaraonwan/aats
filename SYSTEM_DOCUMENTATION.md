# AATS System — Technical Documentation

This document describes the AATS (Applicant Tracking & Talent System) project as present in this workspace. It covers the frontend (FE), backend (`be_clean`), database, key code modules, data flows, and developer notes. The goal is to provide an instructor-level, detailed explanation of what each part does and how they interact.

> Note: this file describes the current state of the repository and what can be executed locally using the mock data and dev server. Where applicable, file locations are given relative to the repository root.

---

## Contents
- Overview
- How to run (FE and BE)
- Frontend (FE)
  - Project structure
  - Key files and components
  - Data flow and services
  - Notifications: candidate vs HM
- Backend (be_clean)
  - Project structure
  - Key files and responsibilities
  - API endpoints (detailed)
  - Authentication and middleware
- Database
  - Models and migrations
  - Dialector fallback (Postgres or SQLite)
- Developer notes & debugging
  - HM notifications bug and fix
  - Suggestions and improvements

---

## Overview
AATS is a small hiring workflow web app. The FE is a React + Vite single-page app located in `fe/`. The BE is a Go (Gin) service located in `be_clean/` exposing HTTP JSON APIs. For development, both sides include mock data so the FE can operate without a running BE (or the BE can serve mock endpoints).

This repository includes:
- `fe/`: frontend app (React, Vite, Tailwind)
- `be_clean/`: backend service (Go, Gin, GORM)
- `public/` and `be_clean/public/`: static mock JSON used by BE mock endpoints

---

## How to run
Prerequisites: Node.js (for FE), Go (for BE), and optionally a database (Postgres) if you prefer not to use the included SQLite fallback.

FE (frontend):
1. cd into the `fe/` directory
2. Install dependencies: `npm ci`
3. Start dev server: `npm run dev`
   - Default Vite dev server runs on port 3000. If port 3000 is busy Vite will try another port and HMR will still work.

BE (backend):
1. cd into `be_clean/`
2. Optionally set environment variables (see `be_clean/config/config.go`):
   - `DATABASE_URL` - optional Postgres DSN. If not set, the server uses sqlite `be_clean.db` in the working directory.
   - `PORT` - optional HTTP port (defaults to 8081)
   - `JWT_SECRET` - optional JWT secret (defaults to `dev-secret` if not set)
3. Build/run: `go run main.go` or `go build && ./your_binary`
4. BE exposes `/api` endpoints. For development, several mock endpoints exist under `/api/mock/*`.

Notes on dev convenience:
- FE contains internal mock data (`fe/src/data/mockData.js`). When running in dev mode (Vite), many FE services are configured to prefer mock data (via `import.meta.env.MODE === 'development'` or `VITE_USE_MOCK`).
- BE will auto-create database tables (via GORM migrator) on startup.

---

## Frontend (FE)
Path: `fe/`

High-level stack:
- React (JSX)
- Vite (dev server, bundler)
- Tailwind CSS for styling
- Small in-repo components under `fe/src/components/` (UI primitives) and page-level components under `fe/src/pages/`
- Mock data in `fe/src/data/mockData.js`
- Services in `fe/src/services/` provide an application-layer API to fetch data (jobService, applicationService, authService, etc.)

Key files and what they do (selected):

- `fe/src/App.jsx`
  - Main SPA entry, routes to pages for different roles (candidate, hr, hm, shared pages). It imports both `NotificationsPage` (shared) and `HMNotificationsPage` (HM-specific).

- `fe/src/pages/shared/NotificationsPage.jsx`
  - A generic notifications UI intended for candidates / shared usage. It uses an internal `mockNotifications` array and also reads/writes `window.__mockNotifications` (used for HMR/dev persistence).
  - Behavior: renders list, supports filters (all/unread), mark-as-read, delete single/all. The source of notifications is the `mockNotifications` local array or `window.__mockNotifications` if present (seeded by `fe/src/data/mockData.js`).

- `fe/src/pages/hm/HMNotificationsPage.jsx`
  - HM-specific notifications page. It does not read `window.__mockNotifications` — instead it generates notifications on-the-fly from the list of applications retrieved using `applicationService.getApplications()`.
  - Notifications are derived from business logic: pending applications waiting evaluation, high scoring applicants, and recent evaluations. Each notification object includes id, type, priority, title, message, timestamp, action callback and metadata. The UI supports marking read/unread and actions like "เริ่มประเมิน" which call `onReview`.
  - Important note (bug found & fixed): notifications were computed in a `useMemo` that omitted `applications` in its dependency list. This prevented recomputation after async data load. The dependency list was updated to include `applications` so notifications update when data arrives.

- `fe/src/data/mockData.js`
  - Contains `mockJobs`, `mockApplications`, `mockNotifications` and other sample data. It writes `window.__mockNotifications` and `window.__mockApplications` on the window object to survive HMR during development.
  - This file is the primary source of mock values for FE dev mode.

- `fe/src/services/applicationService.js`
  - Exposes functions to fetch applications: `.getApplications()`, `.getApplication()`, `.getMyApplications()`, etc.
  - In dev mode (or when `VITE_USE_MOCK=true`) it returns `mockApplications` from `fe/src/data/mockData.js` instead of calling the BE API. This allows the HM page to receive application data even with no BE running.
  - The service normalizes `application.data` (parsing JSON string payloads into objects) and enriches applications with job title info by loading `mockJobs` if needed.

- `fe/src/services/api.js`
  - Thin wrapper around fetch/axios (depending on implementation) to call real BE endpoints. Used when not in mock mode.

- UI components (`fe/src/components/ui/*`) implement generic UI atoms (Card, Button, Badge, Tabs) used throughout.

Data flow summary (FE):
- For development, services prefer mock data in `fe/src/data/mockData.js`.
- HMNotificationsPage calls `applicationService.getApplications()` → which returns mockApplications in dev → `applications` loads asynchronously → notifications are computed from `applications` and rendered.
- Shared NotificationsPage reads `window.__mockNotifications` or uses its own `mockNotifications` fallback.

---

## Backend (`be_clean`)
Path: `be_clean/`

Stack and libraries:
- Go (>=1.20 recommended)
- Gin (HTTP router)
- GORM (ORM) with support for Postgres and SQLite
- JWT for auth tokens

Project structure (selected):
- `main.go` — application entrypoint, loads `.env` (godotenv), initializes DB, registers routes and middleware.
- `config/config.go` — reads `PORT`, `DATABASE_URL`, `JWT_SECRET` from env and exposes a `Config` struct.
- `models/models.go` — GORM models and DB initialization + migration logic.
- `handlers/*.go` — HTTP handlers for auth, jobs, applications, HR/HM actions, and mock endpoints.
- `middleware/` — auth middleware and helper JSON response wrappers.
- `public/mock_jobs.json` and `public/mock_applications.json` — used by mock endpoints to return sample data.

Key models and meaning (in `models/models.go`):
- `User` — ID, Email, Password (hashed), Name, Role (candidate / hr / hm), timestamps.
- `Job` — ID, Title, Description, Location, Type, timestamps.
- `Application` — ID, UserID, JobID, ResumeURL, Status (applied/screening/interview/... ), timestamps.
- `ApplicationTimeline` — append-only events for application state changes.
- `Note` — simple note attached to application by HR/HM.
- `HMEvaluation` — hiring manager evaluation record.

DB init and migration:
- `models.InitDB(dsn string)` attempts to open Postgres if `DATABASE_URL` is set. If not (or if it fails), it falls back to SQLite file `be_clean.db` using the `sqlite` driver.
- The code uses GORM migrator to create tables if missing and to add missing columns. It also executes a raw SQL to ensure a unique index on `(user_id, job_id)` for applications.

API endpoints (summary, see `main.go` and `handlers/*.go`):
- Health checks: `GET /health`, `GET /healthz`
- Auth:
  - `POST /api/auth/register` — create a new user (returns JWT token)
  - `POST /api/auth/login` — login (returns JWT token)
  - `GET /api/auth/me` — returns current user (requires auth)
- Users:
  - `GET /api/users` — list users (requires auth)
- Jobs:
  - `GET /api/jobs` — list jobs (pagination + filters)
  - `GET /api/jobs/:id` — get job detail
  - `GET /api/mock/jobs` — serve `public/mock_jobs.json` (dev helper)
- Applications:
  - `POST /api/applications` — candidate applies to a job (requires auth)
  - `GET /api/applications/my` — list applications for authenticated user
  - `PUT /api/applications/:id/status` — HR changes application status (requires `hr` role)
  - `POST /api/applications/:id/notes` — add note (requires `hr` or `hm` role)
  - `POST /api/applications/:id/evaluations` — HM submits evaluation (requires `hm`)
  - `GET /api/mock/applications` — returns `public/mock_applications.json` for FE dev

Authentication and middleware:
- The server uses JWT tokens signed by `JWT_SECRET`. Tokens include `email` and `role` claims.
- `middleware.AuthRequired()` extracts the token, validates, and sets `email` and `role` in the Gin context.
- `middleware.RequireRole("hr")` and similar wrappers check that the user has required role(s) and return HTTP 403 otherwise.

Handler behavior notes:
- Registration hashes passwords using bcrypt and issues a token containing a role (default candidate).
- Login validates password and issues token.
- Many handlers follow a pattern: validate request, look up the authenticated user (by email claim), perform DB operation, create timeline/note where applicable.
- Handlers are defensive: timeline or note append operations are best-effort (a failure there usually does not cause the primary action to fail).

---

## Database (detailed)
The project uses GORM and supports both Postgres (via `gorm.io/driver/postgres`) and SQLite (via `github.com/glebarez/sqlite`).

- Connection selection: if `DATABASE_URL` (DSN) provided and Postgres connects successfully, it is used. If not, sqlite file `be_clean.db` is used as a fallback.
- Tables are created if missing with `Migrator().CreateTable(...)`.
- A raw SQL is executed to ensure unique index `idx_applications_user_job` on the `applications(user_id, job_id)` combination.
- Model hooks: `User.BeforeCreate` ensures UUID primary keys are generated for new users.

Schema summary (columns):
- `users`: id(uuid), email, password, name, role, created_at, updated_at
- `jobs`: id(uuid), title, description, location, type, created_at, updated_at
- `applications`: id(uuid), user_id(uuid), job_id(uuid), resume_url, status, created_at, updated_at
- `application_timelines`: id(uuid), application_id(uuid), actor, action, note, created_at
- `notes`: id(uuid), application_id, actor, body, created_at
- `hm_evaluations`: id(uuid), application_id, evaluator, score, feedback, created_at

---

## Developer notes & debugging

1) HM notifications bug and fix
- Symptom: HM notifications page showed "ไม่มีการแจ้งเตือน" even when `mockApplications` contained entries.
- Root cause: `HMNotificationsPage.jsx` computed the `notifications` via `useMemo(() => { ... }, [onReview])` but the memoization omitted `applications` (the async-loaded source). Because `applications` arrived later, the memo didn't recompute and the UI remained empty.
- Fix: add `applications` to the dependency list: `}, [onReview, applications]);`
- Effect: when `applicationService.getApplications()` resolves and `setApplications(apps)` runs, the memo recomputes and notifications render.

2) How mock data flows between FE and BE
- FE runs in dev mode and `applicationService` has logic to return `mockApplications` when `import.meta.env.MODE === 'development'` or `VITE_USE_MOCK === 'true'`. This allows HM pages to work without BE.
- `fe/src/data/mockData.js` seeds `window.__mockApplications` and `window.__mockNotifications` so the UI components can persist state across HMR reloads.
- BE provides `/api/mock/*` endpoints which simply read `be_clean/public/mock_*.json` and return them; these are for the FE to call if configured to use BE mock endpoints.

3) Recommended improvements
- Add tests (unit tests for handlers and services); this repo currently does not include automated tests.
- Improve error reporting in FE services (surface why API calls fail to user-facing messages and log to console during dev).
- Add explicit loading states to HMNotificationsPage (display spinner while `applications` is null/empty and only show "no notifications" after fetch completes).
- Add truncation safeguards: the HM notification scoring uses `preScreeningScore >= 85` — ensure `preScreeningScore` exists and is numeric in mock data.

---

## File map (quick reference)
- fe/
  - src/
    - App.jsx — main app routing and role-based page selection
    - pages/
      - shared/NotificationsPage.jsx — candidate/shared notification UI (uses `window.__mockNotifications`)
      - hm/HMNotificationsPage.jsx — HM-specific notification UI (derives from applications)
    - services/
      - applicationService.js — returns mockApplications in dev or calls BE API
      - jobService.js — returns mockJobs in dev or calls BE API
      - api.js — thin network wrapper
    - data/mockData.js — seeds `mockJobs`, `mockApplications`, `mockNotifications`
    - components/ui/* — UI primitives
- be_clean/
  - main.go — router and route registration
  - config/config.go — env config loader
  - handlers/* — HTTP handlers for auth, jobs, applications, HR/HM actions
  - models/models.go — GORM models and DB initialization
  - public/
    - mock_jobs.json
    - mock_applications.json

---

## How to inspect the HM notifications flow in code (step-by-step)
1. `fe/src/pages/hm/HMNotificationsPage.jsx` — loads applications via `useEffect` which calls `applicationService.getApplications()`.
2. `fe/src/services/applicationService.js` — in dev mode returns `mockApplications` from `fe/src/data/mockData.js`.
3. `fe/src/data/mockData.js` — contains application objects (with fields used by HM notifications such as `preScreeningScore`, `submittedDate`, `evaluation` etc.).
4. HM page `useMemo` transforms `applications` into a `notifications` array with business rules (pending, high-score, recent-evaluated).
5. UI renders `notifications` in cards and actions call `onReview()` (passed from parent) which in the app typically navigates to an evaluation page.

---

## Quick troubleshooting
- Frontend shows blank or stale notifications:
  - Ensure FE is running in dev mode and `VITE_USE_MOCK` isn't forcing API calls to a missing BE.
  - Check browser console for JS errors.
  - Verify `window.__mockApplications` exists in the console (type `window.__mockApplications` to inspect).
- Backend DB problems on startup:
  - Check `DATABASE_URL` if Postgres is desired. If not provided, `be_clean.db` SQLite file will be used.
  - Check logs printed by `models.InitDB()` — it prints the dialector in use and migrator operations.

---

## Appendix: Example snippet explanations
Below are specific snippets with explanations (so an instructor can see both code and reasoning):

1) `fe/src/pages/hm/HMNotificationsPage.jsx` (notifications generation):
```js
// load applications asynchronously
useEffect(() => {
  (async () => {
    const resp = await applicationService.getApplications();
    const apps = Array.isArray(resp?.data) ? resp.data : resp || [];
    setApplications(apps);
  })();
}, []);

// notifications derived from applications
const notifications = useMemo(() => {
  const notifs = [];
  const pendingApps = applications.filter(app => app.status === 'interview' && !app.evaluation);
  // create pending notification entries
  pendingApps.forEach(app => { ... notifs.push({ id: `pending-${app.id}`, ...}) });
  // high-score and recent-evaluated
  return notifs.sort(...);
}, [onReview, applications]); // <- applications dependency is required so this recomputes
```
Explanation: applications are fetched asynchronously. `useMemo` will cache the notifications until one of its dependencies changes. `applications` must be included so update triggers recomputation.

2) `be_clean/models/models.go` (InitDB behavior):
```go
if dsn != "" {
  db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{ ... })
}
if DB == nil {
  // fallback to sqlite
  db, err = gorm.Open(sqlite.Open("be_clean.db"), &gorm.Config{ ... })
}
// create tables if missing via migrator
migrator := DB.Migrator()
if ok := migrator.HasTable(&User{}); !ok {
  migrator.CreateTable(&User{})
}
// ensure unique index on (user_id, job_id) for applications
DB.Exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_user_job ON applications(user_id, job_id);")
```
Explanation: The code attempts Postgres first then sqlite fallback. Migrations (create table) are run programmatically.

---

If you want, I can:
- Add `SYSTEM_DOCUMENTATION.md` improvements (diagrams, ER diagram, sequence diagram)
- Expand endpoint docs to include request/response examples for each API (I can generate sample curl / JSON payloads)
- Add explicit loading states and tests for the HM notifications path

I already created this file at the repository root: `SYSTEM_DOCUMENTATION.md`.

Would you like me to also:
- Add request/response examples for all API endpoints in the documentation? (Yes/No)
- Generate a simple ER diagram (ASCII or Mermaid) inside the MD file? (Yes/No)
- Create a small script that seeds DB with the mock JSON into the real BE DB? (Yes/No)

Pick one and I will continue with that next.