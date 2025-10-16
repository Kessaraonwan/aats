package handlers // แพ็กเกจ handlers สำหรับจัดการ API endpoint

import (
	"net/http"      // สำหรับ HTTP status และ response
	"time"          // สำหรับจัดการวันที่

	"github.com/gin-gonic/gin" // Gin framework สำหรับสร้าง API
	"github.com/google/uuid"   // สำหรับสร้าง UUID

	"aats-backend-clean/models" // import models สำหรับเชื่อมต่อ DB
	"gorm.io/gorm"              // สำหรับ session DB
	glogger "gorm.io/gorm/logger" // สำหรับ silent logger
)

// โครงสร้างข้อมูลสำหรับรับ request เพิ่มโน้ต
type NoteBody struct {
	Content string `json:"content" binding:"required"` // เนื้อหาของโน้ต
	Author  string `json:"author"`                     // ผู้เขียนโน้ต (ถ้าไม่ใส่จะใช้ชื่อผู้ใช้)
}

// ฟังก์ชันสำหรับเพิ่มโน้ตในใบสมัคร (POST /api/applications/:id/notes)
// ใช้โดย HR/HM
func CreateNote(c *gin.Context) {
	appID := c.Param("id") // รับ id ของใบสมัครจาก path
	var body NoteBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"}) // error ถ้า body ไม่ถูกต้อง
		return
	}
	var app models.Application
	if appID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing application id"}) // error ถ้าไม่มี id
		return
	}
	if err := models.DB.Where("id = ?", appID).First(&app).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "application not found"}) // error ถ้าไม่พบ application
		return
	}
	uid, _ := c.Get("user_id") // ดึง user_id จาก context
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"}) // error ถ้าไม่ได้ login
		return
	}
	author := body.Author
	// ถ้าไม่ได้ส่งชื่อผู้เขียนมา ให้ใช้ชื่อผู้ใช้
	var user models.User
	if uid != nil && uid.(string) != "" {
		dbSilent := models.DB.Session(&gorm.Session{Logger: glogger.Default.LogMode(glogger.Silent)})
		if err := dbSilent.Where("id = ?", uid.(string)).First(&user).Error; err == nil && author == "" {
			author = user.Name
		}
	}
	// สร้าง struct Note สำหรับบันทึกลง DB
	note := models.Note{
		ID:            uuid.NewString(),
		ApplicationID: appID,
		Author:        author,
		CreatedBy:     uid.(string),
		Content:       body.Content,
		CreatedAt:     time.Now(),
	}
	if err := models.DB.Create(&note).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create note"}) // error ถ้าบันทึกไม่สำเร็จ
		return
	}
	c.JSON(http.StatusCreated, gin.H{"ok": true, "note": note}) // ส่งข้อมูลโน้ตกลับ
}

// ฟังก์ชันสำหรับดึงรายการโน้ตของใบสมัคร (GET /api/applications/:id/notes)
func ListNotes(c *gin.Context) {
	appID := c.Param("id") // รับ id ของใบสมัครจาก path
	if appID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing application id"}) // error ถ้าไม่มี id
		return
	}
	var notes []models.Note
	if err := models.DB.Where("application_id = ?", appID).Order("created_at desc").Find(&notes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot fetch notes"}) // error ถ้าดึงข้อมูลไม่สำเร็จ
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true, "notes": notes}) // ส่งรายการโน้ตกลับ
}
