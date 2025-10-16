package tests

import (
	"testing"
	"AATS-System/be_clean/handlers"
)

func TestHandlersExist(t *testing.T) {
	if handlers.ApplicationsHandler == nil || handlers.AuthHandler == nil {
		t.Error("Handlers should not be nil")
	}
}
