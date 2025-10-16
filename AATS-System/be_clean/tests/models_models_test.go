package tests

import (
	"testing"
	"AATS-System/be_clean/models"
)

func TestUserModel(t *testing.T) {
	user := models.User{ID: 1, Name: "Test"}
	if user.Name != "Test" {
		t.Errorf("expected name Test, got %s", user.Name)
	}
}
