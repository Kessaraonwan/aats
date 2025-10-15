package models

import "time"

// ==== USER ====
type User struct {
	ID         string     `gorm:"primaryKey"`
	Email      string     `gorm:"uniqueIndex;not null"`
	Password   string     `gorm:"not null"`
	Role       string     `gorm:"not null"` // candidate | hr | hm
	Name       string
	Phone      string
	Department *string
	Position   *string
	CreatedAt  time.Time  `gorm:"autoCreateTime"`
	UpdatedAt  time.Time  `gorm:"autoUpdateTime"`
}

// ==== JOB_POSTING ====
type JobPosting struct {
	ID               string    `gorm:"primaryKey"`
	Title            string    `gorm:"not null"`
	Department       string
	Location         string
	ExperienceLevel  string
	Description      string
	Requirements     string    // JSON string (array)
	Responsibilities string    // JSON string (array)
	Status           string
	PostedDate       time.Time
	ClosingDate      time.Time
	CreatedBy        string    `gorm:"index"` // FK → User.ID (logical)
	CreatedAt        time.Time `gorm:"autoCreateTime"`
	UpdatedAt        time.Time `gorm:"autoUpdateTime"`
}

// ==== APPLICATION ====
type Application struct {
	ID            string    `gorm:"primaryKey"`
	JobID         string    `gorm:"index"`     // FK → JobPosting.ID (logical)
	ApplicantID   string    `gorm:"index"`     // FK → User.ID (logical)
	Resume        string
	CoverLetter   string
	Education     string    // JSON string (object)
	Experience    string    // JSON string (object)
	Skills        string    // JSON string (array)
	Status        string    // submitted|screening|interview|offer|rejected|hired
	SubmittedDate time.Time
	CreatedAt     time.Time `gorm:"autoCreateTime"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime"`
}

// ==== APPLICATION_TIMELINE ====
type ApplicationTimeline struct {
	ID            string    `gorm:"primaryKey"`
	ApplicationID string    `gorm:"index"` // FK → Application.ID (logical)
	Status        string
	Date          time.Time
	Description   string
	CreatedAt     time.Time `gorm:"autoCreateTime"`
}

// ==== EVALUATION (1:1 กับ Application) ====
type Evaluation struct {
	ID              string    `gorm:"primaryKey"`
	ApplicationID   string    `gorm:"uniqueIndex"` // enforce 1:1
	EvaluatorID     string
	EvaluatorName   string
	TechnicalSkills int
	Communication   int
	ProblemSolving  int
	CulturalFit     int
	OverallScore    float32
	Strengths       string
	Weaknesses      string
	Comments        string
	EvaluatedAt     time.Time `gorm:"autoCreateTime"`
}

// ==== NOTE ====
type Note struct {
	ID            string    `gorm:"primaryKey"`
	ApplicationID string    `gorm:"index"`
	Author        string
	CreatedBy     string // user id
	Content       string
	CreatedAt     time.Time `gorm:"autoCreateTime"`
}
