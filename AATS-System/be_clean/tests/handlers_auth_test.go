package tests

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"AATS-System/be_clean/handlers"
)

func TestAuthHandler(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/auth/login", nil)
	w := httptest.NewRecorder()
	handlers.AuthHandler(w, req)
	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}
}
