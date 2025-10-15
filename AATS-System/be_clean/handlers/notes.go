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

// NoteBody request
type NoteBody struct {
Content string `json:"content" binding:"required"`
Author  string `json:"author"`
}

// POST /api/applications/:id/notes  (HR/HM)
func CreateNote(c *gin.Context) {
appID := c.Param("id")
var body NoteBody
if err := c.ShouldBindJSON(&body); err != nil {
c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
return
}
var app models.Application
if appID == "" {
	c.JSON(http.StatusBadRequest, gin.H{"error": "missing application id"})
	return
}
if err := models.DB.Where("id = ?", appID).First(&app).Error; err != nil {
	c.JSON(http.StatusNotFound, gin.H{"error": "application not found"})
	return
}
uid, _ := c.Get("user_id")
if uid == nil {
c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
return
}
author := body.Author
	var user models.User
	if uid != nil && uid.(string) != "" {
		dbSilent := models.DB.Session(&gorm.Session{Logger: glogger.Default.LogMode(glogger.Silent)})
		if err := dbSilent.Where("id = ?", uid.(string)).First(&user).Error; err == nil && author == "" {
			author = user.Name
		}
	}
note := models.Note{
ID:            uuid.NewString(),
ApplicationID: appID,
Author:        author,
CreatedBy:     uid.(string),
Content:       body.Content,
CreatedAt:     time.Now(),
}
if err := models.DB.Create(&note).Error; err != nil {
c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create note"})
return
}
c.JSON(http.StatusCreated, gin.H{"ok": true, "note": note})
}

// GET /api/applications/:id/notes
func ListNotes(c *gin.Context) {
appID := c.Param("id")
if appID == "" {
	c.JSON(http.StatusBadRequest, gin.H{"error": "missing application id"})
	return
}
var notes []models.Note
if err := models.DB.Where("application_id = ?", appID).Order("created_at desc").Find(&notes).Error; err != nil {
	c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot fetch notes"})
	return
}
c.JSON(http.StatusOK, gin.H{"ok": true, "notes": notes})
}
