package middleware

import (
    "net/http"
    "os"

    "github.com/gin-gonic/gin"
    "github.com/golang-jwt/jwt/v5"
)

// AuthRequired is a Gin middleware that verifies a Bearer JWT and sets the email in context
func AuthRequired() gin.HandlerFunc {
    return func(c *gin.Context) {
        auth := c.GetHeader("Authorization")
        if auth == "" {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing authorization header"})
            return
        }

        // expected format: Bearer <token>
        var tokenString string
        if len(auth) > 7 && auth[:7] == "Bearer " {
            tokenString = auth[7:]
        } else {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization header"})
            return
        }

        secret := os.Getenv("JWT_SECRET")
        if secret == "" {
            secret = "dev-secret"
        }

        token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
            // only HMAC is used in this project
            if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
                return nil, jwt.ErrTokenUnverifiable
            }
            return []byte(secret), nil
        })
        if err != nil || !token.Valid {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
            return
        }

        if claims, ok := token.Claims.(jwt.MapClaims); ok {
            if email, ok := claims["email"].(string); ok {
                c.Set("email", email)
            }
            if role, ok := claims["role"].(string); ok {
                c.Set("role", role)
            }
        }

        c.Next()
    }
}

// RequireRole returns a middleware that requires the authenticated user to have one of the provided roles
func RequireRole(allowed ...string) gin.HandlerFunc {
    allowedSet := map[string]bool{}
    for _, r := range allowed {
        allowedSet[r] = true
    }
    return func(c *gin.Context) {
        roleI, ok := c.Get("role")
        if !ok {
            c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "forbidden: role not present"})
            return
        }
        role, _ := roleI.(string)
        if !allowedSet[role] {
            c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "forbidden: insufficient role"})
            return
        }
        c.Next()
    }
}
