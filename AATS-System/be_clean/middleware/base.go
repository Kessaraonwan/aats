package middleware

import (
	"time"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CORS() gin.HandlerFunc {
	cfg := cors.Config{
		// ระบุ origins ที่อนุญาตแบบชัดเจนสำหรับการพัฒนา
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
		// เพิ่มฟังก์ชันให้ยอมรับ localhost ในพอร์ตอื่นๆ ได้ด้วย (สะดวกตอนรัน dev server บนพอร์ตต่างกัน)
		AllowOriginFunc: func(origin string) bool {
			// ยอมรับถ้าเป็น localhost:<any-port>
			if origin == "" {
				return false
			}
			if strings.HasPrefix(origin, "http://localhost") || strings.HasPrefix(origin, "https://localhost") {
				return true
			}
			return false
		},
	}
	return cors.New(cfg)
}
func JSONErr(c *gin.Context, code int, msg string) {
	c.AbortWithStatusJSON(code, gin.H{"error": msg})
}
