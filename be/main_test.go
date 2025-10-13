package main

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "os"
    "testing"

    "github.com/DATA-DOG/go-sqlmock"
    "github.com/gin-gonic/gin"
    "github.com/jmoiron/sqlx"
    "time"
)

func TestMain(m *testing.M) {
    // setup sqlmock DB for tests
    sqlDB, mock, err := sqlmock.New()
    if err != nil {
        panic(err)
    }
    db = sqlx.NewDb(sqlDB, "sqlmock")

    // prepare mock rows for jobs
    rows := sqlmock.NewRows([]string{"id", "title", "department", "location", "description", "status", "created_at"}).AddRow(1, "Test Job", "Eng", "Remote", "desc", "active", time.Now())
    mock.ExpectQuery("SELECT id, title, department, location, description, status, created_at FROM jobs").WillReturnRows(rows)

    code := m.Run()

    os.Exit(code)
}

func TestListJobsHandler(t *testing.T) {
    gin.SetMode(gin.TestMode)
    r := gin.New()
    r.GET("/api/jobs", listJobsHandler)

    req, _ := http.NewRequest("GET", "/api/jobs", nil)
    w := httptest.NewRecorder()
    r.ServeHTTP(w, req)
    if w.Code != http.StatusOK {
        t.Fatalf("expected 200 got %d body=%s", w.Code, w.Body.String())
    }
}

func TestLoginHandler_BadPayload(t *testing.T) {
    gin.SetMode(gin.TestMode)
    r := gin.New()
    r.POST("/api/login", loginHandler)

    b, _ := json.Marshal(map[string]string{"username": "", "password": ""})
    req, _ := http.NewRequest("POST", "/api/login", bytes.NewReader(b))
    req.Header.Set("Content-Type", "application/json")
    w := httptest.NewRecorder()
    r.ServeHTTP(w, req)
    if w.Code != http.StatusBadRequest && w.Code != http.StatusUnauthorized {
        t.Fatalf("expected 400 or 401 got %d body=%s", w.Code, w.Body.String())
    }
}
