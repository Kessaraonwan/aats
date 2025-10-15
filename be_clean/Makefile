.PHONY: dev build seed test

# Start development stack (docker-compose must be available)
dev:
	docker-compose up --build

# Build only the backend image
build:
	docker-compose build backend

# Seed the database with sample data. Set DATABASE_URL env to target Postgres if desired.
seed:
	@echo "Running seed script (uses DATABASE_URL env if set)..."
	@powershell -NoProfile -ExecutionPolicy Bypass -Command "& { if ($env:COMSPEC) { powershell -NoProfile -ExecutionPolicy Bypass -File scripts/seed.ps1 } else { go run scripts/seed_all.go } }"

# Run the backend locally (sqlite fallback)
run:
	@echo "Running backend (sqlite fallback) on PORT=8082"
	@set PORT=8082 && set DATABASE_URL= && go run .

# Run Go tests (if any)
test:
	go test ./...
