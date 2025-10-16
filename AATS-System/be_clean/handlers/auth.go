package handlers // แพ็กเกจ handlers สำหรับจัดการ API endpoint

import (
	"net/http"      // สำหรับ HTTP status และ response
	"os"            // สำหรับอ่าน environment variable
	"time"          // สำหรับจัดการวันที่

	"github.com/gin-gonic/gin" // Gin framework สำหรับสร้าง API
	"github.com/golang-jwt/jwt/v5" // สำหรับสร้าง JWT token
	"github.com/google/uuid"   // สำหรับสร้าง UUID

	"aats-backend-clean/models" // import models สำหรับเชื่อมต่อ DB
	"aats-backend-clean/utils"  // import utils สำหรับ hash password ฯลฯ
)

// โครงสร้างข้อมูลสำหรับรับ request สมัครสมาชิก
type registerBody struct {
	Email    string `json:"email" binding:"required,email"`      // อีเมล
	Password string `json:"password" binding:"required,min=6"` // รหัสผ่าน
	Name     string `json:"name"`                               // ชื่อ
	Role     string `json:"role" binding:"required"`           // บทบาท (candidate|hr|hm)
}

// โครงสร้างข้อมูลสำหรับรับ request login
type loginBody struct {
	Email    string `json:"email" binding:"required,email"`      // อีเมล
	Password string `json:"password" binding:"required"`        // รหัสผ่าน
}

// ฟังก์ชันสำหรับสมัครสมาชิก (POST /api/auth/register)
func Register(c *gin.Context) {
	var body registerBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"}) // error ถ้า body ไม่ถูกต้อง
		return
	}

	// ตรวจสอบว่า email นี้มีอยู่แล้วหรือไม่
	var existing models.User
	if err := models.DB.Where("email = ?", body.Email).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "email already registered"}) // error ถ้า email ซ้ำ
		return
	}

	// hash password ก่อนบันทึก
	hash, err := utils.HashPassword(body.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "hash failed"}) // error ถ้า hash ไม่สำเร็จ
		return
	}

	// สร้าง user ใหม่
	user := models.User{
		ID:       uuid.NewString(), // สร้าง id ใหม่
		Email:    body.Email,
		Password: hash,
		Role:     body.Role,
		Name:     body.Name,
	}

	if err := models.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create user"}) // error ถ้าบันทึกไม่สำเร็จ
		return
	}

	// ส่งข้อมูล user กลับ
	c.JSON(http.StatusCreated, gin.H{
		"ok":   true,
		"user": gin.H{"id": user.ID, "email": user.Email, "role": user.Role, "name": user.Name},
	})
}

// ฟังก์ชันสำหรับ login (POST /api/auth/login)
func Login(c *gin.Context) {
	var body loginBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"}) // error ถ้า body ไม่ถูกต้อง
		return
	}

	// ค้นหาผู้ใช้จาก email
	var user models.User
	if err := models.DB.Where("email = ?", body.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"}) // error ถ้าไม่พบ email
		return
	}

	// ตรวจสอบรหัสผ่าน
	if !utils.CheckPasswordHash(user.Password, body.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"}) // error ถ้ารหัสผ่านผิด
		return
	}

	// อ่าน JWT_SECRET จาก env
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "JWT_SECRET not set"}) // error ถ้าไม่มี secret
		return
	}

	// สร้าง JWT token
	claims := jwt.MapClaims{
		"sub":  user.ID, // user id
		"role": user.Role, // บทบาท
		"exp":  time.Now().Add(24 * time.Hour).Unix(), // วันหมดอายุ
		"iat":  time.Now().Unix(), // เวลาสร้าง
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(secret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "token sign failed"}) // error ถ้า sign ไม่สำเร็จ
		return
	}

	// ส่ง token และข้อมูล user กลับ
	c.JSON(http.StatusOK, gin.H{
		"ok":    true,
		"token": signed,
		"user":  gin.H{"id": user.ID, "email": user.Email, "role": user.Role, "name": user.Name},
	})
}

// ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้ปัจจุบัน (GET /api/auth/me)
// ต้องมี AuthMiddleware เพื่อ set user_id ใน context
func Me(c *gin.Context) {
	uid, exists := c.Get("user_id") // ดึง user_id จาก context
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"}) // error ถ้าไม่ได้ login
		return
	}
	id, ok := uid.(string)
	if !ok || id == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid user id"}) // error ถ้า user_id ไม่ถูกต้อง
		return
	}

	// ค้นหาข้อมูลผู้ใช้จาก id
	var user models.User
	if err := models.DB.Where("id = ?", id).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"}) // error ถ้าไม่พบ user
		return
	}
	// ส่งข้อมูล user กลับ
	c.JSON(http.StatusOK, gin.H{
		"ok":   true,
		"user": gin.H{"id": user.ID, "email": user.Email, "role": user.Role, "name": user.Name, "phone": user.Phone},
	})
}
