package handlers // แพ็กเกจ handlers สำหรับจัดการ API endpoint

import (
    "net/http"      // สำหรับ HTTP status และ response
    "sort"          // สำหรับเรียงลำดับ slice
    "strconv"       // สำหรับแปลง string/number

    "github.com/gin-gonic/gin" // Gin framework สำหรับสร้าง API

    "aats-backend-clean/models" // import models สำหรับเชื่อมต่อ DB
    "gorm.io/gorm"              // สำหรับ session DB
    glogger "gorm.io/gorm/logger" // สำหรับ silent logger
)

// ฟังก์ชันสำหรับรวม notification (GET /api/notifications/aggregate?user_id=&limit=)
// ใช้สำหรับดึงข้อมูลการแจ้งเตือน timeline และ evaluation ล่าสุด
func AggregateNotifications(c *gin.Context) {
    userID := c.Query("user_id") // รับ user_id จาก query string
    limitStr := c.DefaultQuery("limit", "50") // รับ limit (จำนวนสูงสุด) จาก query string
    limit, _ := strconv.Atoi(limitStr)

    // โหลดข้อมูล timeline ล่าสุด
    var timelines []models.ApplicationTimeline
    if err := models.DB.Order("date desc").Limit(limit).Find(&timelines).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot fetch timeline"}) // error ถ้า query ไม่สำเร็จ
        return
    }

    // โหลดข้อมูล evaluation ล่าสุด
    var evaluations []models.Evaluation
    _ = models.DB.Order("evaluated_at desc").Limit(limit).Find(&evaluations).Error

    // โครงสร้างข้อมูล notification
    type Notif struct {
        ID        string      `json:"id"`         // รหัส notification
        Type      string      `json:"type"`       // ประเภท (info/success)
        Title     string      `json:"title"`      // หัวข้อ
        Message   string      `json:"message"`    // ข้อความ
        Payload   interface{} `json:"payload,omitempty"` // ข้อมูลเพิ่มเติม
        Timestamp int64       `json:"timestamp"`  // เวลาที่เกิดเหตุการณ์
    }

    var notifs []Notif // slice สำหรับเก็บ notification

    // สร้าง notification จาก timeline
    for _, t := range timelines {
        if t.ApplicationID == "" {
            continue // ข้ามถ้าไม่มี application id
        }
        var app models.Application
        if err := models.DB.Where("id = ?", t.ApplicationID).First(&app).Error; err != nil {
            continue // ข้ามถ้าไม่พบ application
        }
        if userID != "" && app.ApplicantID != userID {
            continue // ข้ามถ้าไม่ใช่ของ user นี้
        }
        var job models.JobPosting
        title := "การอัปเดตสถานะการสมัคร"
        if app.JobID != "" {
            dbSilent := models.DB.Session(&gorm.Session{Logger: glogger.Default.LogMode(glogger.Silent)})
            _ = dbSilent.Where("id = ?", app.JobID).First(&job).Error
            if job.Title != "" {
                title = "สถานะใบสมัคร: " + job.Title // ถ้ามี job title ให้แสดงในหัวข้อ
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

    // สร้าง notification จาก evaluation
    for _, e := range evaluations {
        if e.ApplicationID == "" {
            continue // ข้ามถ้าไม่มี application id
        }
        var app models.Application
        if err := models.DB.Where("id = ?", e.ApplicationID).First(&app).Error; err != nil {
            continue // ข้ามถ้าไม่พบ application
        }
        if userID != "" && app.ApplicantID != userID {
            continue // ข้ามถ้าไม่ใช่ของ user นี้
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

    // เรียงลำดับ notification ตามเวลาใหม่สุดไปเก่าสุด
    sort.Slice(notifs, func(i, j int) bool { return notifs[i].Timestamp > notifs[j].Timestamp })
    if len(notifs) > limit {
        notifs = notifs[:limit] // จำกัดจำนวนตาม limit
    }

    // ส่ง notification กลับแบบ JSON
    c.JSON(http.StatusOK, gin.H{"ok": true, "notifications": notifs})
}
