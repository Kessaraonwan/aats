package models

import (
    "log"
    "os"
    "time"

    "github.com/google/uuid"
    "gorm.io/driver/postgres"
    "github.com/glebarez/sqlite"
    "gorm.io/gorm"
    gormlogger "gorm.io/gorm/logger"
)

var DB *gorm.DB

type User struct {
    ID        string    `gorm:"type:uuid;primaryKey" json:"id"`
    Email     string    `gorm:"unique;not null" json:"email"`
    Password  string    `gorm:"not null" json:"-"`
    Name      string    `json:"name"`
    Role      string    `gorm:"not null;default:candidate" json:"role"`
    CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
    UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

type Job struct {
    ID          string    `gorm:"type:uuid;primaryKey" json:"id"`
    Title       string    `json:"title"`
    Description string    `json:"description"`
    Location    string    `json:"location"`
    Type        string    `json:"type"`
    CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
    UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

// Application represents a candidate applying to a job
type Application struct {
    ID         string    `gorm:"type:uuid;primaryKey" json:"id"`
    UserID     string    `gorm:"type:uuid;not null;index" json:"user_id"`
    JobID      string    `gorm:"type:uuid;not null;index" json:"job_id"`
    ResumeURL  string    `json:"resume_url"`
    Status     string    `gorm:"not null;default:\"applied\"" json:"status"`
    CreatedAt  time.Time `gorm:"autoCreateTime" json:"created_at"`
    UpdatedAt  time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

// ApplicationTimeline stores append-only events for applications
type ApplicationTimeline struct {
    ID            string    `gorm:"type:uuid;primaryKey" json:"id"`
    ApplicationID string    `gorm:"type:uuid;not null;index" json:"application_id"`
    Actor         string    `json:"actor"` // could be user email or system
    Action        string    `json:"action"`
    Note          string    `json:"note"`
    CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`
}

// Note represents a simple append-only note on an application
type Note struct {
    ID            string    `gorm:"type:uuid;primaryKey" json:"id"`
    ApplicationID string    `gorm:"type:uuid;not null;index" json:"application_id"`
    Actor         string    `json:"actor"`
    Body          string    `json:"body"`
    CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`
}

// HMEvaluation stores a hiring manager's evaluation for an application
type HMEvaluation struct {
    ID            string    `gorm:"type:uuid;primaryKey" json:"id"`
    ApplicationID string    `gorm:"type:uuid;not null;index" json:"application_id"`
    Evaluator     string    `json:"evaluator"`
    Score         int       `json:"score"`
    Feedback      string    `json:"feedback"`
    CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`
}

// InitDB initializes the DB connection. If dsn is empty, it will read DATABASE_URL env var.
func InitDB(dsn string) error {
    if dsn == "" {
        dsn = os.Getenv("DATABASE_URL")
    }
    var db *gorm.DB
    var err error

    if dsn != "" {
        // Try Postgres with verbose logger for debugging
        db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
            Logger: gormlogger.Default.LogMode(gormlogger.Info),
        })
        if err == nil {
            DB = db
        }
    }

    if DB == nil {
        // Fallback to sqlite with verbose logger for debugging
        db, err = gorm.Open(sqlite.Open("be_clean.db"), &gorm.Config{
        Logger: gormlogger.Default.LogMode(gormlogger.Info),
    })
        if err != nil {
            return err
        }
        DB = db
    }

    // Log the dialector in use for debugging
    if DB != nil {
        if d := DB.Dialector; d != nil {
            log.Printf("DB dialector: %s", d.Name())
        }
    }

    // Use explicit migrator operations to avoid AutoMigrate introspection issues
    migrator := DB.Migrator()
    if ok := migrator.HasTable(&User{}); !ok {
        if err := migrator.CreateTable(&User{}); err != nil {
            log.Printf("create table users failed: %v", err)
        } else {
            log.Printf("created users table")
        }
    } else {
        // Add timestamp columns if missing
        if !migrator.HasColumn(&User{}, "CreatedAt") {
            if err := migrator.AddColumn(&User{}, "CreatedAt"); err != nil {
                log.Printf("add column CreatedAt failed: %v", err)
            } else {
                log.Printf("added column CreatedAt")
            }
        }
        if !migrator.HasColumn(&User{}, "UpdatedAt") {
            if err := migrator.AddColumn(&User{}, "UpdatedAt"); err != nil {
                log.Printf("add column UpdatedAt failed: %v", err)
            } else {
                log.Printf("added column UpdatedAt")
            }
        }
        if !migrator.HasColumn(&User{}, "Role") {
            if err := migrator.AddColumn(&User{}, "Role"); err != nil {
                log.Printf("add column Role failed: %v", err)
            } else {
                log.Printf("added column Role")
            }
        }
    }
    // ensure jobs table exists
    if ok := migrator.HasTable(&Job{}); !ok {
        if err := migrator.CreateTable(&Job{}); err != nil {
            log.Printf("create table jobs failed: %v", err)
        } else {
            log.Printf("created jobs table")
        }
    }
    // ensure applications table exists
    if ok := migrator.HasTable(&Application{}); !ok {
        if err := migrator.CreateTable(&Application{}); err != nil {
            log.Printf("create table applications failed: %v", err)
        } else {
            log.Printf("created applications table")
        }
    }
    // ensure unique index on user_id + job_id (try raw SQL which works on Postgres and SQLite)
    // use IF NOT EXISTS to be idempotent
    createIdxSQL := "CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_user_job ON applications(user_id, job_id);"
    if err := DB.Exec(createIdxSQL).Error; err != nil {
        log.Printf("create unique index idx_applications_user_job failed: %v", err)
    } else {
        log.Printf("ensured unique index idx_applications_user_job")
    }
    // ensure application_timelines table exists
    if ok := migrator.HasTable(&ApplicationTimeline{}); !ok {
        if err := migrator.CreateTable(&ApplicationTimeline{}); err != nil {
            log.Printf("create table application_timelines failed: %v", err)
        } else {
            log.Printf("created application_timelines table")
        }
    }
    // notes table
    if ok := migrator.HasTable(&Note{}); !ok {
        if err := migrator.CreateTable(&Note{}); err != nil {
            log.Printf("create table notes failed: %v", err)
        } else {
            log.Printf("created notes table")
        }
    }

    // HM evaluations table
    if ok := migrator.HasTable(&HMEvaluation{}); !ok {
        if err := migrator.CreateTable(&HMEvaluation{}); err != nil {
            log.Printf("create table hm_evaluations failed: %v", err)
        } else {
            log.Printf("created hm_evaluations table")
        }
    }
    return nil
}

// BeforeCreate hook to set UUID for primary key
func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
    if u.ID == "" {
        u.ID = uuid.NewString()
    }
    return nil
}
