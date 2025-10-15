package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// RequireRoles returns a middleware that allows request only if user_role is one of allowed roles.
func RequireRoles(allowed ...string) gin.HandlerFunc {
	roleSet := map[string]bool{}
	for _, r := range allowed {
		roleSet[r] = true
	}
	return func(c *gin.Context) {
		rv, exists := c.Get("user_role")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
			return
		}
		role, ok := rv.(string)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid role"})
			return
		}
		if !roleSet[role] {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "forbidden"})
			return
		}
		c.Next()
	}
}
