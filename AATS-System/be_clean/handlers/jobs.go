package handlers // แพ็กเกจ handlers สำหรับจัดการ API endpoint

import (
	"net/http"      // สำหรับ HTTP status และ response
	"time"          // สำหรับจัดการวันที่

	"github.com/gin-gonic/gin" // Gin framework สำหรับสร้าง API
	"github.com/google/uuid"   // สำหรับสร้าง UUID

	"aats-backend-clean/models" // import models สำหรับเชื่อมต่อ DB
)

// โครงสร้างข้อมูลสำหรับรับ request ในการสร้าง/แก้ไขงาน
type CreateJobBody struct {
	Title            string `json:"title" binding:"required"`           // ชื่อตำแหน่งงาน (ต้องกรอก)
	Department       string `json:"department"`                         // แผนก
	Location         string `json:"location"`                           // สถานที่ทำงาน
	ExperienceLevel  string `json:"experience_level"`                   // ระดับประสบการณ์
	Description      string `json:"description"`                        // รายละเอียดงาน
	Requirements     string `json:"requirements"`                       // คุณสมบัติ
	Responsibilities string `json:"responsibilities"`                   // หน้าที่รับผิดชอบ
	Status           string `json:"status"`       // สถานะงาน (active/closed/draft)
	ClosingDate      string `json:"closing_date"` // วันปิดรับสมัคร (ISO date)
}

// ฟังก์ชันสำหรับดึงรายการงานทั้งหมด (GET /api/jobs)
func ListJobs(c *gin.Context) {
	status := c.Query("status") // รับ query string status
	var jobs []models.JobPosting // สร้าง slice สำหรับเก็บผลลัพธ์
	q := models.DB.Order("posted_date desc") // query เรียงตามวันที่โพสต์
	if status != "" {
		q = q.Where("status = ?", status) // ถ้ามี status filter ให้กรอง
	}
	if err := q.Find(&jobs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot fetch jobs"}) // error กรณี query ไม่สำเร็จ
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true, "jobs": jobs}) // ส่ง jobs กลับแบบ JSON
}

// ฟังก์ชันสำหรับดึงรายละเอียดงานตาม id (GET /api/jobs/:id)
func GetJob(c *gin.Context) {
	id := c.Param("id") // รับ id จาก path
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing id"}) // error ถ้าไม่มี id
		return
	}
	var job models.JobPosting
	if err := models.DB.Where("id = ?", id).First(&job).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "job not found"}) // error ถ้าไม่พบงาน
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true, "job": job}) // ส่งข้อมูลงานกลับ
}

// ฟังก์ชันสำหรับสร้างงานใหม่ (POST /api/jobs)
// ต้องผ่าน middleware ตรวจสอบสิทธิ์ HR ก่อน (ดูที่ main.go)
func CreateJob(c *gin.Context) {
	var body CreateJobBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"}) // error ถ้า body ไม่ถูกต้อง
		return
	}
	uid, _ := c.Get("user_id") // ดึง user_id จาก context (middleware ใส่ไว้)

	closing := time.Now().AddDate(0, 2, 0) // กำหนดวันปิดรับสมัคร default = 2 เดือน
	if body.ClosingDate != "" {
		if t, err := time.Parse(time.RFC3339, body.ClosingDate); err == nil {
			closing = t // ถ้ามี closing_date ใน request ใช้ค่านั้น
		}
	}

	// สร้าง struct JobPosting สำหรับบันทึกลง DB
	job := models.JobPosting{
		ID:               uuid.NewString(), // สร้าง id ใหม่
		Title:            body.Title,
		Department:       body.Department,
		Location:         body.Location,
		ExperienceLevel:  body.ExperienceLevel,
		Description:      body.Description,
		Requirements:     body.Requirements,
		Responsibilities: body.Responsibilities,
		Status:           body.Status,
		PostedDate:       time.Now(),
		ClosingDate:      closing,
		CreatedBy:        uid.(string), // ใครสร้างงานนี้
		CreatedAt:        time.Now(),
	}

	if err := models.DB.Create(&job).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create job"}) // error ถ้าบันทึกไม่สำเร็จ
		return
	}
	c.JSON(http.StatusCreated, gin.H{"ok": true, "job": job}) // ส่ง job ที่สร้างกลับ
}

// ฟังก์ชันสำหรับแก้ไขงาน (PUT /api/jobs/:id)
// ต้องผ่าน middleware ตรวจสอบสิทธิ์ HR ก่อน
func UpdateJob(c *gin.Context) {
	id := c.Param("id") // รับ id จาก path
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing id"}) // error ถ้าไม่มี id
		return
	}
	var job models.JobPosting
	if err := models.DB.Where("id = ?", id).First(&job).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "job not found"}) // error ถ้าไม่พบงาน
		return
	}

	var body CreateJobBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"}) // error ถ้า body ไม่ถูกต้อง
		return
	}

	// อัปเดต field ที่มีข้อมูลใหม่
	if body.Title != "" {
		job.Title = body.Title
	}
	if body.Department != "" {
		job.Department = body.Department
	}
	if body.Location != "" {
		job.Location = body.Location
	}
	if body.ExperienceLevel != "" {
		job.ExperienceLevel = body.ExperienceLevel
	}
	if body.Description != "" {
		job.Description = body.Description
	}
	if body.Requirements != "" {
		job.Requirements = body.Requirements
	}
	if body.Responsibilities != "" {
		job.Responsibilities = body.Responsibilities
	}
	if body.Status != "" {
		job.Status = body.Status
	}
	if body.ClosingDate != "" {
		if t, err := time.Parse(time.RFC3339, body.ClosingDate); err == nil {
			job.ClosingDate = t
		}
	}
	job.UpdatedAt = time.Now() // อัปเดตเวลาล่าสุด

	if err := models.DB.Save(&job).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot update job"}) // error ถ้า save ไม่สำเร็จ
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true, "job": job}) // ส่ง job ที่อัปเดตกลับ
}

// ฟังก์ชันสำหรับลบงาน (DELETE /api/jobs/:id)
// ต้องผ่าน middleware ตรวจสอบสิทธิ์ HR ก่อน
func DeleteJob(c *gin.Context) {
	id := c.Param("id") // รับ id จาก path
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing id"}) // error ถ้าไม่มี id
		return
	}
	if err := models.DB.Where("id = ?", id).Delete(&models.JobPosting{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot delete job"}) // error ถ้าลบไม่สำเร็จ
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true}) // ส่ง ok กลับเมื่อสำเร็จ
}
