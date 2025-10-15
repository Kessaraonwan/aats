package middleware

import (
    "net/http"
    "time"

    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"
    "log"
)

// AttachCommonMiddleware wires CORS, request logging, and recovery + error handling
func AttachCommonMiddleware(r *gin.Engine) {
    // CORS default
    r.Use(cors.Default())

    // Request logging
    r.Use(func(c *gin.Context) {
        start := time.Now()
        path := c.Request.URL.Path
        method := c.Request.Method
        c.Next()
        latency := time.Since(start)
        status := c.Writer.Status()
        log.Printf("%s %s %d %s", method, path, status, latency.String())
    })

    // Recovery with error handler
    r.Use(gin.CustomRecovery(func(c *gin.Context, recovered interface{}) {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
        c.Abort()
    }))
}

// JSON response wrapper helper
func JSONOK(c *gin.Context, data interface{}, meta interface{}) {
    c.JSON(http.StatusOK, gin.H{"data": data, "meta": meta})
}

func JSONCreated(c *gin.Context, data interface{}) {
    c.JSON(http.StatusCreated, gin.H{"data": data})
}

func JSONErr(c *gin.Context, code int, err string) {
    c.JSON(code, gin.H{"error": err})
}
