package main

import (
"log"
"os"

"github.com/gin-gonic/gin"
"github.com/joho/godotenv"

"aats-backend-clean/middleware"
"aats-backend-clean/handlers"
"aats-backend-clean/models"
)

func main() {
_ = godotenv.Load(".env")

models.ConnectDatabase() // เชื่อม Postgres ตาม DATABASE_URL

r := gin.Default()
r.Use(middleware.CORS())

// health
r.GET("/health", func(c *gin.Context) {
c.JSON(200, gin.H{"status": "ok"})
})

// API v1
api := r.Group("/api")

// dev utilities
api.POST("/dev/seed", handlers.SeedDev)
api.POST("/dev/seed_more", handlers.SeedMore)
api.POST("/dev/seed_more_fill", handlers.SeedMoreFill)

// auth
auth := api.Group("/auth")
auth.POST("/register", handlers.Register)
auth.POST("/login", handlers.Login)
// protected me
auth.GET("/me", middleware.AuthMiddleware(), handlers.Me)

// jobs
jobs := api.Group("/jobs")
jobs.GET("", handlers.ListJobs)
jobs.GET("/:id", handlers.GetJob)
// create / update / delete require auth
jobs.POST("", middleware.AuthMiddleware(), handlers.CreateJob)
jobs.PUT("/:id", middleware.AuthMiddleware(), handlers.UpdateJob)
jobs.DELETE("/:id", middleware.AuthMiddleware(), handlers.DeleteJob)

// applications
api.POST("/applications", middleware.AuthMiddleware(), handlers.CreateApplication)
api.GET("/applications", middleware.AuthMiddleware(), handlers.ListApplications)
api.GET("/applications/:id", middleware.AuthMiddleware(), handlers.GetApplication)
api.PATCH("/applications/:id/status", middleware.AuthMiddleware(), handlers.UpdateApplicationStatus)

// notes & evaluations
api.POST("/applications/:id/notes", middleware.AuthMiddleware(), handlers.CreateNote)
api.GET("/applications/:id/notes", middleware.AuthMiddleware(), handlers.ListNotes)

api.POST("/applications/:id/evaluation", middleware.AuthMiddleware(), handlers.CreateEvaluation)
api.GET("/applications/:id/evaluation", middleware.AuthMiddleware(), handlers.GetEvaluation)

// notifications (aggregate derived notifications)
api.GET("/notifications/aggregate", middleware.AuthMiddleware(), handlers.AggregateNotifications)

// uploads
api.POST("/uploads/resume", middleware.AuthMiddleware(), handlers.UploadResume)

// listen
port := os.Getenv("PORT")
if port == "" {
port = "8080"
}
log.Println(" Listening on :" + port)
if err := r.Run(":" + port); err != nil {
log.Fatalf("failed to run server: %v", err)
}
}
