# คู่มือโครงสร้างโฟลเดอร์และไฟล์ (TH) – AATS-System

ปรับปรุงล่าสุด: 2025-10-16

จุดประสงค์: อธิบายโครงสร้างไดเรกทอรีและไฟล์สำคัญของโปรเจกต์ AATS (ทั้ง Frontend/Backend/DB/Scripts) บอกหน้าที่ ใช้ทำอะไร เชื่อมส่วนไหน เรียกโค้ดตรงไหน และการเชื่อมโยง FE/BE/Database เพื่อให้เข้าใจภาพรวมจน debug/พัฒนา/นำเสนอได้ครบถ้วน

---

## โครงสร้างระดับบนสุด: `AATS-System/`

ประกอบด้วยส่วนหลัก 3 ส่วน: Backend (`be_clean/`), Frontend (`fe/`), เอกสาร/สคริปต์ (`docs/`, `scripts/`)

- `README.md` — คำอธิบายโปรเจกต์รวม (บางส่วนตัวอักษรไทยอาจเพี้ยนในไฟล์นี้แต่เนื้อหาครบ)
- `.gitignore` — รายการไฟล์/โฟลเดอร์ที่ไม่ต้องการให้ track (เช่น build, node_modules)
- `test-api.js` — สคริปต์ตัวอย่างยิง API เบื้องต้นผ่าน fetch (register, login, me, jobs) ใช้เป็นไอเดียทดลองกับเบราว์เซอร์/Console หรือ Postman (โครงสร้าง response ในโค้ดนี้เป็นตัวอย่าง ไม่ผูกกับ BE ล่าสุดทุกบรรทัด)
- `be_clean/` — โค้ด Backend (Go + Gin + GORM + PostgreSQL)
- `fe/` — โค้ด Frontend (React + Vite + TailwindCSS + shadcn/ui)
- `docs/` — เอกสารระบบแบบละเอียด, Q&A, และสคริปต์พรีเซนต์ (ไฟล์ที่เพิ่มใหม่อยู่ที่นี่)
- `scripts/` — สคริปต์ SQL/PowerShell สำหรับงานดูแล/เดโมเฉพาะกิจ

---

## Backend: `AATS-System/be_clean/`

เทคโนโลยี: Go 1.21, Gin, GORM, PostgreSQL, JWT, Docker Compose

ไฟล์/โฟลเดอร์สำคัญ:

- `main.go`
  - จุดเริ่มต้นของเซิร์ฟเวอร์ Gin
  - โหลด `.env`, เชื่อมต่อฐานข้อมูลผ่าน `models.ConnectDatabase()`
  - ผูก Middleware (CORS) และกำหนด Route Groups `/api`
  - แม็ปทุก Endpoint หลัก เช่น `/auth`, `/jobs`, `/applications`, `/notifications`, `/uploads` และกลุ่ม `/dev/*`
  - กำหนดพอร์ตจาก ENV `PORT` (ค่าเริ่มต้น 8080)

- `config/`
  - `config.go` — helper โหลดค่าจาก ENV (Port, DATABASE_URL, JWT_SECRET) ไว้ใช้งานรวม

- `handlers/` — ชุดโค้ด “ส่วนจัดการคำขอ HTTP” (Controller Layer)
  - `auth.go` — ลงทะเบียน/เข้าสู่ระบบ/อ่านข้อมูลผู้ใช้ปัจจุบัน (register/login/me), ออก JWT (HS256)
  - `jobs.go` — CRUD Job Posting (list/get/create/update/delete) + แปลงวันปิดรับ, กรองสถานะ
  - `applications.go` — สร้าง/ดึงรายการ/ดึงเดี่ยว/อัปเดตสถานะของใบสมัคร
    - บังคับกฎธุรกิจ: จำกัดใบสมัครคงค้าง ≤ 5, ห้ามสมัครซ้ำงานเดิมระหว่าง active, คุมช่วงรอ re-apply 3/6 เดือน
    - รองรับ Pagination แบบ OFFSET และแบบ Keyset ผ่าน `cursor`
    - ตัวเลือก `include_details` (รวม job/applicant/timeline/notes/evaluation + meta can_reapply ใน response)
  - `notes.go` — เพิ่ม/ดึงโน้ตของใบสมัคร (สร้างโดย HR/HM, เก็บผู้เขียน/ผู้สร้าง)
  - `evaluation.go` — สร้าง/อ่านผลประเมินโดย HM (บังคับ 1:1 ต่อ application, อนุญาตเมื่อสถานะ >= interview)
  - `notifications.go` — รวมเหตุการณ์จาก Timeline/Evaluation เป็น feed เดียวสำหรับการแจ้งเตือนใน FE
  - `uploads.go` — อัปโหลดไฟล์เรซูเม่ (multipart/form-data field `file`) เก็บไฟล์ใน `uploads/resumes/`
  - `dev.go` — Endpoint seed ข้อมูลทดสอบ (ทำงานเฉพาะโหมด debug)

- `middleware/` — ชั้นกลางที่คร่อมทุก request
  - `base.go` — CORS (AllowOrigins/Methods/Headers + AllowOriginFunc เปิดให้ `localhost:*` ใน dev)
  - `auth.go` — ตรวจ header `Authorization: Bearer <JWT>` แยก claims และตั้ง `user_id`/`user_role` ใน Gin Context
  - `role.go` — `RequireRoles(…)` บังคับบทบาทต่อเส้นทาง (ควรใช้ครอบ Jobs CRUD/Note/Evaluation/Update Status ในโปรดักชัน)

- `models/` — แบบจำลองข้อมูล + เชื่อมต่อฐานข้อมูล (Data + Repository Layer)
  - `database.go` — เชื่อม Postgres จาก `DATABASE_URL`, ทำ `AutoMigrate` ตารางหลักทั้งหมด, เก็บตัวแปร `DB *gorm.DB`
  - `models.go` — นิยาม struct หลัก: `User`, `JobPosting`, `Application`, `ApplicationTimeline`, `Evaluation`, `Note`
    - ความสัมพันธ์ตรรกะ: User 1:N JobPosting/Application, JobPosting 1:N Application, Application 1:N Timeline/Note, Application 1:1 Evaluation
    - เก็บฟิลด์ JSON บางค่า (เช่น `requirements`, `skills`) ในรูป string

- `utils/`
  - `password.go` — ฟังก์ชัน bcrypt hash/check สำหรับรหัสผ่าน
  - `pagination.go` — helper parse หน้ากับ limit (ฝั่ง FE เลือกใช้/ไม่ใช้ได้ตามสถานการณ์)

- `uploads/`
  - `resumes/` — ที่เก็บไฟล์เรซูเม่หลังอัปโหลด (ควรเสิร์ฟผ่าน static/proxy หรือย้ายไป Object Storage ในโปรดักชัน)

- `docker-compose.yml`
  - เปิด Postgres:16 ใน container ชื่อ `aats-postgres` แม็บพอร์ต `5433:5432`, ใช้ named volume `pgdata` แก้ปัญหา permission บน Windows

- `.env`
  - ตัวอย่างค่าที่ใช้จริงในเครื่อง: `DATABASE_URL`, `PORT`, `GIN_MODE`, `JWT_SECRET`

- `Makefile`
  - งานอำนวยความสะดวก: `dev` (compose up), `build`, `seed`, `run`, `test`

- อื่น ๆ
  - `SEED_INSTRUCTIONS.md` — คู่มือการ seed
  - `public/` — สำรองสำหรับไฟล์สาธารณะ/ข้อมูล mock (ปัจจุบันว่าง)
  - `pgdata/` — ไดเรกทอรีของ volume (สร้างโดย Docker; ไม่ต้องแก้ไขด้วยมือ)

การเชื่อมต่อกับ Database
- ใช้ ENV `DATABASE_URL` ผสานกับ GORM driver `postgres`
- `AutoMigrate` ถูกเรียกในช่วงเริ่มเซิร์ฟเวอร์เพื่อสร้าง/อัปเดต schema อัตโนมัติ

การเชื่อมต่อกับ Frontend
- REST API base: `http://<host>:<port>/api`
- ใช้ JWT ผ่าน header `Authorization: Bearer <token>` ทุก request ที่ต้องยืนยันตัวตน

---

## Frontend: `AATS-System/fe/`

เทคโนโลยี: React 18, Vite, TailwindCSS, shadcn/ui (Radix UI), Axios

ไฟล์/โฟลเดอร์สำคัญ:

- Root
  - `index.html` — หน้า HTML หลักของ Vite
  - `package.json` — สคริปต์และ dependencies
  - `tailwind.config.js` — คอนฟิก TailwindCSS
  - `vite.config.js` — คอนฟิก Vite
  - `.env.example` — ตัวอย่าง `VITE_API_URL` (ค่าเริ่มต้น `http://localhost:8080/api`)
  - `README.md` — คำอธิบายฝั่ง FE

- `src/`
  - `main.jsx` — จุด mount React เข้ากับ DOM
  - `App.jsx` — ตัวควบคุม navigation ทั้งแอป (ไม่ใช้ React Router) ด้วย state `currentPage`/`currentUser`
    - เลือกหน้าอัตโนมัติหลัง login ตามบทบาท: Candidate → Jobs, HR → HR Dashboard, HM → HM Dashboard

  - `pages/` — แบ่งตามบทบาท/ส่วนกลาง
    - `shared/`: `LandingPage.jsx`, `LoginPage.jsx`, `AboutSystemPage.jsx`, `NotificationsPage.jsx`, `EmailTestPage.jsx`
    - `candidate/`: `JobsListPage.jsx`, `ApplyPage.jsx`, `TrackStatusPage.jsx`, `ApplicationHistoryPage.jsx`, `ProfilePage.jsx`
    - `hr/`: `HRDashboardPage.jsx`, `HRApplicantsPage.jsx`, `ApplicantDetailsPage.jsx`, `JobManagementPage.jsx`, `HRReportsPage.jsx`
    - `hm/`: `HMDashboardPage.jsx`, `HMReviewPage.jsx`, `HMEvaluationPage.jsx`, `HMNotificationsPage.jsx`, `HMReportsPage.jsx`

  - `components/`
    - `candidate/`:
      - `ApplyWizard.jsx` — เวิร์กโฟลว์กรอกใบสมัครหลายส่วน
      - `JobCard.jsx`, `JobFilters.jsx` — แสดงการ์ดงานและชุดตัวกรอง
      - `StatusTimeline.jsx` — แสดงไทม์ไลน์สถานะใบสมัคร
    - `hr/`: `ApplicantsTable.jsx`, `JobListOverview.jsx` — ตารางผู้สมัคร/สรุปงานสำหรับ HR
    - `hm/`: `EvaluationForm.jsx` — แบบฟอร์มให้คะแนน 4 ด้าน+คอมเมนต์
    - `shared/`: `Navigation.jsx`, `LoadingSkeletons.jsx`, `ErrorBoundary.jsx`, `EmptyState.jsx`, `EnhancedEmptyState.jsx`
    - `ui/`: ชุดคอมโพเนนต์ shadcn/ui (alert, button, card, dialog, select, tabs, table, etc.)

  - `services/`
    - `api.js` — ตั้ง Axios instance ชี้ `VITE_API_URL`, interceptors แนบ token/จัดการ 401 (เคลียร์ `localStorage` และ redirect กลับ `/login` กรณีเหมาะสม)
    - `authService.js` — register/login/me/logout + helpers (`isAuthenticated`, `getUserRole`)
    - `jobService.js` — เรียก `/jobs` (list/get) + สร้าง/อัปเดต/ลบ (ฝั่งโปรดักชันควรจำกัด HR)
    - `applicationService.js` — `/applications` (list/get/create) + `/applications/:id/status` + notes + evaluation
    - `notificationService.js` — `/notifications/aggregate` คืน feed เตรียมโชว์ badge/รายการแจ้งเตือน
    - `emailService.js`, `emailProvider.js` — Mock email ส่งแจ้งเตือน (ยังไม่ผูกบริการจริง)
    - `jobsAdapter.js` — ตัวแปลงฟิลด์งาน (BE → FE)
    - `userService.js` — helper ผู้ใช้ (เบื้องต้น)

  - `hooks/`
    - `useRecruitmentData.js` — Hook รวมโหลด Applications/Jobs แบบ batch + normalize + dedupe + map `details` เมื่อ `includeDetails=true`

  - `utils/`
    - `validation.js`, `performance.js`, `toastHelpers.js`, `accessibility.js` — utility ฝั่ง FE

  - `styles/`
    - `globals.css` — สไตล์ส่วนกลางของ FE

  - อื่น ๆ
    - `tailwind.css` — เรียกใช้ยูทิลิตี้ Tailwind บางส่วน

การเชื่อมต่อกับ Backend
- กำหนด `VITE_API_URL` ใน `.env.local` ให้ตรง Backend
- ทุก service ใช้ `api.js` เป็นฐาน (Axios) → อัตโนมัติแนบ `Authorization: Bearer <token>` จาก `localStorage`
- จัดการ 401 โดย logout และนำผู้ใช้ไปหน้า Login (เว้นกรณีผู้ใช้อยู่หน้าล็อกอินอยู่แล้ว)

การเชื่อมต่อกับ Database
- ทำผ่าน Backend เท่านั้น (FE ไม่คุย DB ตรง) — FE เรียก REST API และแปลงผลไปเป็น props/state ทันที

---

## เอกสาร: `AATS-System/docs/`

- `AATS_FULL_SYSTEM_DOCUMENTATION_TH.md` — เอกสารระบบฉบับสมบูรณ์ (สถาปัตยกรรม/สคีมา/ทุก Endpoint/กฎธุรกิจ/ความปลอดภัย/Deploy/Troubleshooting/แผนพัฒนาต่อ)
- `AATS_QA_TH.md` — 50 คำถาม–คำตอบเชิงลึก ครอบคลุมทุกหัวข้อ (สถาปัตยกรรม, API, กฎธุรกิจ, FE/BE, Deploy, etc.)
- `AATS_Presentation_Script_TH.md` — สคริปต์พรีเซนต์ 5 หน้าเด่น 5 ผู้บรรยาย พร้อมสไลด์โครงและแผนสำรองเดโม
- เอกสารนี้: `AATS_Folder_File_Guide_TH.md` — คู่มือไฟล์/โฟลเดอร์ (ปัจจุบันที่คุณกำลังอ่าน)

บทบาทของโฟลเดอร์ `docs/`: เก็บวัสดุอ้างอิงทั้งหมด เพื่อให้ทีมอ่านเข้าใจภาพรวม ทำเดโม และตอบคำถามกรรมการ/อาจารย์ได้ครบ

---

## สคริปต์: `AATS-System/scripts/`

- `preview_diagnostics.sql` — SQL สำหรับวิเคราะห์/พรีวิวข้อมูลสถานะในฐานข้อมูล (เช่น นับต่อสถานะ, ตรวจข้อมูล seed)
- `promote_apps.sql` — SQL ตัวอย่างสำหรับโปรโมตสถานะใบสมัคร (ใช้ด้วยความระมัดระวังใน dev/demo)
- `run_promote.ps1` — PowerShell รันสคริปต์/ตั้งพารามิเตอร์สำหรับโปรโมตสถานะอย่างรวดเร็ว (เดโม/ทดสอบ)

บทบาทของ `scripts/`: ใช้ประกอบเดโม/ทดสอบ/ซ่อมบำรุงข้อมูลอย่างเฉพาะกิจ ไม่ใช่ส่วนหลักของแอปลิเคชัน runtime

---

## แผนภาพการเชื่อมโยง FE/BE/DB (เชิงข้อความ)

- FE (React):
  - ผู้ใช้กดปุ่ม/กรอกฟอร์ม → เรียก service ใน `src/services/*` → ใช้ `api.js` (Axios) ยิง REST API ไปยัง BE (base=`VITE_API_URL`)
  - ตัวอย่าง: `ApplyPage.jsx` → อัปโหลดเรซูเม่ `/uploads/resume` → นำ URL มากรอกใน payload → `POST /applications`
  - ตัวอย่าง: `TrackStatusPage.jsx` → `GET /applications` (Candidate จะถูกกรองด้วย JWT อัตโนมัติ) → กดรายการ → `GET /applications/:id` → แสดง timeline/notes/evaluation/job/applicant

- BE (Go Gin):
  - รับ request ผ่าน Gin Router ใน `main.go` → ส่งเข้าหา handler ตามกลุ่ม (auth/jobs/applications/…)
  - ทุกเส้นทางสำคัญที่ต้องการ token ใช้ `AuthMiddleware` ตรวจ JWT และตั้ง `user_id`/`user_role` เพื่อใช้บังคับกฎใน handler
  - เข้าถึงฐานข้อมูลผ่าน GORM (ตัวแปร `models.DB`) → อ่าน/เขียนตารางตามโมเดลใน `models/models.go`

- DB (Postgres):
  - เก็บข้อมูลผู้ใช้ (`users`), ประกาศงาน (`job_postings`), ใบสมัคร (`applications`), ไทม์ไลน์ (`application_timelines`), การประเมิน (`evaluations`), หมายเหตุ (`notes`)
  - โครงสร้างถูกสร้าง/อัปเดตโดย `AutoMigrate` ตอนเปิดเซิร์ฟเวอร์

---

## ตัวอย่างเส้นทางโค้ด (Flow สำคัญ)

1) Candidate สมัครงาน
- FE: `ApplyPage.jsx` → อัปโหลดไฟล์ `POST /uploads/resume` → สร้าง payload (coverLetter/education/skills) → `applicationService.createApplication()` → `POST /applications`
- BE: `handlers/applications.go (CreateApplication)` → ตรวจนโยบาย (≤5 active, ซ้ำงานเดิม, ช่วงรอ re-apply) → บันทึก `applications` + `submitted_date`
- DB: insert row ลงตาราง `applications`

2) HR เปลี่ยนสถานะใบสมัคร
- FE: หน้า HR (เช่น `ApplicantDetailsPage.jsx`) → `applicationService.updateApplicationStatus()` → `PATCH /applications/:id/status`
- BE: `UpdateApplicationStatus` → ตรวจถ้าจะเป็น `offer/hired` ต้องมี `evaluation` → บันทึกสถานะใหม่ + create `application_timelines`
- DB: update `applications.status` + insert timeline ใหม่

3) HM ประเมินผู้สมัคร
- FE: `HMEvaluationPage.jsx` → `applicationService.createEvaluation()` → `POST /applications/:id/evaluation`
- BE: `CreateEvaluation` → ตรวจสถานะใบสมัคร (`interview|offer|hired`) → upsert `evaluations` (1:1) → คำนวณ `overall_score` ถ้าไม่ได้ส่งมา
- DB: insert/update `evaluations`

4) การแจ้งเตือนรวม (Notifications)
- FE: `notificationService.getAggregated()` → `GET /notifications/aggregate`
- BE: รวม `timelines` และ `evaluations` ล่าสุด → จัดรูป `{ id,type,title,message,payload,timestamp }`
- FE: ใช้สำหรับแสดง badge/unread และรายการแจ้งเตือนในหน้า Track/Notifications

---

## ข้อควรระวัง/แนวปฏิบัติที่ดี

- ตั้งค่า ENV ให้ครบทั้ง BE (`DATABASE_URL`, `JWT_SECRET`, `PORT`) และ FE (`VITE_API_URL`) ก่อนรัน
- โปรดักชัน: จำกัด CORS ให้เฉพาะโดเมนจริง และผูก `RequireRoles` กับ route สำคัญทุกตัว
- Upload: เสิร์ฟไฟล์ผ่าน static/proxy หรือย้ายไป Object Storage (S3/Blob) พร้อม URL สาธารณะ
- ประสิทธิภาพ: ใช้ `cursor`/`skip_count`/`include_details` ให้เหมาะกับหน้าและปริมาณข้อมูล
- ความปลอดภัย: พิจารณา httpOnly cookie + refresh token rotation หากต้องการลดความเสี่ยง XSS

---

## สรุป

- `be_clean/` จัดการกฎธุรกิจ/ความปลอดภัย/การเข้าถึงฐานข้อมูล ให้บริการผ่าน REST API
- `fe/` จัดการ UI/UX และประสบการณ์ผู้ใช้ แยกบริการ (services) ตามโดเมนงาน เรียก `api.js` เป็นฐานการสื่อสาร
- `docs/` รวมความรู้/คู่มือ/สคริปต์พรีเซนต์ ใช้ประกอบการพัฒนา นำเสนอ และตอบคำถาม
- `scripts/` เป็นเครื่องมือเสริมเพื่อเดโม/ทดสอบ/ซ่อมบำรุงข้อมูลอย่างรวดเร็ว

เมื่อเข้าใจโครงสร้างทั้งหมดนี้ จะสามารถแกะเส้นทางโค้ดได้ตั้งแต่ UI → Service → Endpoint → Handler → Model/DB และย้อนกลับได้เพื่อ debug หรือขยายฟีเจอร์ใหม่อย่างมั่นใจ

