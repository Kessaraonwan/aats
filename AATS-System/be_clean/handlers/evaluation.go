package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"aats-backend-clean/models"
	"gorm.io/gorm"
	glogger "gorm.io/gorm/logger"
)

// EvaluationBody request
type EvaluationBody struct {
	TechnicalSkills int     `json:"technical_skills" binding:"required"`
	Communication   int     `json:"communication" binding:"required"`
	ProblemSolving  int     `json:"problem_solving" binding:"required"`
	CulturalFit     int     `json:"cultural_fit" binding:"required"`
	Strengths       string  `json:"strengths"`
	Weaknesses      string  `json:"weaknesses"`
	Comments        string  `json:"comments"`
	OverallScore    float32 `json:"overall_score"` // optional, can compute
}

// POST /api/applications/:id/evaluation  (HM/HR)
func CreateEvaluation(c *gin.Context) {
	appID := c.Param("id")
	var body EvaluationBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}

	// check app exists
	if appID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing application id"})
		return
	}
	var app models.Application
	if err := models.DB.Where("id = ?", appID).First(&app).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "application not found"})
		return
	}

	// Only allow HM evaluations when application has progressed to interview or later
	allowed := map[string]bool{"interview": true, "offer": true, "hired": true}
	if !allowed[app.Status] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่สามารถสร้างการประเมินได้: สถานะของผู้สมัครยังไม่ถึงขั้น 'interview'"})
		return
	}

	uid, _ := c.Get("user_id")
	if uid == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	// compute overall if not provided
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

// GET /api/applications/:id/evaluation
func GetEvaluation(c *gin.Context) {
	appID := c.Param("id")
if appID == "" {
	c.JSON(http.StatusBadRequest, gin.H{"error": "missing application id"})
	return
}
var eval models.Evaluation
dbSilent := models.DB.Session(&gorm.Session{Logger: glogger.Default.LogMode(glogger.Silent)})
if err := dbSilent.Where("application_id = ?", appID).First(&eval).Error; err != nil {
	c.JSON(http.StatusNotFound, gin.H{"error": "evaluation not found"})
	return
}
	c.JSON(http.StatusOK, gin.H{"ok": true, "evaluation": eval})
}
