package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"aats-backend-clean/models"
)

// CreateJobBody - request body for creating/updating job
type CreateJobBody struct {
	Title            string `json:"title" binding:"required"`
	Department       string `json:"department"`
	Location         string `json:"location"`
	ExperienceLevel  string `json:"experience_level"`
	Description      string `json:"description"`
	Requirements     string `json:"requirements"`
	Responsibilities string `json:"responsibilities"`
	Status           string `json:"status"`       // active/closed/draft
	ClosingDate      string `json:"closing_date"` // optional ISO date
}

// GET /api/jobs
func ListJobs(c *gin.Context) {
	status := c.Query("status")
	var jobs []models.JobPosting
	q := models.DB.Order("posted_date desc")
	if status != "" {
		q = q.Where("status = ?", status)
	}
	if err := q.Find(&jobs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot fetch jobs"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true, "jobs": jobs})
}

// GET /api/jobs/:id
func GetJob(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing id"})
		return
	}
	var job models.JobPosting
	if err := models.DB.Where("id = ?", id).First(&job).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "job not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true, "job": job})
}

// POST /api/jobs  (Auth + HR)  -> Note: routes should apply middleware in main.go
func CreateJob(c *gin.Context) {
	var body CreateJobBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	uid, _ := c.Get("user_id")

	closing := time.Now().AddDate(0, 2, 0)
	if body.ClosingDate != "" {
		if t, err := time.Parse(time.RFC3339, body.ClosingDate); err == nil {
			closing = t
		}
	}

	job := models.JobPosting{
		ID:               uuid.NewString(),
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
		CreatedBy:        uid.(string),
		CreatedAt:        time.Now(),
	}

	if err := models.DB.Create(&job).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create job"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"ok": true, "job": job})
}

// PUT /api/jobs/:id (Auth + HR)
func UpdateJob(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing id"})
		return
	}
	var job models.JobPosting
	if err := models.DB.Where("id = ?", id).First(&job).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "job not found"})
		return
	}

	var body CreateJobBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}

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
	job.UpdatedAt = time.Now()

	if err := models.DB.Save(&job).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot update job"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true, "job": job})
}

// DELETE /api/jobs/:id (Auth + HR)
func DeleteJob(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing id"})
		return
	}
	if err := models.DB.Where("id = ?", id).Delete(&models.JobPosting{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot delete job"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
