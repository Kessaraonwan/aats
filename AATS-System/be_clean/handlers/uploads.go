package handlers

import (
"net/http"
"os"
"path/filepath"
"time"

"github.com/gin-gonic/gin"
"github.com/google/uuid"
)

// POST /api/uploads/resume  (multipart/form-data field name "file")
func UploadResume(c *gin.Context) {
file, err := c.FormFile("file")
if err != nil {
c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
return
}

destDir := filepath.Join(".", "uploads", "resumes")
if err := os.MkdirAll(destDir, 0755); err != nil {
c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create upload dir"})
return
}

filename := uuid.NewString() + "_" + filepath.Base(file.Filename)
fullpath := filepath.Join(destDir, filename)

if err := c.SaveUploadedFile(file, fullpath); err != nil {
c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot save file"})
return
}

publicURL := "/uploads/resumes/" + filename

c.JSON(http.StatusCreated, gin.H{
"ok":       true,
"filename": filename,
"url":      publicURL,
"size":     file.Size,
"uploaded": time.Now(),
})
}
