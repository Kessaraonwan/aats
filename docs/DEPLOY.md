## Deploying AATS locally (Docker Compose)

This guide explains how to run PostgreSQL, Adminer and a minimal backend scaffold locally so the frontend can connect to a real API.

Prerequisites
- Docker & Docker Compose installed
- Git

1. Copy environment variables

```powershell
cp .env.example .env
# edit .env and set JWT_SECRET and DB creds if needed
```

2. Start services

```powershell
docker-compose up -d --build
```

3. Check services

```powershell
docker-compose ps
docker-compose logs -f backend
```

4. Seed database (HTTP)

```powershell
Invoke-RestMethod -Method POST -Uri http://localhost:8080/api/seed
```

Adminer will be available at http://localhost:8081 (use credentials from `.env`). Backend listens on http://localhost:8080

---

## Migrating from SQLite -> PostgreSQL (high-level)

1. Choose migration tool: `golang-migrate` or `atlas` are good options.
2. Export existing SQLite schema/data or write migrations (recommended).
3. Update backend config / DSN to point to Postgres.
4. Run migrations against Postgres.
5. Verify data and run tests.

---

## Notes & Next steps

- Replace the minimal backend scaffold with your real `be/` implementation (if you have it restore from backup into `be/`).
- Add proper JWT auth, RBAC middleware, logging, and migrations.
- Add CI steps to run `docker-compose` and tests in pipelines.
