package handlers

import (
    "net/http"
    "sort"
    "strconv"

    "github.com/gin-gonic/gin"

    "aats-backend-clean/models"
    "gorm.io/gorm"
    glogger "gorm.io/gorm/logger"
)

// GET /api/notifications/aggregate?user_id=&limit=
func AggregateNotifications(c *gin.Context) {
    userID := c.Query("user_id")
    limitStr := c.DefaultQuery("limit", "50")
    limit, _ := strconv.Atoi(limitStr)

    // load recent timeline entries
    var timelines []models.ApplicationTimeline
    if err := models.DB.Order("date desc").Limit(limit).Find(&timelines).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot fetch timeline"})
        return
    }

    // load recent evaluations
    var evaluations []models.Evaluation
    _ = models.DB.Order("evaluated_at desc").Limit(limit).Find(&evaluations).Error

    type Notif struct {
        ID        string      `json:"id"`
        Type      string      `json:"type"`
        Title     string      `json:"title"`
        Message   string      `json:"message"`
        Payload   interface{} `json:"payload,omitempty"`
        Timestamp int64       `json:"timestamp"`
    }

    var notifs []Notif

    for _, t := range timelines {
        if t.ApplicationID == "" {
            continue
        }
        var app models.Application
        if err := models.DB.Where("id = ?", t.ApplicationID).First(&app).Error; err != nil {
            continue
        }
        if userID != "" && app.ApplicantID != userID {
            continue
        }
        var job models.JobPosting
        title := "การอัปเดตสถานะการสมัคร"
        if app.JobID != "" {
            dbSilent := models.DB.Session(&gorm.Session{Logger: glogger.Default.LogMode(glogger.Silent)})
            _ = dbSilent.Where("id = ?", app.JobID).First(&job).Error
            if job.Title != "" {
                title = "สถานะใบสมัคร: " + job.Title
            }
        }
        notifs = append(notifs, Notif{
            ID:        "timeline-" + t.ApplicationID + "-" + t.ID,
            Type:      "info",
            Title:     title,
            Message:   t.Description,
            Payload:   map[string]string{"application_id": t.ApplicationID, "job_id": app.JobID},
            Timestamp: t.Date.Unix(),
        })
    }

    for _, e := range evaluations {
        if e.ApplicationID == "" {
            continue
        }
        var app models.Application
        if err := models.DB.Where("id = ?", e.ApplicationID).First(&app).Error; err != nil {
            continue
        }
        if userID != "" && app.ApplicantID != userID {
            continue
        }
        notifs = append(notifs, Notif{
            ID:        "eval-" + e.ID,
            Type:      "success",
            Title:     "ได้รับการประเมิน",
            Message:   "คะแนนรวม: " + strconv.FormatFloat(float64(e.OverallScore), 'f', 1, 32),
            Payload:   map[string]string{"application_id": e.ApplicationID},
            Timestamp: e.EvaluatedAt.Unix(),
        })
    }

    sort.Slice(notifs, func(i, j int) bool { return notifs[i].Timestamp > notifs[j].Timestamp })
    if len(notifs) > limit {
        notifs = notifs[:limit]
    }

    c.JSON(http.StatusOK, gin.H{"ok": true, "notifications": notifs})
}
