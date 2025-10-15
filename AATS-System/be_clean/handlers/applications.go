package handlers

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
	glogger "gorm.io/gorm/logger"

	"aats-backend-clean/models"
)

// CreateApplicationBody request body
type CreateApplicationBody struct {
JobID       string `json:"job_id" binding:"required"`
ApplicantID string `json:"applicant_id"`
ResumeURL   string `json:"resume"`
CoverLetter string `json:"cover_letter"`
Education   string `json:"education"`
Experience  string `json:"experience"`
Skills      string `json:"skills"`
}

// POST /api/applications
func CreateApplication(c *gin.Context) {
var body CreateApplicationBody
if err := c.ShouldBindJSON(&body); err != nil {
c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
return
}

var job models.JobPosting
if err := models.DB.Where("id = ?", body.JobID).First(&job).Error; err != nil {
c.JSON(http.StatusNotFound, gin.H{"error": "job not found"})
return
}

uidv, _ := c.Get("user_id")
applicantID := body.ApplicantID
if applicantID == "" {
if uidv == nil {
c.JSON(http.StatusUnauthorized, gin.H{"error": "missing applicant_id and not authenticated"})
return
}
applicantID = uidv.(string)
} else {
if uidv != nil {
urv, _ := c.Get("user_role")
if urv != "hr" && applicantID != uidv.(string) {
c.JSON(http.StatusForbidden, gin.H{"error": "cannot create application for other users"})
return
}
}
}

app := models.Application{
ID:            uuid.NewString(),
JobID:         body.JobID,
ApplicantID:   applicantID,
Resume:        body.ResumeURL,
CoverLetter:   body.CoverLetter,
Education:     body.Education,
Experience:    body.Experience,
Skills:        body.Skills,
Status:        "submitted",
SubmittedDate: time.Now(),
CreatedAt:     time.Now(),
}

// --- Enforce application policy ---
// 1) Max 5 concurrent applications (exclude 'rejected' and 'hired')
var activeCount int64
if err := models.DB.Model(&models.Application{}).
	Where("applicant_id = ? AND status NOT IN (?)", applicantID, []string{"rejected", "hired"}).
	Count(&activeCount).Error; err == nil {
	if activeCount >= 5 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "คุณมีใบสมัครคงค้างมากกว่า/เท่ากับ 5 ตำแหน่ง โปรดยกเลิกหรือรอผลก่อนสมัครใหม่"})
		return
	}
}

// 2) Prevent duplicate active application for same job and enforce re-apply waiting period
var existing models.Application
if err := models.DB.Where("applicant_id = ? AND job_id = ?", applicantID, body.JobID).Order("submitted_date desc").First(&existing).Error; err == nil {
	// If existing application is active (not rejected/withdrawn/hired), reject
	if existing.Status != "rejected" && existing.Status != "withdrawn" && existing.Status != "hired" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "คุณได้สมัครตำแหน่งนี้ไว้แล้ว (สถานะ: " + existing.Status + ")"})
		return
	}

	// If previously rejected, determine when rejection happened and whether it was after interview or during screening
	if existing.Status == "rejected" {
		// Find the most recent rejected timeline entry
		var rejTimeline models.ApplicationTimeline
		rejErr := models.DB.Where("application_id = ? AND status = ?", existing.ID, "rejected").Order("date desc").First(&rejTimeline).Error
		var rejectedAt time.Time
		if rejErr == nil {
			rejectedAt = rejTimeline.Date
		} else {
			// fallback to UpdatedAt on application
			rejectedAt = existing.UpdatedAt
		}

		// Check if there was an interview before rejection
		var interviewCount int64
		models.DB.Model(&models.ApplicationTimeline{}).
			Where("application_id = ? AND status = ? AND date < ?", existing.ID, "interview", rejectedAt).
			Count(&interviewCount)

		// Determine waiting period
		waitMonths := 3
		reason := "การคัดกรอง"
		if interviewCount > 0 {
			waitMonths = 6
			reason = "หลังสัมภาษณ์"
		}

		allowedAt := rejectedAt.AddDate(0, waitMonths, 0)
		if time.Now().Before(allowedAt) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่สามารถสมัครซ้ำได้ทันที - ถูกปฏิเสธ (" + reason + ") ต้องรอ " + strconv.Itoa(waitMonths) + " เดือน หลังจากวันที่ " + rejectedAt.Format("2006-01-02")})
			return
		}
	}

	// If previously withdrawn, allow immediate re-apply; otherwise continue
}

// --- New policy: prevent cross-job re-apply for a short period after being hired ---
// If the applicant was hired for any job recently, block applying to other jobs for 3 months
{
	var lastHired models.Application
	if err := models.DB.Where("applicant_id = ? AND status = ?", applicantID, "hired").Order("updated_at desc").First(&lastHired).Error; err == nil {
		// If the last hired record is for a different job, enforce a 3-month cooldown
		if lastHired.JobID != "" && lastHired.JobID != body.JobID {
			hiredAt := lastHired.UpdatedAt
			waitMonths := 3
			allowedAt := hiredAt.AddDate(0, waitMonths, 0)
			if time.Now().Before(allowedAt) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่สามารถสมัครตำแหน่งอื่นได้ทันที - คุณได้รับการจ้างงานเมื่อ " + hiredAt.Format("2006-01-02") + ", กรุณารอ " + strconv.Itoa(waitMonths) + " เดือน ก่อนสมัครตำแหน่งอื่น หรือติดต่อ HR หากสถานะการจ้างงานเปลี่ยนแปลง"})
				return
			}
		}
	}
}

if err := models.DB.Create(&app).Error; err != nil {
c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create application"})
return
}

tl := models.ApplicationTimeline{
ID:            uuid.NewString(),
ApplicationID: app.ID,
Status:        "submitted",
Date:          app.SubmittedDate,
Description:   "Application submitted",
}
models.DB.Create(&tl)

c.JSON(http.StatusCreated, gin.H{"ok": true, "application": app})
}

// GET /api/applications
func ListApplications(c *gin.Context) {
pageQ := c.DefaultQuery("page", "1")
limitQ := c.DefaultQuery("limit", "20")
page, _ := strconv.Atoi(pageQ)
limit, _ := strconv.Atoi(limitQ)
if page < 1 {
page = 1
}
if limit < 1 || limit > 200 {
limit = 20
}

// compute offset for OFFSET pagination
offset := (page - 1) * limit

// Optional keyset pagination using a cursor (RFC3339 timestamp) to avoid OFFSET
// on very large tables. If `cursor` is provided, we return applications with
// submitted_date < cursor ordered desc and include `next_cursor` in response.
cursorQ := c.Query("cursor")
var cursorTime time.Time
useKeyset := false
if cursorQ != "" {
	if t, err := time.Parse(time.RFC3339, cursorQ); err == nil {
		cursorTime = t
		useKeyset = true
	}
}

jobID := c.Query("job_id")
applicantID := c.Query("applicant_id")
status := c.Query("status")
q := c.Query("q")

role := ""
if rv, ok := c.Get("user_role"); ok {
role = rv.(string)
}
uid := ""
if uv, ok := c.Get("user_id"); ok {
uid = uv.(string)
}

includeDetailsQ := c.DefaultQuery("include_details", c.Query("includeDetails"))
includeDetails := includeDetailsQ == "1" || includeDetailsQ == "true" || includeDetailsQ == "yes"

	// Select only essential columns for listing to reduce I/O when details are
	// not requested. When include_details is true we keep the full model so the
	// frontend receives complete application payloads (resume, education, etc.).
	tx := models.DB.Model(&models.Application{})
	if !includeDetails {
		tx = tx.Select("id, job_id, applicant_id, status, submitted_date, updated_at")
	}

	// If authenticated candidate, restrict to their own applications
	if role == "candidate" && uid != "" {
		tx = tx.Where("applicant_id = ?", uid)
	} else {
		// Otherwise, allow using applicant_id query param (useful for dev/admin or unauthenticated testing)
		if applicantID != "" {
			tx = tx.Where("applicant_id = ?", applicantID)
		}
	}

if jobID != "" {
	tx = tx.Where("job_id = ?", jobID)
}
if status != "" {
tx = tx.Where("status = ?", status)
}
if q != "" {
tx = tx.Where("(cover_letter ILIKE ? OR education ILIKE ? OR experience ILIKE ? OR skills ILIKE ?)", "%"+q+"%", "%"+q+"%", "%"+q+"%", "%"+q+"%")
}

// Optionally skip the COUNT(*) if caller provides skip_count=true. Counting
// large tables can be expensive; callers that page through results can request
// skip_count to avoid the extra query.
skipCountQ := c.DefaultQuery("skip_count", c.Query("skipCount"))
skipCount := skipCountQ == "1" || skipCountQ == "true" || skipCountQ == "yes"

var total int64 = -1
if !skipCount {
	tx.Count(&total)
}

var apps []models.Application
if useKeyset {
	// keyset: fetch rows with submitted_date < cursorTime
	if err := tx.Where("submitted_date < ?", cursorTime).Order("submitted_date desc").Limit(limit).Find(&apps).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot fetch applications"})
		return
	}
} else {
	if err := tx.Order("submitted_date desc").Offset(offset).Limit(limit).Find(&apps).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot fetch applications"})
		return
	}
}

// Enrich each application with can_reapply metadata
type AppWithMeta struct {
	models.Application
	CanReapply     bool       `json:"can_reapply"`
	CanReapplyDate *time.Time `json:"can_reapply_date,omitempty"`
	WaitingMonths  int        `json:"waiting_months,omitempty"`
	RejectionStage string     `json:"rejection_stage,omitempty"`
	JobTitle       string     `json:"job_title,omitempty"`
	JobDepartment  string     `json:"job_department,omitempty"`
	JobLocation    string     `json:"job_location,omitempty"`
}

// Check if caller asked for details to be included in the list response. This
// allows the frontend to fetch one enriched list instead of doing N+1 GETs for
// each application.
// response items (shared between includeDetails and fallback)
type AppListItem struct {
	Application models.Application `json:"application"`
	AppMeta     AppWithMeta       `json:"meta"`
	Raw         interface{}       `json:"raw,omitempty"`
}

var items []AppListItem

if includeDetails && len(apps) > 0 {
	// Batch fetch jobs and timelines for the returned applications to avoid per-app queries.
	jobIDsSet := map[string]struct{}{}
	appIDs := make([]string, 0, len(apps))
	for _, a := range apps {
		if a.JobID != "" {
			jobIDsSet[a.JobID] = struct{}{}
		}
		appIDs = append(appIDs, a.ID)
	}

	// jobs
	jobIDs := make([]string, 0, len(jobIDsSet))
	for k := range jobIDsSet {
		jobIDs = append(jobIDs, k)
	}
	jobMap := map[string]models.JobPosting{}
	if len(jobIDs) > 0 {
		var jobs []models.JobPosting
		models.DB.Where("id IN ?", jobIDs).Find(&jobs)
		for _, j := range jobs {
			jobMap[j.ID] = j
		}
	}

	// latest rejected timeline per application (if any)
	type rejRec struct {
		ApplicationID string    `gorm:"column:application_id" json:"application_id"`
		Date          time.Time `gorm:"column:date" json:"date"`
	}
	rejMap := map[string]time.Time{}
	if len(appIDs) > 0 {
		var rejRows []rejRec
		models.DB.Model(&models.ApplicationTimeline{}).
			Select("application_id, max(date) as date").
			Where("application_id IN ? AND status = ?", appIDs, "rejected").
			Group("application_id").
			Find(&rejRows)
		for _, r := range rejRows {
			rejMap[r.ApplicationID] = r.Date
		}
	}

	// interview existence per application (has there ever been an interview?)
	type intRec struct {
		ApplicationID string `gorm:"column:application_id"`
		Cnt           int64  `gorm:"column:cnt"`
	}
	interviewMap := map[string]bool{}
	if len(appIDs) > 0 {
		var intRows []intRec
		models.DB.Model(&models.ApplicationTimeline{}).
			Select("application_id, count(*) as cnt").
			Where("application_id IN ? AND status = ?", appIDs, "interview").
			Group("application_id").
			Find(&intRows)
		for _, r := range intRows {
			interviewMap[r.ApplicationID] = r.Cnt > 0
		}
	}

	// Build metadata using maps
	// Build response items. If includeDetails is requested, each item will
	// be an object { application: <Application>, meta: <AppWithMeta fields>, raw: { timeline, notes, evaluation, job, applicant } }
	// use the outer AppListItem and items variable declared above

	for _, a := range apps {
		meta := AppWithMeta{Application: a}
		meta.CanReapply = false
		meta.CanReapplyDate = nil
		meta.WaitingMonths = 0
		meta.RejectionStage = ""

		if a.Status == "withdrawn" {
			t := a.UpdatedAt
			meta.CanReapply = true
			meta.CanReapplyDate = &t
			meta.WaitingMonths = 0
		}

		if a.JobID != "" {
			if j, ok := jobMap[a.JobID]; ok {
				meta.JobTitle = j.Title
				meta.JobDepartment = j.Department
				meta.JobLocation = j.Location
			}
		}

		if a.Status == "rejected" {
			var rejectedAt time.Time
			if d, ok := rejMap[a.ID]; ok {
				rejectedAt = d
			} else {
				rejectedAt = a.UpdatedAt
			}

			waitMonths := 3
			reason := "screening"
			if interviewMap[a.ID] {
				waitMonths = 6
				reason = "interview"
			}
			allowedAt := rejectedAt.AddDate(0, waitMonths, 0)
			meta.WaitingMonths = waitMonths
			meta.RejectionStage = reason
			meta.CanReapplyDate = &allowedAt
			if time.Now().After(allowedAt) {
				meta.CanReapply = true
			}
		}

		var raw interface{} = nil
		if includeDetails {
			// timeline
			var timelines []models.ApplicationTimeline
			models.DB.Where("application_id = ?", a.ID).Order("date desc").Find(&timelines)

			// notes
			var notes []models.Note
			models.DB.Where("application_id = ?", a.ID).Order("created_at desc").Find(&notes)

			// evaluation (best-effort, use silent logger)
			var ev *models.Evaluation = nil
			{
				var e models.Evaluation
				dbSilent := models.DB.Session(&gorm.Session{Logger: glogger.Default.LogMode(glogger.Silent)})
				if err := dbSilent.Where("application_id = ?", a.ID).First(&e).Error; err == nil {
					// only expose evaluation when application status indicates interview or later
					if a.Status == "interview" || a.Status == "offer" || a.Status == "hired" {
						ev = &e
					}
				}
			}

			// job
			var job *models.JobPosting = nil
			if a.JobID != "" {
				var j models.JobPosting
				dbSilent := models.DB.Session(&gorm.Session{Logger: glogger.Default.LogMode(glogger.Silent)})
				if err := dbSilent.Where("id = ?", a.JobID).First(&j).Error; err == nil {
					job = &j
				}
			}

			// applicant
			var applicant *models.User = nil
			if a.ApplicantID != "" {
				var u models.User
				dbSilent := models.DB.Session(&gorm.Session{Logger: glogger.Default.LogMode(glogger.Silent)})
				if err := dbSilent.Where("id = ?", a.ApplicantID).First(&u).Error; err == nil {
					applicant = &u
				}
			}

			raw = map[string]interface{}{
				"application": a,
				"timeline":    timelines,
				"notes":       notes,
				"evaluation":  ev,
				"job":         job,
				"applicant":   applicant,
			}
		}

		items = append(items, AppListItem{Application: a, AppMeta: meta, Raw: raw})
	}
} else {
	// fallback: existing per-app best-effort lookups (unchanged)
	for _, a := range apps {
		meta := AppWithMeta{Application: a}

		// default: cannot reapply
		meta.CanReapply = false
		meta.CanReapplyDate = nil
		meta.WaitingMonths = 0
		meta.RejectionStage = ""

		// If withdrawn -> can reapply immediately
		if a.Status == "withdrawn" {
			t := a.UpdatedAt
			meta.CanReapply = true
			meta.CanReapplyDate = &t
			meta.WaitingMonths = 0
		}

		// attach job title/department/location if available (for all statuses)
		var job models.JobPosting
		if a.JobID != "" {
			// use silent session for best-effort lookup to avoid noisy logs when not found
			dbSilent := models.DB.Session(&gorm.Session{Logger: glogger.Default.LogMode(glogger.Silent)})
			if err := dbSilent.Where("id = ?", a.JobID).First(&job).Error; err == nil {
				meta.JobTitle = job.Title
				meta.JobDepartment = job.Department
				meta.JobLocation = job.Location
			}
		}

		// If rejected -> determine when and whether interview occurred before rejection
		if a.Status == "rejected" {
			var rejTimeline models.ApplicationTimeline
			rejErr := models.DB.Where("application_id = ? AND status = ?", a.ID, "rejected").Order("date desc").First(&rejTimeline).Error
			var rejectedAt time.Time
			if rejErr == nil {
				rejectedAt = rejTimeline.Date
			} else {
				rejectedAt = a.UpdatedAt
			}

			var interviewCount int64
			models.DB.Model(&models.ApplicationTimeline{}).
				Where("application_id = ? AND status = ? AND date < ?", a.ID, "interview", rejectedAt).
				Count(&interviewCount)

			waitMonths := 3
			reason := "screening"
			if interviewCount > 0 {
				waitMonths = 6
				reason = "interview"
			}
			allowedAt := rejectedAt.AddDate(0, waitMonths, 0)
			meta.WaitingMonths = waitMonths
			meta.RejectionStage = reason
			meta.CanReapplyDate = &allowedAt
			if time.Now().After(allowedAt) {
				meta.CanReapply = true
			}
		}

		items = append(items, AppListItem{Application: a, AppMeta: meta})
	}
}

	c.JSON(http.StatusOK, gin.H{
		"ok":       true,
		"page":     page,
		"limit":    limit,
		"total":    total,
		"apps":     items,
		"returned": len(items),
	})
}

// GET /api/applications/:id
func GetApplication(c *gin.Context) {
id := c.Param("id")
if id == "" {
	c.JSON(http.StatusBadRequest, gin.H{"error": "missing id"})
	return
}
var app models.Application
if err := models.DB.Where("id = ?", id).First(&app).Error; err != nil {
	c.JSON(http.StatusNotFound, gin.H{"error": "application not found"})
	return
}

if rv, ok := c.Get("user_role"); ok && rv == "candidate" {
if uidv, ok2 := c.Get("user_id"); ok2 {
if app.ApplicantID != uidv.(string) {
c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
return
}
}
}

var timelines []models.ApplicationTimeline
models.DB.Where("application_id = ?", id).Order("date desc").Find(&timelines)

var notes []models.Note
models.DB.Where("application_id = ?", id).Order("created_at desc").Find(&notes)


// evaluation may not exist — treat missing record as null, and only return it when status >= interview
	var eval *models.Evaluation = nil
	{
		var ev models.Evaluation
		dbSilent := models.DB.Session(&gorm.Session{Logger: glogger.Default.LogMode(glogger.Silent)})
		if err := dbSilent.Where("application_id = ?", id).First(&ev).Error; err == nil {
			if app.Status == "interview" || app.Status == "offer" || app.Status == "hired" {
				eval = &ev
			}
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			// unexpected error, but don't fail the whole request
		}
	}

// job may not exist (best-effort)
var job *models.JobPosting = nil
{
	var j models.JobPosting
	if app.JobID != "" {
		dbSilent := models.DB.Session(&gorm.Session{Logger: glogger.Default.LogMode(glogger.Silent)})
		if err := dbSilent.Where("id = ?", app.JobID).First(&j).Error; err == nil {
			job = &j
		}
	}
}

// applicant (user) may not exist — best-effort
var applicant *models.User = nil
{
	var u models.User
	if app.ApplicantID != "" {
		dbSilent := models.DB.Session(&gorm.Session{Logger: glogger.Default.LogMode(glogger.Silent)})
		if err := dbSilent.Where("id = ?", app.ApplicantID).First(&u).Error; err == nil {
			applicant = &u
		}
	}
}

c.JSON(http.StatusOK, gin.H{
"ok":          true,
	"application": app,
	"job":         job,
	"applicant":   applicant,
	"timeline":    timelines,
	"notes":       notes,
	"evaluation":  eval,
})
}

// PATCH /api/applications/:id/status
type UpdateStatusBody struct {
Status      string `json:"status" binding:"required"`
Description string `json:"description"`
}

func UpdateApplicationStatus(c *gin.Context) {
id := c.Param("id")
var body UpdateStatusBody
if err := c.ShouldBindJSON(&body); err != nil {
c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
return
}

var app models.Application
if err := models.DB.Where("id = ?", id).First(&app).Error; err != nil {
c.JSON(http.StatusNotFound, gin.H{"error": "application not found"})
return
}

old := app.Status
 // If attempting to mark as offer or hired, ensure an HM evaluation exists first
 if body.Status == "hired" || body.Status == "offer" {
	 var ev models.Evaluation
	 dbSilent := models.DB.Session(&gorm.Session{Logger: glogger.Default.LogMode(glogger.Silent)})
	 if err := dbSilent.Where("application_id = ?", id).First(&ev).Error; err != nil {
		 if errors.Is(err, gorm.ErrRecordNotFound) {
			 c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่สามารถเปลี่ยนสถานะเป็น 'offer'/'hired' ได้: กรุณารอ HM ให้คะแนนก่อน"})
			 return
		 }
		 c.JSON(http.StatusInternalServerError, gin.H{"error": "ตรวจสอบ evaluation ล้มเหลว"})
		 return
	 }

	 // optional: ensure evaluator is a user with role 'hm'
	 var evaluator models.User
	 if ev.EvaluatorID != "" {
		 if err := dbSilent.Where("id = ?", ev.EvaluatorID).First(&evaluator).Error; err == nil {
			 if evaluator.Role != "hm" {
				 c.JSON(http.StatusBadRequest, gin.H{"error": "การประเมินต้องมาจาก HM ก่อนจึงจะเปลี่ยนสถานะเป็น offer/hired ได้"})
				 return
			 }
		 }
	 }
 }

 app.Status = body.Status
app.UpdatedAt = time.Now()
if err := models.DB.Save(&app).Error; err != nil {
c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot update application status"})
return
}

tl := models.ApplicationTimeline{
ID:            uuid.NewString(),
ApplicationID: id,
Status:        body.Status,
Date:          time.Now(),
Description:   body.Description,
}
models.DB.Create(&tl)

c.JSON(http.StatusOK, gin.H{"ok": true, "previous_status": old, "new_status": app.Status, "timeline": tl})
}
