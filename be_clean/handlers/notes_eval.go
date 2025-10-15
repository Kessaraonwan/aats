package handlers

import (
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/google/uuid"

    "aats-backend-clean/models"
    "gorm.io/gorm"
    "aats-backend-clean/middleware"
)

type noteReq struct {
    Body string `json:"body" binding:"required"`
}

type evalReq struct {
    Score    int    `json:"score" binding:"required,min=1,max=10"`
    Feedback string `json:"feedback"`
}

// POST /api/applications/:id/notes - add a note (HR/HM)
func AddNote(c *gin.Context) {
    id := c.Param("id")
    var req noteReq
    if err := c.ShouldBindJSON(&req); err != nil {
        middleware.JSONErr(c, http.StatusBadRequest, err.Error())
        return
    }
    actorI, _ := c.Get("email")
    actor, _ := actorI.(string)

    // ensure application exists
    var app models.Application
    if err := models.DB.Where("id = ?", id).First(&app).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            middleware.JSONErr(c, http.StatusNotFound, "application not found")
            return
        }
        middleware.JSONErr(c, http.StatusInternalServerError, err.Error())
        return
    }

    n := models.Note{ID: uuid.NewString(), ApplicationID: id, Actor: actor, Body: req.Body, CreatedAt: time.Now()}
    if err := models.DB.Create(&n).Error; err != nil {
        middleware.JSONErr(c, http.StatusInternalServerError, err.Error())
        return
    }
    middleware.JSONCreated(c, n)
}

// POST /api/applications/:id/evaluations - HM submits evaluation
func AddEvaluation(c *gin.Context) {
    id := c.Param("id")
    var req evalReq
    if err := c.ShouldBindJSON(&req); err != nil {
        middleware.JSONErr(c, http.StatusBadRequest, err.Error())
        return
    }
    actorI, _ := c.Get("email")
    actor, _ := actorI.(string)

    var app models.Application
    if err := models.DB.Where("id = ?", id).First(&app).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            middleware.JSONErr(c, http.StatusNotFound, "application not found")
            return
        }
        middleware.JSONErr(c, http.StatusInternalServerError, err.Error())
        return
    }

    ev := models.HMEvaluation{ID: uuid.NewString(), ApplicationID: id, Evaluator: actor, Score: req.Score, Feedback: req.Feedback, CreatedAt: time.Now()}
    if err := models.DB.Create(&ev).Error; err != nil {
        middleware.JSONErr(c, http.StatusInternalServerError, err.Error())
        return
    }
    middleware.JSONCreated(c, ev)
}
