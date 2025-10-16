package tests

import (
	"testing"
	"AATS-System/be_clean/models"
)

func TestDatabaseInit(t *testing.T) {
	db, err := models.InitDatabase()
	if err != nil {
		t.Fatalf("failed to initialize database: %v", err)
	}
	db.Close()
}
