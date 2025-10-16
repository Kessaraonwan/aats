package main

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestJobsEndpoint(t *testing.T) {
	req := httptest.NewRequest("GET", "/api/jobs", nil)
	w := httptest.NewRecorder()

	JobsHandler(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}
}
