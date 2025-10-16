package tests

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"AATS-System/be_clean/handlers"
)

func TestEvaluationHandler(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/evaluation", nil)
	w := httptest.NewRecorder()
	handlers.EvaluationHandler(w, req)
	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}
}
