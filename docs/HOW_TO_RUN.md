# How to run (local development)

Backend

1. Set environment variables (example):

```
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=aats
export DB_PASSWORD=aats_pass
export DB_NAME=aats_db
export JWT_SECRET=secret
export PORT=8080
```

2. Run locally:

```
cd be
go run main.go
```

Or using Docker Compose (recommended):

```
docker-compose up -d --build
```

Frontend

```
cd fe
npm install
npm run dev
```

Useful endpoints

- POST /api/seed  (seed test data)
- POST /api/login (body: {username,password})
- GET /api/jobs
- GET /api/applications
