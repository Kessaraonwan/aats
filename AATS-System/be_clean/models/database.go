package models

import (
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal(" DATABASE_URL not found. โปรดตั้งค่าในไฟล์ .env หรือ Environment Variable")
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal(" ไม่สามารถเชื่อมต่อฐานข้อมูลได้:", err)
	}

	if err := db.AutoMigrate(
		&User{},
		&JobPosting{},
		&Application{},
		&ApplicationTimeline{},
		&Evaluation{},
		&Note{},
	); err != nil {
		log.Fatal(" AutoMigrate ล้มเหลว:", err)
	}

	DB = db
	log.Println(" PostgreSQL connected & migrated successfully")
}

func GetDB() *gorm.DB {
	return DB
}
