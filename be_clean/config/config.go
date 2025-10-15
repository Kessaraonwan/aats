package config

import (
    "os"
)

// Config holds basic runtime configuration
type Config struct {
    Port        string
    DatabaseURL string
    JWTSecret   string
}

// Load reads from environment variables and returns a Config
func Load() Config {
    c := Config{}
    c.Port = os.Getenv("PORT")
    if c.Port == "" {
        c.Port = "8081"
    }
    c.DatabaseURL = os.Getenv("DATABASE_URL")
    c.JWTSecret = os.Getenv("JWT_SECRET")
    return c
}
