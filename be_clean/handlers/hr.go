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

type statusReq struct {
    Status string `json:"status" binding:"required"`
    Note   string `json:"note"`
}

// Allowed application statuses (simple whitelist)
var allowedStatuses = map[string]bool{
    "applied":    true,
    "screening":  true,
    "interview":  true,
    "offer":      true,
    "rejected":   true,
}

// PUT /api/applications/:id/status - HR changes application status
func ChangeApplicationStatus(c *gin.Context) {
    id := c.Param("id")
    var req statusReq
    if err := c.ShouldBindJSON(&req); err != nil {
        middleware.JSONErr(c, http.StatusBadRequest, err.Error())
        return
    }

    if !allowedStatuses[req.Status] {
        middleware.JSONErr(c, http.StatusBadRequest, "invalid status")
        return
    }

    // find application
    var app models.Application
    if err := models.DB.Where("id = ?", id).First(&app).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            middleware.JSONErr(c, http.StatusNotFound, "application not found")
            return
        }
        middleware.JSONErr(c, http.StatusInternalServerError, err.Error())
        return
    }

    // update status
    old := app.Status
    app.Status = req.Status
    if err := models.DB.Save(&app).Error; err != nil {
        middleware.JSONErr(c, http.StatusInternalServerError, err.Error())
        return
    }

    // append timeline
    actorI, _ := c.Get("email")
    actor, _ := actorI.(string)
    tl := models.ApplicationTimeline{
        ID:            uuid.NewString(),
        ApplicationID: app.ID,
        Actor:         actor,
        Action:        "status-change",
        Note:          "from: " + old + " to: " + req.Status + "; " + req.Note,
        CreatedAt:     time.Now(),
    }
    if err := models.DB.Create(&tl).Error; err != nil {
        // non-fatal: return success but with warning
        middleware.JSONOK(c, app, gin.H{"warning": "status updated but timeline failed"})
        // also set a header so clients that check headers can notice
        c.Header("X-Warning", "status updated but timeline failed")
        return
    }
    middleware.JSONOK(c, app, nil)
}
