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

// โครงสร้างข้อมูลสำหรับรับ request ประเมินผู้สมัคร
type EvaluationBody struct {
	TechnicalSkills int     `json:"technical_skills" binding:"required"` // คะแนนทักษะเทคนิค
	Communication   int     `json:"communication" binding:"required"`    // คะแนนการสื่อสาร
	ProblemSolving  int     `json:"problem_solving" binding:"required"` // คะแนนการแก้ปัญหา
	CulturalFit     int     `json:"cultural_fit" binding:"required"`    // คะแนนความเข้ากันกับวัฒนธรรมองค์กร
	Strengths       string  `json:"strengths"`                           // จุดแข็ง
	Weaknesses      string  `json:"weaknesses"`                          // จุดอ่อน
	Comments        string  `json:"comments"`                            // ความเห็นเพิ่มเติม
	OverallScore    float32 `json:"overall_score"`                       // คะแนนรวม (ถ้าไม่ใส่จะคำนวณให้)
}

// ฟังก์ชันสำหรับสร้าง/อัปเดตการประเมินผู้สมัคร (POST /api/applications/:id/evaluation)
// ใช้โดย HM/HR
func CreateEvaluation(c *gin.Context) {
	appID := c.Param("id") // รับ id ของใบสมัครจาก path
	var body EvaluationBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"}) // error ถ้า body ไม่ถูกต้อง
		return
	}

	// ตรวจสอบว่า application มีอยู่จริงหรือไม่
	if appID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing application id"}) // error ถ้าไม่มี id
		return
	}
	var app models.Application
	if err := models.DB.Where("id = ?", appID).First(&app).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "application not found"}) // error ถ้าไม่พบ application
		return
	}

	// อนุญาตให้ประเมินเฉพาะใบสมัครที่สถานะ interview ขึ้นไป
	allowed := map[string]bool{"interview": true, "offer": true, "hired": true}
	if !allowed[app.Status] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่สามารถสร้างการประเมินได้: สถานะของผู้สมัครยังไม่ถึงขั้น 'interview'"})
		return
	}

	uid, _ := c.Get("user_id") // ดึง user_id จาก context
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"}) // error ถ้าไม่ได้ login
		return
	}

	// คำนวณคะแนนรวมถ้าไม่ได้ส่งมา
	overall := body.OverallScore
	if overall == 0 {
		sum := body.TechnicalSkills + body.Communication + body.ProblemSolving + body.CulturalFit
		overall = float32(sum) / 4.0
	}

	// upsert (สร้างหรืออัปเดต) การประเมิน (1:1 ต่อ application)
	eval := models.Evaluation{
		ID:              uuid.NewString(),
		ApplicationID:   appID,
		EvaluatorID:     uid.(string),
		EvaluatorName:   "", // สามารถเติมชื่อผู้ประเมินได้
		TechnicalSkills: body.TechnicalSkills,
		Communication:   body.Communication,
		ProblemSolving:  body.ProblemSolving,
		CulturalFit:     body.CulturalFit,
		OverallScore:    overall,
		Strengths:       body.Strengths,
		Weaknesses:      body.Weaknesses,
		Comments:        body.Comments,
		EvaluatedAt:     time.Now(),
	}

	// ถ้ามีการประเมินอยู่แล้ว ให้ update
	var existing models.Evaluation
	if appID != "" {
		dbSilent := models.DB.Session(&gorm.Session{Logger: glogger.Default.LogMode(glogger.Silent)})
		if err := dbSilent.Where("application_id = ?", appID).First(&existing).Error; err == nil {
			// อัปเดต field
			existing.TechnicalSkills = eval.TechnicalSkills
			existing.Communication = eval.Communication
			existing.ProblemSolving = eval.ProblemSolving
			existing.CulturalFit = eval.CulturalFit
			existing.OverallScore = eval.OverallScore
			existing.Strengths = eval.Strengths
			existing.Weaknesses = eval.Weaknesses
			existing.Comments = eval.Comments
			existing.EvaluatorID = eval.EvaluatorID
			existing.EvaluatedAt = time.Now()

			if err := models.DB.Save(&existing).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot update evaluation"}) // error ถ้า save ไม่สำเร็จ
				return
			}
			c.JSON(http.StatusOK, gin.H{"ok": true, "evaluation": existing}) // ส่งข้อมูลที่อัปเดตกลับ
			return
		}
	}

	// ถ้ายังไม่มี ให้สร้างใหม่
	if err := models.DB.Create(&eval).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create evaluation"}) // error ถ้าบันทึกไม่สำเร็จ
		return
	}
	c.JSON(http.StatusCreated, gin.H{"ok": true, "evaluation": eval}) // ส่งข้อมูลที่สร้างกลับ
}
	overall := body.OverallScore
	if overall == 0 {
		sum := body.TechnicalSkills + body.Communication + body.ProblemSolving + body.CulturalFit
		overall = float32(sum) / 4.0
	}

	// upsert evaluation (1:1 enforced by unique index on application_id)
	eval := models.Evaluation{
		ID:              uuid.NewString(),
		ApplicationID:   appID,
		EvaluatorID:     uid.(string),
		EvaluatorName:   "", // fill if wanted
		TechnicalSkills: body.TechnicalSkills,
		Communication:   body.Communication,
		ProblemSolving:  body.ProblemSolving,
		CulturalFit:     body.CulturalFit,
		OverallScore:    overall,
		Strengths:       body.Strengths,
		Weaknesses:      body.Weaknesses,
		Comments:        body.Comments,
		EvaluatedAt:     time.Now(),
	}

	// try update existing by application_id
	var existing models.Evaluation
	if appID != "" {
		dbSilent := models.DB.Session(&gorm.Session{Logger: glogger.Default.LogMode(glogger.Silent)})
		if err := dbSilent.Where("application_id = ?", appID).First(&existing).Error; err == nil {
		// update fields
		existing.TechnicalSkills = eval.TechnicalSkills
		existing.Communication = eval.Communication
		existing.ProblemSolving = eval.ProblemSolving
		existing.CulturalFit = eval.CulturalFit
		existing.OverallScore = eval.OverallScore
		existing.Strengths = eval.Strengths
		existing.Weaknesses = eval.Weaknesses
		existing.Comments = eval.Comments
		existing.EvaluatorID = eval.EvaluatorID
		existing.EvaluatedAt = time.Now()

		if err := models.DB.Save(&existing).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot update evaluation"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"ok": true, "evaluation": existing})
		return
	}
	}

	// create new
	if err := models.DB.Create(&eval).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create evaluation"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"ok": true, "evaluation": eval})
}

// ฟังก์ชันสำหรับดึงข้อมูลการประเมินของใบสมัคร (GET /api/applications/:id/evaluation)
func GetEvaluation(c *gin.Context) {
	appID := c.Param("id") // รับ id ของใบสมัครจาก path
	if appID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing application id"}) // error ถ้าไม่มี id
		return
	}
	var eval models.Evaluation
	dbSilent := models.DB.Session(&gorm.Session{Logger: glogger.Default.LogMode(glogger.Silent)})
	if err := dbSilent.Where("application_id = ?", appID).First(&eval).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "evaluation not found"}) // error ถ้าไม่พบการประเมิน
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true, "evaluation": eval}) // ส่งข้อมูลการประเมินกลับ
}
