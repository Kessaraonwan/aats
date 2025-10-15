package main

import (
    "fmt"

    "aats-backend-clean/config"
    "aats-backend-clean/models"
    "github.com/google/uuid"
)

// SeedJobs inserts sample jobs if none exist. This is a helper (not a main) so
// we avoid duplicate main functions when multiple seed programs exist.
func SeedJobs() {
    cfg := config.Load()
    if err := models.InitDB(cfg.DatabaseURL); err != nil {
        panic(err)
    }

    // Only seed if no jobs exist
    var count int64
    models.DB.Model(&models.Job{}).Count(&count)
    if count > 0 {
        fmt.Printf("jobs table already has %d rows, skipping seed\n", count)
        return
    }

    samples := []models.Job{
        {ID: uuid.NewString(), Title: "Frontend Engineer", Description: "Work on the React frontend", Location: "Bangkok", Type: "Full-time"},
        {ID: uuid.NewString(), Title: "Backend Engineer", Description: "Design and build Go services", Location: "Remote", Type: "Full-time"},
        {ID: uuid.NewString(), Title: "QA Engineer", Description: "Automated and manual testing", Location: "Chiang Mai", Type: "Contract"},
        {ID: uuid.NewString(), Title: "Product Designer", Description: "Design UX for our product", Location: "Bangkok", Type: "Part-time"},
        {ID: uuid.NewString(), Title: "DevOps Engineer", Description: "Maintain CI/CD and infrastructure", Location: "Remote", Type: "Full-time"},
    }

    if err := models.DB.Create(&samples).Error; err != nil {
        panic(err)
    }

    fmt.Printf("seeded %d jobs\n", len(samples))
}
