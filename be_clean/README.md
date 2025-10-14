# be_clean — Backend quickstart (merged)

This file merges the student quickstart and the Thai quick guide for `be_clean` into a single, compact README.

## Quick summary
- Location: `be_clean`
- Language: Go (Gin + GORM)
- Run fast with SQLite fallback or recommended Postgres via Docker Compose

## Run (SQLite - fast)
```powershell
cd 'C:\Users\TOR\Downloads\ATS UI_UX Guidelines\be_clean'
go mod download
go run main.go
```
Server listens on :8081 by default.

## Run (Postgres + Docker Compose - recommended)
```powershell
cd 'C:\Users\TOR\Downloads\ATS UI_UX Guidelines\be_clean'
docker compose up -d --build
# then seed (adjust if ports/creds changed)
$env:DATABASE_URL = 'postgres://aats_user:aats_password@localhost:5433/aats_db?sslmode=disable'
.\scripts\seed.ps1 -DatabaseUrl $env:DATABASE_URL
```

## Quick smoke tests (PowerShell)
```powershell
cd be_clean
.\scripts\smoke_test.ps1
```

## Important endpoints
- Health: `GET /health`
- Mock jobs: `GET /api/mock/jobs`
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Jobs: `GET /api/jobs`, `GET /api/jobs/:id`
- Applications: `POST /api/applications` (expects `jobId` and `resumeUrl`), `GET /api/applications/my`

## File map (brief)
- `main.go` — router, DB init
- `handlers/` — HTTP handlers (auth, jobs, applications, hr, notes, mock)
- `models/` — GORM models and `InitDB`
- `middleware/` — CORS, logger, auth middleware
- `scripts/` — seeder & test scripts (PowerShell)
- `public/` — mock JSON

## Artifacts considered safe to remove
- `server.exe` — compiled binary
- `be_clean.db` — sqlite file
- `be_clean.log` — logs
- `run_server.bat` — old Windows start script

These artifacts were requested to be removed; backups are placed under `backups/removed_builds/` before deletion.

---

(Merged from `README_STUDENT.md` and `README_TH.md`)
