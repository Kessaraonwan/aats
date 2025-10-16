package tests

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"AATS-System/be_clean/handlers"
)

func TestUploadsHandler(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/uploads", nil)
	w := httptest.NewRecorder()
	handlers.UploadsHandler(w, req)
	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}
}
