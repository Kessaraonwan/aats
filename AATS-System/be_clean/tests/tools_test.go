package tests

import (
	"testing"
	"AATS-System/be_clean/tools"
)

func TestToolsExist(t *testing.T) {
	if tools.SomeToolFunc == nil {
		t.Error("SomeToolFunc should not be nil")
	}
}
