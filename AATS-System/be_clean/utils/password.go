package utils

import "golang.org/x/crypto/bcrypt"

// HashPassword สร้าง bcrypt hash จากรหัสผ่าน
func HashPassword(pw string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
	return string(b), err
}

// CheckPasswordHash ตรวจสอบรหัสผ่านกับ hash
func CheckPasswordHash(hash, pw string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(pw))
	return err == nil
}
