package models

import (
	"testing"
)

func TestUserCreation(t *testing.T) {
	user := User{
		Email:    "test@example.com",
		Password: "hashedpassword",
		Role:     "candidate",
		Name:     "Test User",
	}
	if user.Email == "" {
		t.Errorf("Email should not be empty")
	}
	if user.Role != "candidate" {
		t.Errorf("Role should be candidate")
	}
}
