package handlers // แพ็กเกจ handlers สำหรับจัดการ API endpoint

import (
	"net/http"      // สำหรับ HTTP status และ response
	"os"            // สำหรับจัดการไฟล์และโฟลเดอร์
	"path/filepath" // สำหรับจัดการ path ของไฟล์
	"time"          // สำหรับจัดการวันที่

	"github.com/gin-gonic/gin" // Gin framework สำหรับสร้าง API
	"github.com/google/uuid"   // สำหรับสร้าง UUID
)

// ฟังก์ชันสำหรับอัปโหลดไฟล์ resume (POST /api/uploads/resume)
// รับไฟล์แบบ multipart/form-data โดยใช้ field name "file"
func UploadResume(c *gin.Context) {
	file, err := c.FormFile("file") // รับไฟล์จาก request
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"}) // error ถ้าไม่มีไฟล์
		return
	}

	// สร้างโฟลเดอร์ปลายทางสำหรับเก็บไฟล์ ถ้ายังไม่มี
	destDir := filepath.Join(".", "uploads", "resumes")
	if err := os.MkdirAll(destDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create upload dir"}) // error ถ้าสร้างโฟลเดอร์ไม่สำเร็จ
		return
	}

	// สร้างชื่อไฟล์ใหม่โดยใช้ UUID เพื่อป้องกันชื่อซ้ำ
	filename := uuid.NewString() + "_" + filepath.Base(file.Filename)
	fullpath := filepath.Join(destDir, filename)

	// บันทึกไฟล์ลงโฟลเดอร์ปลายทาง
	if err := c.SaveUploadedFile(file, fullpath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot save file"}) // error ถ้าบันทึกไฟล์ไม่สำเร็จ
		return
	}

	// สร้าง URL สำหรับเข้าถึงไฟล์ที่อัปโหลด
	publicURL := "/uploads/resumes/" + filename

	// ส่งข้อมูลไฟล์ที่อัปโหลดกลับ
	c.JSON(http.StatusCreated, gin.H{
		"ok":       true,
		"filename": filename,
		"url":      publicURL,
		"size":     file.Size,
		"uploaded": time.Now(),
	})
}
