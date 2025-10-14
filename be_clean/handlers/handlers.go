package handlers

import (
    "net/http"
    "os"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/golang-jwt/jwt/v5"
    "github.com/google/uuid"
    "golang.org/x/crypto/bcrypt"

    "aats-backend-clean/models"
    "gorm.io/gorm"
    "aats-backend-clean/middleware"
    "aats-backend-clean/utils"
)

type registerReq struct {
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required,min=6"`
    Name     string `json:"name" binding:"required"`
}

func Health(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func Register(c *gin.Context) {
    var req registerReq
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Check existing
    var ex models.User
    if err := models.DB.Where("email = ?", req.Email).First(&ex).Error; err == nil {
        c.JSON(http.StatusConflict, gin.H{"error": "user exists"})
        return
    } else if err != gorm.ErrRecordNotFound {
        // continue on not found only
    }

    pw, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
    u := models.User{Email: req.Email, Password: string(pw), Name: req.Name}

    // remove any bad residue rows with empty id
    models.DB.Where("id = ?", "").Delete(&models.User{})

    // ensure a UUID is set before creating (avoids empty primary key insertion)
    if u.ID == "" {
        u.ID = uuid.NewString()
    }

    if err := models.DB.Create(&u).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    token, err := generateTokenWithRole(u.Email, u.Role)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, gin.H{"token": token, "user": gin.H{"email": u.Email, "name": u.Name}})
}

func Login(c *gin.Context) {
    var req struct {
        Email    string `json:"email" binding:"required,email"`
        Password string `json:"password" binding:"required"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    var u models.User
    if err := models.DB.Where("email = ?", req.Email).First(&u).Error; err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
        return
    }

    if err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(req.Password)); err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
        return
    }

    token, err := generateTokenWithRole(u.Email, u.Role)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"token": token, "user": gin.H{"email": u.Email, "name": u.Name}})
}

// Me returns the authenticated user's basic info
func Me(c *gin.Context) {
    emailI, ok := c.Get("email")
    if !ok {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
        return
    }
    email := emailI.(string)
    var u models.User
    if err := models.DB.Where("email = ?", email).First(&u).Error; err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"data": gin.H{"email": u.Email, "name": u.Name, "role": u.Role}})
}

// ListUsers returns a paginated list of users (password field omitted via json tags)
func ListUsers(c *gin.Context) {
    q := c.DefaultQuery("q", "")
    page, limit, offset := utils.ParsePagination(c, 1, 20, 100, "limit")

    var users []models.User
    var total int64

    // Build base query for count and fetch; apply optional search filter `q`
    baseQuery := models.DB.Model(&models.User{})
    // decide which LIKE operator to use depending on dialect
    likeOp := "LIKE"
    if models.DB != nil && models.DB.Dialector != nil {
        if models.DB.Dialector.Name() == "postgres" {
            likeOp = "ILIKE"
        }
    }
    if q != "" {
        like := "%" + q + "%"
        baseQuery = baseQuery.Where("email " + likeOp + " ? OR name " + likeOp + " ?", like, like)
    }

    if err := baseQuery.Count(&total).Error; err != nil {
        // If count fails, still attempt to fetch results but return error
        middleware.JSONErr(c, http.StatusInternalServerError, err.Error())
        return
    }

    fetchQuery := models.DB.Order("created_at desc").Offset(offset).Limit(limit)
    if q != "" {
        like := "%" + q + "%"
        fetchQuery = fetchQuery.Where("email " + likeOp + " ? OR name " + likeOp + " ?", like, like)
    }
    if err := fetchQuery.Find(&users).Error; err != nil {
        middleware.JSONErr(c, http.StatusInternalServerError, err.Error())
        return
    }

    middleware.JSONOK(c, users, gin.H{"total": total, "page": page, "limit": limit})
}

func generateToken(email string) (string, error) {
    return generateTokenWithRole(email, "candidate")
}

// generateTokenWithRole issues a JWT including role claim
func generateTokenWithRole(email, role string) (string, error) {
    secret := os.Getenv("JWT_SECRET")
    if secret == "" {
        secret = "dev-secret"
    }
    claims := jwt.MapClaims{}
    claims["email"] = email
    claims["role"] = role
    claims["exp"] = time.Now().Add(time.Hour * 24).Unix()
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(secret))
}
