package main

import (
    "crypto/rand"
    "encoding/base64"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "os"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/golang-jwt/jwt/v5"
    "github.com/jmoiron/sqlx"
    _ "github.com/lib/pq"
    "golang.org/x/crypto/bcrypt"
)

var db *sqlx.DB

func main() {
    dbHost := getenv("DB_HOST", "localhost")
    dbPort := getenv("DB_PORT", "5432")
    dbUser := getenv("DB_USER", "aats")
    dbPass := getenv("DB_PASSWORD", "aats_pass")
    dbName := getenv("DB_NAME", "aats_db")

    dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", dbUser, dbPass, dbHost, dbPort, dbName)
    var err error
    db, err = sqlx.Connect("postgres", dsn)
    if err != nil {
        log.Fatalf("failed to connect to db: %v", err)
    }

    // ensure users table
    schema := `CREATE TABLE IF NOT EXISTS users (id serial PRIMARY KEY, username text UNIQUE, role text, password text);`
    if _, err := db.Exec(schema); err != nil {
        log.Fatalf("failed to ensure schema: %v", err)
    }

    // ensure jobs and applications tables
    jobSchema := `CREATE TABLE IF NOT EXISTS jobs (id serial PRIMARY KEY, title text, department text, location text, description text, status text, created_at timestamptz DEFAULT now(), closing_date timestamptz);`
    if _, err := db.Exec(jobSchema); err != nil {
        log.Fatalf("failed to ensure jobs schema: %v", err)
    }

    appSchema := `CREATE TABLE IF NOT EXISTS applications (id serial PRIMARY KEY, user_id int REFERENCES users(id), job_id int REFERENCES jobs(id), status text, created_at timestamptz DEFAULT now(), data jsonb);`
    if _, err := db.Exec(appSchema); err != nil {
        log.Fatalf("failed to ensure applications schema: %v", err)
    }

    r := gin.Default()
    r.Use(corsMiddleware())

    r.GET("/health", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"status": "ok"}) })

    api := r.Group("/api")
    {
        api.POST("/seed", seedHandler)
        api.POST("/login", loginHandler)

        secured := api.Group("")
        secured.Use(authMiddleware())
        {
            secured.GET("/me", meHandler)

            // example RBAC-protected route
            secured.GET("/admin-only", requireRole("hr"), adminOnlyHandler)
        }
        // public job endpoints
        api.GET("/jobs", listJobsHandler)
        api.GET("/jobs/:id", getJobHandler)
        api.POST("/jobs", createJobHandler)

        // application endpoints
        api.GET("/applications", listApplicationsHandler)
        api.POST("/applications", createApplicationHandler)
        api.GET("/applications/my", authMiddleware(), myApplicationsHandler)
    }

    port := getenv("PORT", "8080")
    log.Printf("listening on :%s", port)
    r.Run(":" + port)
}

func getenv(k, d string) string {
    v := os.Getenv(k)
    if v == "" {
        return d
    }
    return v
}

// seedHandler: insert a sample user with bcrypt-hashed password
func seedHandler(c *gin.Context) {
    users := []struct {
        Username string
        Role     string
        Password string
    }{
        {"alice", "candidate", "password"},
        {"bob", "hr", "password"},
        {"carol", "hm", "password"},
    }

    for _, u := range users {
        hashed, _ := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
        _, err := db.Exec("INSERT INTO users (username, role, password) VALUES ($1,$2,$3) ON CONFLICT (username) DO NOTHING", u.Username, u.Role, string(hashed))
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }
    }
    // Insert sample jobs
    jobs := []Job{
        {Title: "Frontend Developer", Department: "Engineering", Location: "Bangkok", Description: "Build UIs using React", Status: "active"},
        {Title: "Backend Engineer", Department: "Engineering", Location: "Bangkok", Description: "Design and implement REST APIs", Status: "active"},
        {Title: "HR Specialist", Department: "HR", Location: "Remote", Description: "Manage candidate lifecycle", Status: "active"},
        {Title: "Data Analyst", Department: "Data", Location: "Bangkok", Description: "Analyze recruitment metrics", Status: "active"},
        {Title: "DevOps Engineer", Department: "Engineering", Location: "Bangkok", Description: "Maintain CI/CD pipelines", Status: "active"},
    }

    // insert jobs idempotently (by title)
    for _, j := range jobs {
        _, err := db.Exec("INSERT INTO jobs (title, department, location, description, status) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (title) DO NOTHING", j.Title, j.Department, j.Location, j.Description, j.Status)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }
    }

    // Create sample applications (associate by username)
    // find user ids
    type seedApp struct {
        Username string
        JobIdx   int
        Status   string
        Data     any
    }

    seedApps := []seedApp{
        {Username: "alice", JobIdx: 1, Status: "submitted", Data: map[string]any{"resume": "/files/alice_cv.pdf", "cover_letter": "I am excited to apply for this role.", "fields": map[string]int{"experience": 3}}},
        {Username: "bob", JobIdx: 2, Status: "screened", Data: map[string]any{"note": "passed screening", "reviewer": "bob"}},
        {Username: "carol", JobIdx: 1, Status: "interview", Data: map[string]any{"interviewer": "bob", "score": 4, "notes": "Strong technical skills"}},
    }

    // create a map from job title to id for deterministic association
    jobIDs := map[string]int{}
    rows, err := db.Queryx("SELECT id, title FROM jobs")
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    for rows.Next() {
        var id int
        var title string
        if err := rows.Scan(&id, &title); err == nil {
            jobIDs[title] = id
        }
    }

    tx, err := db.Beginx()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    defer func() {
        if err != nil {
            tx.Rollback()
        } else {
            tx.Commit()
        }
    }()

    for _, sa := range seedApps {
        var userID int
        err = tx.Get(&userID, "SELECT id FROM users WHERE username=$1", sa.Username)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot resolve user " + sa.Username})
            return
        }

        // map JobIdx to job title in our jobs slice (simple deterministic mapping)
        idx := sa.JobIdx - 1
        if idx < 0 || idx >= len(jobs) {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid job index in seed data"})
            return
        }
        title := jobs[idx].Title
        jobID, ok := jobIDs[title]
        if !ok {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "job not found: " + title})
            return
        }

        // avoid duplicate applications for the same user+job+status
        var existing int
        _ = tx.Get(&existing, "SELECT id FROM applications WHERE user_id=$1 AND job_id=$2 LIMIT 1", userID, jobID)
        if existing != 0 {
            // skip
            continue
        }

        jb, _ := jsonMarshal(sa.Data)
        _, err = tx.Exec("INSERT INTO applications (user_id, job_id, status, data) VALUES ($1,$2,$3,$4::jsonb)", userID, jobID, sa.Status, string(jb))
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }
    }

    c.JSON(http.StatusOK, gin.H{"seeded": true})
}

type loginReq struct {
    Username string `json:"username" binding:"required"`
    Password string `json:"password" binding:"required"`
}

func loginHandler(c *gin.Context) {
    var req loginReq
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
        return
    }

    var id int
    var username, role, hashed string
    err := db.QueryRow("SELECT id, username, role, password FROM users WHERE username=$1", req.Username).Scan(&id, &username, &role, &hashed)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
        return
    }

    if bcrypt.CompareHashAndPassword([]byte(hashed), []byte(req.Password)) != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
        return
    }

    token, err := createToken(username, role)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create token"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"token": token})
}

func createToken(username, role string) (string, error) {
    secret := getenv("JWT_SECRET", "secret")
    claims := jwt.MapClaims{
        "sub":  username,
        "role": role,
        "exp":  time.Now().Add(24 * time.Hour).Unix(),
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(secret))
}

func authMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        auth := c.GetHeader("Authorization")
        if auth == "" {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing auth"})
            return
        }
        var tokenString string
        fmt.Sscanf(auth, "Bearer %s", &tokenString)
        if tokenString == "" {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid auth header"})
            return
        }

        secret := getenv("JWT_SECRET", "secret")
        token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
            if t.Method.Alg() != jwt.SigningMethodHS256.Alg() {
                return nil, fmt.Errorf("unexpected signing method")
            }
            return []byte(secret), nil
        })
        if err != nil || !token.Valid {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
            return
        }
        claims, ok := token.Claims.(jwt.MapClaims)
        if !ok {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid claims"})
            return
        }

        // set user info in context
        c.Set("user", claims["sub"])
        c.Set("role", claims["role"])
        c.Next()
    }
}

func requireRole(role string) gin.HandlerFunc {
    return func(c *gin.Context) {
        r, ok := c.Get("role")
        if !ok || r == nil {
            c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "forbidden"})
            return
        }
        if r != role {
            c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "forbidden"})
            return
        }
        c.Next()
    }
}

func meHandler(c *gin.Context) {
    user, _ := c.Get("user")
    role, _ := c.Get("role")
    c.JSON(http.StatusOK, gin.H{"user": user, "role": role})
}

func adminOnlyHandler(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{"admin": "ok"})
}

// helper to generate random secret (not used automatically)
func genSecret(n int) string {
    b := make([]byte, n)
    rand.Read(b)
    return base64.RawURLEncoding.EncodeToString(b)
}

// Simple CORS middleware for local development
func corsMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
        c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        c.Next()
    }
}

// Job and application handlers
type Job struct {
    ID          int       `db:"id" json:"id"`
    Title       string    `db:"title" json:"title"`
    Department  string    `db:"department" json:"department"`
    Location    string    `db:"location" json:"location"`
    Description string    `db:"description" json:"description"`
    Status      string    `db:"status" json:"status"`
    CreatedAt   time.Time `db:"created_at" json:"created_at"`
}

func listJobsHandler(c *gin.Context) {
    var jobs []Job
    err := db.Select(&jobs, "SELECT id, title, department, location, description, status, created_at FROM jobs ORDER BY created_at DESC LIMIT 100")
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, gin.H{"data": jobs, "meta": gin.H{"total": len(jobs)}})
}

func getJobHandler(c *gin.Context) {
    id := c.Param("id")
    var job Job
    err := db.Get(&job, "SELECT id, title, department, location, description, status, created_at FROM jobs WHERE id=$1", id)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"data": job})
}

func createJobHandler(c *gin.Context) {
    // require HR role
    role, _ := c.Get("role")
    if role != "hr" {
        c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
        return
    }
    var in struct {
        Title       string `json:"title"`
        Department  string `json:"department"`
        Location    string `json:"location"`
        Description string `json:"description"`
        Status      string `json:"status"`
    }
    if err := c.ShouldBindJSON(&in); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
        return
    }
    var id int
    err := db.QueryRow("INSERT INTO jobs (title, department, location, description, status) VALUES ($1,$2,$3,$4,$5) RETURNING id", in.Title, in.Department, in.Location, in.Description, in.Status).Scan(&id)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusCreated, gin.H{"data": gin.H{"id": id}})
}

type Application struct {
    ID        int       `db:"id" json:"id"`
    UserID    int       `db:"user_id" json:"user_id"`
    JobID     int       `db:"job_id" json:"job_id"`
    Status    string    `db:"status" json:"status"`
    CreatedAt time.Time `db:"created_at" json:"created_at"`
    Data      string    `db:"data" json:"data"`
}

func listApplicationsHandler(c *gin.Context) {
    var apps []Application
    err := db.Select(&apps, "SELECT id, user_id, job_id, status, created_at, data FROM applications ORDER BY created_at DESC LIMIT 200")
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, gin.H{"data": apps, "meta": gin.H{"total": len(apps)}})
}

func createApplicationHandler(c *gin.Context) {
    var in struct {
        JobID int             `json:"job_id"`
        Data  map[string]any  `json:"data"`
    }
    if err := c.ShouldBindJSON(&in); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
        return
    }
    // if authenticated, get user id
    var userID int
    if user, ok := c.Get("user"); ok && user != nil {
        // find user id
        err := db.Get(&userID, "SELECT id FROM users WHERE username=$1", user.(string))
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot resolve user"})
            return
        }
    }
    // store data as JSON
    _, err := db.Exec("INSERT INTO applications (user_id, job_id, status, data) VALUES ($1,$2,$3,$4)", userID, in.JobID, "submitted", toJsonB(in.Data))
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusCreated, gin.H{"created": true})
}

func myApplicationsHandler(c *gin.Context) {
    user, _ := c.Get("user")
    if user == nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
        return
    }
    var userID int
    err := db.Get(&userID, "SELECT id FROM users WHERE username=$1", user.(string))
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot resolve user"})
        return
    }
    var apps []Application
    err = db.Select(&apps, "SELECT id, user_id, job_id, status, created_at, data FROM applications WHERE user_id=$1 ORDER BY created_at DESC", userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, gin.H{"data": apps})
}

// helper to convert a Go map to JSONB parameter (Postgres)
func toJsonB(v any) string {
    // naive: marshal to JSON string
    b, _ := jsonMarshal(v)
    return string(b)
}

// small JSON marshal helper to avoid importing encoding/json in many places
func jsonMarshal(v any) ([]byte, error) {
    return jsonMarshalStd(v)
}

// wrap standard library marshal (kept separate for readability)
func jsonMarshalStd(v any) ([]byte, error) {
    return json.Marshal(v)
}

