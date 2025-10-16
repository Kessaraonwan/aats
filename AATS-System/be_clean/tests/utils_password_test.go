package tests

import (
	"testing"
	"AATS-System/be_clean/utils"
)

func TestHashPassword(t *testing.T) {
	password := "secret"
	hash, err := utils.HashPassword(password)
	if err != nil {
		t.Fatalf("failed to hash password: %v", err)
	}
	if !utils.CheckPasswordHash(password, hash) {
		t.Errorf("password hash does not match")
	}
}
