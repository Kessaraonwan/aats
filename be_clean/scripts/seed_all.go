package main

import (
    "fmt"

    "aats-backend-clean/config"
    "aats-backend-clean/models"
    "github.com/google/uuid"
    "golang.org/x/crypto/bcrypt"
)

func mustHash(pw string) string {
    h, _ := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
    return string(h)
}

func main() {
    cfg := config.Load()
    if err := models.InitDB(cfg.DatabaseURL); err != nil {
        panic(err)
    }

    // seed users
    var ucount int64
    models.DB.Model(&models.User{}).Count(&ucount)
    if ucount == 0 {
        u1 := models.User{ID: uuid.NewString(), Email: "alice@example.com", Password: mustHash("password123"), Name: "Alice", Role: "candidate"}
        u2 := models.User{ID: uuid.NewString(), Email: "bob@company.com", Password: mustHash("password123"), Name: "Bob", Role: "hr"}
        models.DB.Create(&[]models.User{u1, u2})
        fmt.Printf("seeded users: 2\n")
    } else {
        fmt.Printf("users table has %d rows, skipping users seed\n", ucount)
    }

    // seed jobs (always reseed with Thai data)
    models.DB.Unscoped().Delete(&models.Job{})
    samples := []models.Job{
        {ID: uuid.NewString(), Title: "วิศวกร Frontend", Description: "ทำงานกับ React frontend", Location: "กรุงเทพฯ", Type: "เต็มเวลา"},
        {ID: uuid.NewString(), Title: "วิศวกร Backend", Description: "ออกแบบและสร้างบริการ Go", Location: "ระยะไกล", Type: "เต็มเวลา"},
        {ID: uuid.NewString(), Title: "วิศวกร QA", Description: "ทดสอบอัตโนมัติและด้วยมือ", Location: "เชียงใหม่", Type: "สัญญาจ้าง"},
        {ID: uuid.NewString(), Title: "นักออกแบบผลิตภัณฑ์", Description: "ออกแบบ UX สำหรับผลิตภัณฑ์ของเรา", Location: "กรุงเทพฯ", Type: "พาร์ทไทม์"},
        {ID: uuid.NewString(), Title: "วิศวกร DevOps", Description: "ดูแล CI/CD และโครงสร้างพื้นฐาน", Location: "ระยะไกล", Type: "เต็มเวลา"},
    }
    models.DB.Create(&samples)
    fmt.Printf("seeded %d jobs\n", len(samples))

    // seed applications: pick first candidate user and first 3 jobs
    var candidate models.User
    if err := models.DB.Where("role = ?", "candidate").First(&candidate).Error; err != nil {
        fmt.Printf("no candidate user found to seed applications: %v\n", err)
        return
    }

    var jobs []models.Job
    models.DB.Order("created_at asc").Limit(3).Find(&jobs)
    if len(jobs) == 0 {
        fmt.Printf("no jobs found to create applications\n")
        return
    }

    // always reseed applications
    models.DB.Unscoped().Delete(&models.ApplicationTimeline{})
    models.DB.Unscoped().Delete(&models.Application{})
    for _, j := range jobs {
        app := models.Application{ID: uuid.NewString(), UserID: candidate.ID, JobID: j.ID, ResumeURL: "https://example.com/resume.pdf", Status: "applied"}
        if err := models.DB.Create(&app).Error; err != nil {
            fmt.Printf("failed to create application: %v\n", err)
            continue
        }
        // timeline
        tl := models.ApplicationTimeline{ID: uuid.NewString(), ApplicationID: app.ID, Actor: candidate.Email, Action: "applied", Note: "seeded application"}
        models.DB.Create(&tl)
    }
    fmt.Printf("seeded applications for user %s\n", candidate.Email)
}
