package handlers

import (
    "io/ioutil"
    "net/http"
    "path/filepath"

    "github.com/gin-gonic/gin"
)

// GET /api/mock/jobs
func MockJobs(c *gin.Context) {
    path := filepath.Join("public", "mock_jobs.json")
    data, err := ioutil.ReadFile(path)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "mock jobs not found"})
        return
    }
    c.Data(http.StatusOK, "application/json", data)
}

// GET /api/mock/applications
func MockApplications(c *gin.Context) {
    path := filepath.Join("public", "mock_applications.json")
    data, err := ioutil.ReadFile(path)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "mock applications not found"})
        return
    }
    c.Data(http.StatusOK, "application/json", data)
}
