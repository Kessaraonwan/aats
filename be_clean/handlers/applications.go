package handlers

import (
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/google/uuid"

    "aats-backend-clean/models"
    "gorm.io/gorm"
    "aats-backend-clean/middleware"
)

type applyReq struct {
    JobID     string `json:"jobId" binding:"required,uuid"`
    ResumeURL string `json:"resumeUrl" binding:"required,url"`
}

// POST /api/applications - candidate applies to a job
func ApplyJob(c *gin.Context) {
    var req applyReq
    if err := c.ShouldBindJSON(&req); err != nil {
        middleware.JSONErr(c, http.StatusBadRequest, err.Error())
        return
    }

    // require auth email in context
    emailI, ok := c.Get("email")
    if !ok {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
        return
    }
    email := emailI.(string)

    // find user
    var u models.User
    if err := models.DB.Where("email = ?", email).First(&u).Error; err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
        return
    }

    // ensure job exists
    var j models.Job
    if err := models.DB.Where("id = ?", req.JobID).First(&j).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            middleware.JSONErr(c, http.StatusBadRequest, "job not found")
            return
        }
        middleware.JSONErr(c, http.StatusInternalServerError, err.Error())
        return
    }

    // prevent duplicate application: check unique (user_id, job_id)
    var existing models.Application
    if err := models.DB.Where("user_id = ? AND job_id = ?", u.ID, req.JobID).First(&existing).Error; err == nil {
        middleware.JSONErr(c, http.StatusConflict, "already applied")
        return
    } else if err != gorm.ErrRecordNotFound {
        middleware.JSONErr(c, http.StatusInternalServerError, err.Error())
        return
    }

    app := models.Application{
        ID:        uuid.NewString(),
        UserID:    u.ID,
        JobID:     req.JobID,
        ResumeURL: req.ResumeURL,
        Status:    "applied",
    }

    if err := models.DB.Create(&app).Error; err != nil {
        middleware.JSONErr(c, http.StatusInternalServerError, err.Error())
        return
    }

    // append timeline
    timeline := models.ApplicationTimeline{
        ID:            uuid.NewString(),
        ApplicationID: app.ID,
        Actor:         email,
        Action:        "applied",
        Note:          "Candidate applied",
        CreatedAt:     time.Now(),
    }
    if err := models.DB.Create(&timeline).Error; err != nil {
        // log but don't fail the application (best-effort)
        // return success but include a warning
        middleware.JSONCreated(c, app)
        // include a warning in headers as a minimal non-breaking approach
        c.Header("X-Warning", "application saved but timeline failed")
        return
    }
    middleware.JSONCreated(c, app)
}

// GET /api/applications/my - list applications for authenticated user
func ListMyApplications(c *gin.Context) {
    emailI, ok := c.Get("email")
    if !ok {
        middleware.JSONErr(c, http.StatusUnauthorized, "unauthenticated")
        return
    }
    email := emailI.(string)

    var u models.User
    if err := models.DB.Where("email = ?", email).First(&u).Error; err != nil {
        middleware.JSONErr(c, http.StatusUnauthorized, "user not found")
        return
    }

    var apps []models.Application
    if err := models.DB.Where("user_id = ?", u.ID).Order("created_at desc").Find(&apps).Error; err != nil {
        middleware.JSONErr(c, http.StatusInternalServerError, err.Error())
        return
    }
    middleware.JSONOK(c, apps, nil)
}
