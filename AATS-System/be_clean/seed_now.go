package main

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"os"
)

func post(path string) {
	url := "http://localhost:8080" + path
	resp, err := http.Post(url, "application/json", bytes.NewReader([]byte("{}")))
	if err != nil {
		fmt.Fprintf(os.Stderr, "POST %s error: %v\n", path, err)
		return
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	fmt.Printf("POST %s -> %d\n%s\n", path, resp.StatusCode, string(body))
}

func main() {
	fmt.Println("Seeding: /api/dev/seed")
	post("/api/dev/seed")
	fmt.Println("Seeding: /api/dev/seed_more?candidates=30&apps_per_candidate=2&seed=42")
	post("/api/dev/seed_more?candidates=30&apps_per_candidate=2&seed=42")
	fmt.Println("Seeding: /api/dev/seed_more_fill")
	post("/api/dev/seed_more_fill")
	fmt.Println("done")
}
