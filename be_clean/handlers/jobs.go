package handlers

import (
    "net/http"

    "github.com/gin-gonic/gin"
    "aats-backend-clean/models"
    "aats-backend-clean/middleware"
    "aats-backend-clean/utils"
)

// GET /api/jobs?q=&location=&type=&page=1&pageSize=20
func ListJobs(c *gin.Context) {
    q := c.DefaultQuery("q", "")
    location := c.DefaultQuery("location", "")
    jtype := c.DefaultQuery("type", "")

    page, pageSize, offset := utils.ParsePagination(c, 1, 20, 100, "pageSize")

    var jobs []models.Job
    var total int64

    base := models.DB.Model(&models.Job{})
    if q != "" {
        like := "%" + q + "%"
        base = base.Where("title ILIKE ? OR description ILIKE ?", like, like)
    }
    if location != "" {
        base = base.Where("location = ?", location)
    }
    if jtype != "" {
        base = base.Where("type = ?", jtype)
    }

    if err := base.Count(&total).Error; err != nil {
        middleware.JSONErr(c, http.StatusInternalServerError, err.Error())
        return
    }

    if err := base.Order("created_at desc").Offset(offset).Limit(pageSize).Find(&jobs).Error; err != nil {
        middleware.JSONErr(c, http.StatusInternalServerError, err.Error())
        return
    }

    middleware.JSONOK(c, jobs, gin.H{"total": total, "page": page, "pageSize": pageSize})
}

// GET /api/jobs/:id
func GetJob(c *gin.Context) {
    id := c.Param("id")
    var j models.Job
    if err := models.DB.Where("id = ?", id).First(&j).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "job not found"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"data": j})
}
