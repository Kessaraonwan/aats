package tests

import (
	"testing"
	"AATS-System/be_clean/config"
)

func TestLoadConfig(t *testing.T) {
	cfg, err := config.LoadConfig()
	if err != nil {
		t.Fatalf("failed to load config: %v", err)
	}
	if cfg.DatabaseURL == "" {
		t.Errorf("DatabaseURL should not be empty")
	}
}
