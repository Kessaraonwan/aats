package main

import (
    "log"
    "os"

    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"

    "aats-backend-clean/handlers"
    "aats-backend-clean/middleware"
    "aats-backend-clean/config"
    "aats-backend-clean/models"
)

func main() {
    if err := godotenv.Load(); err != nil {
        log.Println(".env not found, using environment variables")
    }

    // Load config
    cfg := config.Load()

    // Init DB
    if err := models.InitDB(cfg.DatabaseURL); err != nil {
        log.Fatalf("failed to init db: %v", err)
    }

    port := os.Getenv("PORT")
    if port == "" {
        port = "8081"
    }

    r := gin.New()
    // attach CORS, logger and recovery/error handler
    middleware.AttachCommonMiddleware(r)

    r.GET("/health", handlers.Health)
    r.GET("/healthz", handlers.Health)

    api := r.Group("/api")
    {
    api.POST("/auth/register", handlers.Register)
    api.POST("/auth/login", handlers.Login)
    api.GET("/auth/me", middleware.AuthRequired(), handlers.Me)
        // protect users route
        api.GET("/users", middleware.AuthRequired(), handlers.ListUsers)
        // public jobs
        api.GET("/jobs", handlers.ListJobs)
        api.GET("/jobs/:id", handlers.GetJob)
    // mock endpoints for FE dev
    api.GET("/mock/jobs", handlers.MockJobs)
    api.GET("/mock/applications", handlers.MockApplications)
        // applications (protected)
        api.POST("/applications", middleware.AuthRequired(), handlers.ApplyJob)
        api.GET("/applications/my", middleware.AuthRequired(), handlers.ListMyApplications)
        // HR: change application status
        api.PUT("/applications/:id/status", middleware.AuthRequired(), middleware.RequireRole("hr"), handlers.ChangeApplicationStatus)
    // notes (HR/HM)
    api.POST("/applications/:id/notes", middleware.AuthRequired(), middleware.RequireRole("hr", "hm"), handlers.AddNote)
    // HM evaluations (HM only)
    api.POST("/applications/:id/evaluations", middleware.AuthRequired(), middleware.RequireRole("hm"), handlers.AddEvaluation)
    }

    log.Printf("Starting be_clean on :%s", port)
    r.Run(":" + port)
}
