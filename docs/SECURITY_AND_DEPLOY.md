# Security & Deploy notes (summary)

Short checklist for production readiness:

- Secrets management: do not store secrets in code or `.env` files checked into repo. Use environment variables or a secrets manager (Vault, AWS Secrets Manager, Azure Key Vault).
- TLS/HTTPS: Terminate TLS at load balancer or use a reverse proxy (nginx) with certificates (Let's Encrypt / ACM).
- JWT: use strong secret, rotate periodically, implement refresh tokens and short access token TTL.
- DB backups: schedule regular backups and test restores.
- Migrations: use a migration tool (golang-migrate, Atlas) and keep migrations under version control.
- Monitoring: add metrics (Prometheus), centralized logs (ELK / Loki), and error reporting (Sentry).
- Healthchecks: add `/health` and readiness/liveness endpoints; configure container restart policies and readiness probes.
