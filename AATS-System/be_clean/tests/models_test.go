package tests

import (
	"testing"
	"AATS-System/be_clean/models"
)

func TestDatabaseConnection(t *testing.T) {
	db, err := models.ConnectDatabase()
	if err != nil {
		t.Fatalf("failed to connect to database: %v", err)
	}
	db.Close()
}
