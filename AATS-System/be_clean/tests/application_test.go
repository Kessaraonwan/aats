package models

import (
	"testing"
)

func TestApplicationStatus(t *testing.T) {
	app := Application{
		Status: "submitted",
	}
	if app.Status != "submitted" {
		t.Errorf("Status should be submitted")
	}
}
