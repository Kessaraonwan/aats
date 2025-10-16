package tests

import (
	"testing"
	"AATS-System/be_clean/utils"
)

func TestPaginate(t *testing.T) {
	items := []int{1, 2, 3, 4, 5}
	page, total := utils.Paginate(items, 1, 2)
	if total != 5 {
		t.Errorf("expected total 5, got %d", total)
	}
	if len(page) != 2 {
		t.Errorf("expected page size 2, got %d", len(page))
	}
}
