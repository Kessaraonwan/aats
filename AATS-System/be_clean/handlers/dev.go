// dev.go
package handlers

import (
	"fmt"
	"math/rand"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"aats-backend-clean/models"
	"aats-backend-clean/utils"
)

// POST /api/dev/seed (enriched seed, idempotent + safer)
func SeedDev(c *gin.Context) {
	// เปิดใช้เฉพาะโหมด dev/debug เท่านั้น
	if gin.Mode() != gin.DebugMode {
		c.JSON(http.StatusForbidden, gin.H{"ok": false, "error": "dev seed is disabled in non-debug mode"})
		return
	}

	now := time.Now().UTC()
	tx := models.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "error": "seed panic"})
		}
	}()

	// --- USERS ---
	usersData := []struct {
		Email, Password, Role, Name, Phone string
	}{
		{"hr@aats.com", "hr123456", "hr", "สมหญิง เอชอาร์", "080-111-1111"},
		{"hm@aats.com", "hm123456", "hm", "สมศักดิ์ ผู้จัดการ", "080-222-2222"},
		{"lead@aats.com", "lead123456", "hm", "ลีด ทีมเทค", "080-333-3333"},
		{"candidate1@aats.com", "cand1234", "candidate", "สมชาย ผู้สมัคร", "081-111-0001"},
		{"candidate2@aats.com", "cand1234", "candidate", "สมปอง ผู้สมัคร", "081-111-0002"},
		{"candidate3@aats.com", "cand1234", "candidate", "สมศรี ผู้สมัคร", "081-111-0003"},
	}
	created := map[string]models.User{}

	for _, u := range usersData {
		hash, _ := utils.HashPassword(u.Password)
		dept, pos := "General", "Staff"
		switch u.Role {
		case "hr":
			dept, pos = "HR", "HR Manager"
		case "hm":
			dept, pos = "Hiring", "Hiring Manager"
		case "candidate":
			dept, pos = "Candidate", "Applicant"
		}
		user := models.User{
			ID:         uuid.NewString(),
			Email:      u.Email,
			Password:   hash,
			Role:       u.Role,
			Name:       u.Name,
			Phone:      u.Phone,
			Department: &dept,
			Position:   &pos,
			CreatedAt:  now,
			UpdatedAt:  now,
		}
		var found models.User
		if err := tx.Where("email = ?", u.Email).Assign(user).FirstOrCreate(&found).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "error": err.Error()})
			return
		}
		created[u.Email] = found
	}

	// --- JOBS (key: title+department) ---
	jobs := []models.JobPosting{
		{
			Title:            "พนักงานขาย",
			Department:       "ฝ่ายขาย",
			Location:         "สาขาเซ็นทรัล ลาดพร้าว",
			ExperienceLevel:  "entry",
			Description:      "รับสมัครพนักงานขายหน้าร้าน มีใจรักงานบริการ",
			Requirements:     `["ม.6 ขึ้นไป","มีใจรักงานขาย"]`,
			Responsibilities: `["ให้คำแนะนำลูกค้า","จัดเรียงสินค้า"]`,
			Status:           "active",
			PostedDate:       now.AddDate(0, 0, -10),
			ClosingDate:      now.AddDate(0, 1, 0),
			CreatedBy:        created["hr@aats.com"].ID,
			CreatedAt:        now,
			UpdatedAt:        now,
		},
		{
			Title:            "นักพัฒนาซอฟต์แวร์ (Frontend)",
			Department:       "ไอที",
			Location:         "สำนักงานใหญ่ / Remote",
			ExperienceLevel:  "mid",
			Description:      "React + TypeScript + UI/UX เข้าใจธุรกิจ",
			Requirements:     `["ป.ตรี คณะคอมพิวเตอร์","React,TypeScript"]`,
			Responsibilities: `["พัฒนาเว็บหน้าลูกค้า","ร่วมออกแบบ API"]`,
			Status:           "active",
			PostedDate:       now.AddDate(0, 0, -20),
			ClosingDate:      now.AddDate(0, 0, 10),
			CreatedBy:        created["hr@aats.com"].ID,
			CreatedAt:        now,
			UpdatedAt:        now,
		},
		{
			Title:            "Data Engineer",
			Department:       "Data",
			Location:         "สำนักงานใหญ่",
			ExperienceLevel:  "senior",
			Description:      "วางระบบ Data pipeline",
			Requirements:     `["SQL","Python","ETL"]`,
			Responsibilities: `["ออกแบบ ETL","ปรับจูน DB"]`,
			Status:           "closed",
			PostedDate:       now.AddDate(0, -2, 0),
			ClosingDate:      now.AddDate(0, -1, 0),
			CreatedBy:        created["hr@aats.com"].ID,
			CreatedAt:        now,
			UpdatedAt:        now,
		},
		{
			Title:            "Intern - IT Support",
			Department:       "ไอที",
			Location:         "สำนักงานใหญ่",
			ExperienceLevel:  "entry",
			Description:      "ฝึกงานสาย IT support",
			Requirements:     `["กำลังศึกษา","สื่อสารภาษาอังกฤษพื้นฐาน"]`,
			Responsibilities: `["ช่วยแก้ปัญหาหน้างาน","ติดตั้งโปรแกรม"]`,
			Status:           "draft",
			PostedDate:       now,
			ClosingDate:      now.AddDate(0, 3, 0),
			CreatedBy:        created["hr@aats.com"].ID,
			CreatedAt:        now,
			UpdatedAt:        now,
		},
	}
	jobMap := map[string]string{}
	for i := range jobs {
		// ensure a stable unique ID is available when creating new job rows
		if jobs[i].ID == "" {
			jobs[i].ID = uuid.NewString()
		}
		j := jobs[i]
		var rec models.JobPosting
		// Use Attrs so existing records are found by title+department and new ones are created with our attributes
		if err := tx.Where("title = ? AND department = ?", j.Title, j.Department).
			Attrs(j).
			FirstOrCreate(&rec).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "error": err.Error()})
			return
		}
		jobMap[j.Title+"|"+j.Department] = rec.ID
	}

	// --- APPLICATIONS (key: job_id + applicant_id) ---
	appOf := func(title, dept, email, status, cv, cover, edu, exp, skills string, submitted time.Time) models.Application {
		return models.Application{
			ID:            uuid.NewString(),
			JobID:         jobMap[title+"|"+dept],
			ApplicantID:   created[email].ID,
			Resume:        cv,
			CoverLetter:   cover,
			Education:     edu,
			Experience:    exp,
			Skills:        skills,
			Status:        status,
			SubmittedDate: submitted,
			CreatedAt:     submitted,
			UpdatedAt:     submitted,
		}
	}
	app1 := appOf("พนักงานขาย", "ฝ่ายขาย", "candidate1@aats.com", "submitted",
		"somchai-resume.pdf",
		"ผมสนใจตำแหน่งพนักงานขาย",
		`{"degree":"ป.ตรี","institution":"มหาวิทยาลัยตัวอย่าง"}`,
		`{"position":"พนักงานขายพาร์ทไทม์","company":"ร้านA","duration":"1 ปี"}`,
		`["การขาย","บริการลูกค้า"]`,
		now.AddDate(0, 0, -5),
	)
	app2 := appOf("นักพัฒนาซอฟต์แวร์ (Frontend)", "ไอที", "candidate2@aats.com", "interview",
		"pompom-resume.pdf",
		"มีประสบการณ์ React 2 ปี",
		`{"degree":"ป.ตรี","institution":"มหาวิทยาลัยB"}`,
		`{"position":"Frontend Dev","company":"บริษัทB","duration":"2 ปี"}`,
		`["React","TypeScript"]`,
		now.AddDate(0, 0, -12),
	)
	app3 := appOf("นักพัฒนาซอฟต์แวร์ (Frontend)", "ไอที", "candidate3@aats.com", "interview",
		"somsri-resume.pdf",
		"สนใจทำงานด้าน UI/UX",
		`{"degree":"ป.ตรี","institution":"มหาวิทยาลัยC"}`,
		`{"position":"UI Designer","company":"StudioC","duration":"3 ปี"}`,
		`["Figma","React"]`,
		now.AddDate(0, 0, -18),
	)
	app4 := appOf("Data Engineer", "Data", "candidate1@aats.com", "hired",
		"somchai-de-resume.pdf",
		"เคยทำ ETL มาก่อน",
		`{"degree":"ป.ตรี","institution":"มหาวิทยาลัยD"}`,
		`{"position":"Data Engineer","company":"DataCo","duration":"4 ปี"}`,
		`["SQL","Python"]`,
		now.AddDate(0, -6, 0),
	)

	apps := []*models.Application{&app1, &app2, &app3, &app4}
	for _, a := range apps {
		var found models.Application
		if err := tx.Where("job_id = ? AND applicant_id = ?", a.JobID, a.ApplicantID).
			Assign(*a).
			FirstOrCreate(&found).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "error": err.Error()})
			return
		}
		a.ID = found.ID // sync id if record already existed
	}

	// --- TIMELINES (dedupe by [appID,status,day]) ---
	addTL := func(appID, status, desc string, at time.Time) error {
		dayStart := time.Date(at.Year(), at.Month(), at.Day(), 0, 0, 0, 0, time.UTC)
		dayEnd := dayStart.Add(24 * time.Hour)
		var exists models.ApplicationTimeline
		if err := tx.Where(
			"application_id = ? AND status = ? AND date >= ? AND date < ?",
			appID, status, dayStart, dayEnd,
		).First(&exists).Error; err == nil {
			return nil
		}
		tl := models.ApplicationTimeline{
			ID:            uuid.NewString(),
			ApplicationID: appID,
			Status:        status,
			Date:          at,
			Description:   desc,
			CreatedAt:     at,
		}
		return tx.Create(&tl).Error
	}
	_ = addTL(app1.ID, "submitted", "ส่งใบสมัครเรียบร้อย", app1.SubmittedDate)
	_ = addTL(app2.ID, "submitted", "ส่งใบสมัครเรียบร้อย", app2.SubmittedDate)
	_ = addTL(app2.ID, "screening", "HR กำลังตรวจสอบ", app2.SubmittedDate.AddDate(0, 0, 3))
	_ = addTL(app3.ID, "submitted", "ส่งใบสมัครเรียบร้อย", app3.SubmittedDate)
	_ = addTL(app3.ID, "screening", "ผ่านการคัดกรอง", app3.SubmittedDate.AddDate(0, 0, 5))
	_ = addTL(app3.ID, "interview", "นัดสัมภาษณ์วันที่ 2025-10-15", app3.SubmittedDate.AddDate(0, 0, 10))
	_ = addTL(app4.ID, "submitted", "ส่งใบสมัครเรียบร้อย", app4.SubmittedDate)
	_ = addTL(app4.ID, "interview", "สัมภาษณ์เรียบร้อย", app4.SubmittedDate.AddDate(0, 0, 7))
	_ = addTL(app4.ID, "offer", "เสนอข้อเสนอ", app4.SubmittedDate.AddDate(0, 0, 14))
	_ = addTL(app4.ID, "hired", "รับเข้าทำงานแล้ว", app4.SubmittedDate.AddDate(0, 0, 30))

	// --- EVALUATIONS (1:1 keep first) ---
	putEval := func(e models.Evaluation) error {
		var found models.Evaluation
		if err := tx.Where("application_id = ?", e.ApplicationID).First(&found).Error; err == nil {
			return nil // keep existing
		}
		e.ID = uuid.NewString()
		return tx.Create(&e).Error
	}
	if err := putEval(models.Evaluation{
		ApplicationID:   app3.ID,
		EvaluatorID:     created["hm@aats.com"].ID,
		EvaluatorName:   created["hm@aats.com"].Name,
		TechnicalSkills: 4, Communication: 4, ProblemSolving: 3, CulturalFit: 4, OverallScore: 3.8,
		Strengths: "ออกแบบ UX ดี มีไอเดีย", Weaknesses: "เขียน React ยังต้องฝึก", Comments: "แนะนำให้เรียกสัมภาษณ์รอบที่สอง",
		EvaluatedAt: now.AddDate(0, 0, -2),
	}); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "error": err.Error()})
		return
	}
	if err := putEval(models.Evaluation{
		ApplicationID:   app4.ID,
		EvaluatorID:     created["lead@aats.com"].ID,
		EvaluatorName:   created["lead@aats.com"].Name,
		TechnicalSkills: 5, Communication: 4, ProblemSolving: 5, CulturalFit: 5, OverallScore: 4.8,
		Strengths: "ประสบการณ์ตรงและแก้ปัญหาได้ดี", Weaknesses: "", Comments: "รับเข้าทำงานทันที",
		EvaluatedAt: now.AddDate(0, -5, 0),
	}); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "error": err.Error()})
		return
	}

	// --- NOTES (dedupe by app+content per day) ---
	putNote := func(n models.Note) error {
		if n.CreatedAt.IsZero() {
			n.CreatedAt = now
		}
		dayStart := time.Date(n.CreatedAt.Year(), n.CreatedAt.Month(), n.CreatedAt.Day(), 0, 0, 0, 0, time.UTC)
		dayEnd := dayStart.Add(24 * time.Hour)
		var found models.Note
		if err := tx.Where(
			"application_id = ? AND content = ? AND created_at >= ? AND created_at < ?",
			n.ApplicationID, n.Content, dayStart, dayEnd,
		).First(&found).Error; err == nil {
			return nil
		}
		n.ID = uuid.NewString()
		return tx.Create(&n).Error
	}
	_ = putNote(models.Note{
		ApplicationID: app2.ID,
		Author:        "HR Team",
		CreatedBy:     created["hr@aats.com"].ID,
		Content:       "ผู้สมัครมีประสบการณ์ตรงบางส่วน แต่ต้องให้ HM ตรวจสอบ",
		CreatedAt:     now,
	})
	_ = putNote(models.Note{
		ApplicationID: app3.ID,
		Author:        "HM",
		CreatedBy:     created["hm@aats.com"].ID,
		Content:       "นัดสัมภาษณ์แล้ว 15 ต.ค. 10.00 น.",
		CreatedAt:     now,
	})

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"ok": true,
		"data": gin.H{
			"users": gin.H{
				"hr":        created["hr@aats.com"].Email,
				"hm":        created["hm@aats.com"].Email,
				"lead":      created["lead@aats.com"].Email,
				"candidate": []string{created["candidate1@aats.com"].Email, created["candidate2@aats.com"].Email, created["candidate3@aats.com"].Email},
			},
			"jobs": []string{"พนักงานขาย", "นักพัฒนาซอฟต์แวร์ (Frontend)", "Data Engineer", "Intern - IT Support"},
			"sample_application_id": app1.ID,
		},
	})
}

// POST /api/dev/seed_more - create additional sample candidates + applications
func SeedMore(c *gin.Context) {
	if gin.Mode() != gin.DebugMode {
		c.JSON(http.StatusForbidden, gin.H{"ok": false, "error": "dev seed is disabled in non-debug mode"})
		return
	}

	candidates := 10
	appsPer := 2
	var rngSeed int64 = time.Now().Unix()

	if v := c.Query("candidates"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 && n <= 1000 {
			candidates = n
		}
	}
	if v := c.Query("apps_per_candidate"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 && n <= 20 {
			appsPer = n
		}
	}
	if v := c.Query("seed"); v != "" {
		if s, err := strconv.ParseInt(v, 10, 64); err == nil {
			rngSeed = s
		}
	}

	r := rand.New(rand.NewSource(rngSeed))
	tx := models.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "error": "seed_more panic"})
		}
	}()

	// name pools
	firstNames := []string{"nattapol", "sunthorn", "apichai", "kamon", "anan", "tanawut", "warin", "parinya", "jiraporn", "kotchaporn", "siwakorn", "thitipong", "patcharee"}
	lastNames := []string{"srithong", "watanapong", "jittama", "kanchanakit", "phuwadon", "pitak", "wongchai", "narong", "chinawat", "prasit"}

	// base users for attribution
	var hrUser, hmUser models.User
	tx.Where("email = ?", "hr@aats.com").First(&hrUser)
	tx.Where("email = ?", "hm@aats.com").First(&hmUser)

	// jobs to attach
	var jobs []models.JobPosting
	tx.Find(&jobs)
	if len(jobs) == 0 {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "error": "no jobs available to seed applications"})
		return
	}

	created := map[string]models.User{}
	for i := 1; i <= candidates; i++ {
		fn := firstNames[r.Intn(len(firstNames))]
		ln := lastNames[r.Intn(len(lastNames))]
		name := strings.ToUpper(fn[:1]) + fn[1:] + " " + strings.ToUpper(ln[:1]) + ln[1:]
		email := fmt.Sprintf("%s.%s.%d@aats.com", fn, ln, i)
		hash, _ := utils.HashPassword("cand1234")
		phone := fmt.Sprintf("081-%03d-%04d", r.Intn(900)+100, r.Intn(10000))
		dept, pos := "Candidate", "Applicant"
		user := models.User{
			ID:         uuid.NewString(),
			Email:      email,
			Password:   hash,
			Role:       "candidate",
			Name:       name,
			Phone:      phone,
			Department: &dept,
			Position:   &pos,
			CreatedAt:  time.Now().UTC(),
			UpdatedAt:  time.Now().UTC(),
		}
		var found models.User
		if err := tx.Where("email = ?", email).Assign(user).FirstOrCreate(&found).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "error": err.Error()})
			return
		}
		created[email] = found
	}

	appsCreated := []string{}
	idx := 0
	for _, u := range created {
		for j := 0; j < appsPer; j++ {
			job := jobs[idx%len(jobs)]
			app := models.Application{
				ID:            uuid.NewString(),
				JobID:         job.ID,
				ApplicantID:   u.ID,
				Resume:        fmt.Sprintf("%s-resume.pdf", u.ID[:8]),
				CoverLetter:   fmt.Sprintf("สมัครเพื่อทดสอบข้อมูล %s", u.Name),
				Education:     `{"degree":"ป.ตรี","institution":"มหาวิทยาลัยทดสอบ"}`,
				Experience:    `{"position":"Intern","company":"TestCo","duration":"1 ปี"}`,
				Skills:        `["ทดสอบ","ทดลอง"]`,
				Status:        "submitted",
				SubmittedDate: time.Now().AddDate(0, 0, -idx),
				CreatedAt:     time.Now().UTC(),
				UpdatedAt:     time.Now().UTC(),
			}
			var existing models.Application
			if err := tx.Where("job_id = ? AND applicant_id = ?", app.JobID, app.ApplicantID).
				Assign(app).
				FirstOrCreate(&existing).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "error": err.Error()})
				return
			}
			appsCreated = append(appsCreated, existing.ID)

			// timeline submitted (dedupe by day)
			dayStart := time.Date(existing.SubmittedDate.Year(), existing.SubmittedDate.Month(), existing.SubmittedDate.Day(), 0, 0, 0, 0, time.UTC)
			dayEnd := dayStart.Add(24 * time.Hour)
			var tl models.ApplicationTimeline
			if err := tx.Where(
				"application_id = ? AND status = ? AND date >= ? AND date < ?",
				existing.ID, "submitted", dayStart, dayEnd,
			).First(&tl).Error; err != nil {
				tl = models.ApplicationTimeline{
					ID:            uuid.NewString(),
					ApplicationID: existing.ID,
					Status:        "submitted",
					Date:          existing.SubmittedDate,
					Description:   "ส่งใบสมัครเรียบร้อย",
					CreatedAt:     existing.SubmittedDate,
				}
				if e := tx.Create(&tl).Error; e != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "error": e.Error()})
					return
				}
			}

			// note บางส่วน (หากยังไม่มี)
			var noteCnt int64
			tx.Model(&models.Note{}).Where("application_id = ?", existing.ID).Count(&noteCnt)
			if noteCnt == 0 && (idx%3 == 0) {
				n := models.Note{
					ID:            uuid.NewString(),
					ApplicationID: existing.ID,
					Author:        "HR Team",
					CreatedBy:     hrUser.ID,
					Content:       fmt.Sprintf("หมายเหตุทดสอบสำหรับ %s", u.Name),
					CreatedAt:     time.Now().UTC(),
				}
				if err := tx.Where("application_id = ? AND content = ?", n.ApplicationID, n.Content).
					FirstOrCreate(&n).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "error": err.Error()})
					return
				}
			}

			// evaluation บางส่วน (ถ้ายังไม่มี)
			var evalCnt int64
			tx.Model(&models.Evaluation{}).Where("application_id = ?", existing.ID).Count(&evalCnt)
			if evalCnt == 0 && (idx%4 == 0) {
				ev := models.Evaluation{
					ID:              uuid.NewString(),
					ApplicationID:   existing.ID,
					EvaluatorID:     hmUser.ID,
					EvaluatorName:   hmUser.Name,
					TechnicalSkills: 3,
					Communication:   3,
					ProblemSolving:  3,
					CulturalFit:     3,
					OverallScore:    3.0,
					Strengths:       "ทักษะพื้นฐาน",
					Weaknesses:      "จำเป็นต้องฝึกเพิ่มเติม",
					Comments:        "ความคิดเห็นทดสอบ",
					EvaluatedAt:     time.Now().UTC(),
				}
				if err := tx.Where("application_id = ?", ev.ApplicationID).
					FirstOrCreate(&ev).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "error": err.Error()})
					return
				}
			}

			idx++
		}
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"ok": true, "created_applications": appsCreated})
}

// POST /api/dev/seed_more_fill - populate timelines/notes/evaluations for seed apps
func SeedMoreFill(c *gin.Context) {
	if gin.Mode() != gin.DebugMode {
		c.JSON(http.StatusForbidden, gin.H{"ok": false, "error": "dev seed is disabled in non-debug mode"})
		return
	}

	tx := models.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "error": "seed_more_fill panic"})
		}
	}()

	// หา applications ที่ดูเหมือนข้อมูล seed
	var apps []models.Application
	tx.Where("cover_letter LIKE ?", "สมัครเพื่อทดสอบข้อมูล %").Find(&apps)
	if len(apps) == 0 {
		tx.Commit()
		c.JSON(http.StatusOK, gin.H{"ok": true, "message": "no seed applications found"})
		return
	}

	// hr/hm สำหรับใส่โน้ต/ประเมิน
	var hrUser, hmUser models.User
	tx.Where("email = ?", "hr@aats.com").First(&hrUser)
	tx.Where("email = ?", "hm@aats.com").First(&hmUser)

	createdTL, createdNotes, createdEvals := 0, 0, 0
	for i, a := range apps {
		// timeline หากยังไม่มี
		var cnt int64
		tx.Model(&models.ApplicationTimeline{}).Where("application_id = ?", a.ID).Count(&cnt)
		if cnt == 0 {
			dayStart := time.Date(a.SubmittedDate.Year(), a.SubmittedDate.Month(), a.SubmittedDate.Day(), 0, 0, 0, 0, time.UTC)
			dayEnd := dayStart.Add(24 * time.Hour)
			var exists models.ApplicationTimeline
			if err := tx.Where(
				"application_id = ? AND status = ? AND date >= ? AND date < ?",
				a.ID, "submitted", dayStart, dayEnd,
			).First(&exists).Error; err != nil {
				tl := models.ApplicationTimeline{
					ID:            uuid.NewString(),
					ApplicationID: a.ID,
					Status:        "submitted",
					Date:          a.SubmittedDate,
					Description:   "ส่งใบสมัครเรียบร้อย",
					CreatedAt:     a.SubmittedDate,
				}
				if e := tx.Create(&tl).Error; e == nil {
					createdTL++
				}
			}
		}

		// note (ถ้ายังไม่มี) — จำกัดประมาณ 10 รายการพอ
		tx.Model(&models.Note{}).Where("application_id = ?", a.ID).Count(&cnt)
		if cnt == 0 && createdNotes < 10 {
			n := models.Note{
				ID:            uuid.NewString(),
				ApplicationID: a.ID,
				Author:        "HR Team",
				CreatedBy:     hrUser.ID,
				Content:       fmt.Sprintf("หมายเหตุอัตโนมัติสำหรับใบสมัคร %s", a.ID),
				CreatedAt:     time.Now().UTC(),
			}
			if err := tx.Where("application_id = ? AND content = ?", n.ApplicationID, n.Content).FirstOrCreate(&n).Error; err == nil {
				createdNotes++
			}
		}

		// evaluation (ถ้ายังไม่มี) — จำกัดประมาณ 8 รายการพอ
		tx.Model(&models.Evaluation{}).Where("application_id = ?", a.ID).Count(&cnt)
		if cnt == 0 && createdEvals < 8 {
			ev := models.Evaluation{
				ID:              uuid.NewString(),
				ApplicationID:   a.ID,
				EvaluatorID:     hmUser.ID,
				EvaluatorName:   hmUser.Name,
				TechnicalSkills: 3 + (i % 3),
				Communication:   3,
				ProblemSolving:  3,
				CulturalFit:     4,
				OverallScore:    3.5,
				Strengths:       "ทดสอบ",
				Weaknesses:      "ต้องฝึกเพิ่ม",
				Comments:        "Evaluation อัตโนมัติ",
				EvaluatedAt:     time.Now().UTC(),
			}
			if err := tx.Where("application_id = ?", ev.ApplicationID).FirstOrCreate(&ev).Error; err == nil {
				createdEvals++
			}
		}
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"ok": true,
		"timelines_created":   createdTL,
		"notes_created":       createdNotes,
		"evaluations_created": createdEvals,
	})
}
