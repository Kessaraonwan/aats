# AATS – Advice Applicant Tracking System

เอกสารระบบฉบับสมบูรณ์ (อิงจากโค้ดใน `AATS-System` ณ ปัจจุบัน)

ปรับปรุงล่าสุด: 2025-10-16

ผู้เขียน: Codex (สรุปจากซอร์สโค้ดจริงในโปรเจกต์นี้)

---

สารบัญ

1) ภาพรวมระบบและวัตถุประสงค์  
2) สถาปัตยกรรมและเทคโนโลยี  
3) โครงสร้างโปรเจกต์และไฟล์สำคัญ  
4) การตั้งค่าแวดล้อมและการเริ่มต้นใช้งาน  
5) แบบจำลองข้อมูล (Data Model) และความสัมพันธ์  
6) Backend API (ทุก Endpoint แบบละเอียด)  
7) กฎธุรกิจ (Business Rules) และนโยบาย  
8) ความปลอดภัย (Auth/JWT/RBAC/CORS/Password Hash)  
9) การอัปโหลดไฟล์ (Resume)  
10) การแจ้งเตือนและการรวมเหตุการณ์ (Aggregate Notifications)  
11) Frontend UI/UX (ทุกบทบาทและแต่ละหน้า)  
12) Services ฝั่ง Frontend และ Storage/State  
13) การ Seed/ทดสอบข้อมูล (Dev Utilities)  
14) การ Deploy ด้วย Docker Compose  
15) แนวทางตรวจสอบและแก้ปัญหา (Troubleshooting)  
16) ข้อจำกัดปัจจุบันและแนวทางพัฒนาต่อ  
17) ภาคผนวก: ตัวอย่าง JSON และรหัสข้อผิดพลาด

---

## 1) ภาพรวมระบบและวัตถุประสงค์

ระบบ AATS (Advice Applicant Tracking System) เป็นระบบบริหารจัดการกระบวนการสรรหาและคัดเลือกบุคลากรแบบครบวงจร ครอบคลุมตั้งแต่ประกาศงาน การสมัครงาน การติดตามสถานะ การบันทึกหมายเหตุ การประเมินผล ไปจนถึงการเสนอข้อเสนอ (Offer) และรับเข้าทำงาน (Hired)  
ผู้ใช้งานหลัก 3 บทบาท:

- Candidate (ผู้สมัคร): ค้นหางาน สมัครงาน อัปโหลดเรซูเม่ ติดตามสถานะ ดูไทม์ไลน์ และรับการแจ้งเตือน
- HR (ฝ่ายบุคคล): จัดการประกาศงาน ดูใบสมัครทั้งหมด เปลี่ยนสถานะ ใส่หมายเหตุ ดูรายละเอียดผู้สมัคร
- HM (Hiring Manager): ดูคิวงานที่ต้องประเมิน ให้คะแนน (Evaluation) พร้อมข้อคิดเห็น

เป้าหมายหลักของระบบ:

- เพิ่มประสิทธิภาพและความคล่องตัวในการสรรหา ลดงานมือและความซ้ำซ้อน
- รองรับการแยกส่วน Frontend/Backend ชัดเจน เพื่อความยืดหยุ่น ความปลอดภัย และการขยายตัว
- มีนโยบาย/กฎธุรกิจชัดเจน โปร่งใส ตรวจสอบย้อนหลังได้ (ผ่าน Timeline/Notes/Evaluation)

---

## 2) สถาปัตยกรรมและเทคโนโลยี

สถาปัตยกรรมแยกส่วน FE/BE เชื่อมต่อกันผ่าน REST API (JSON over HTTP)

- Frontend: React 18 + Vite + TailwindCSS + shadcn/ui (Radix UI)  
  - โค้ดหลักอยู่ที่ `fe/`  
  - ไม่มี React Router ใช้ state ภายใน `src/App.jsx` ในการสลับหน้า  
  - ใช้ Axios เป็น HTTP client พร้อม interceptors  

- Backend: Go 1.21 + Gin Framework + GORM (ORM) + PostgreSQL  
  - โค้ดหลักอยู่ที่ `be_clean/`  
  - มี middleware สำหรับ CORS, Auth (JWT), Role  
  - ใช้ AutoMigrate เพื่อจัดการ schema (ตารางหลัก: User, JobPosting, Application, ApplicationTimeline, Evaluation, Note)  

- Database: PostgreSQL (ผ่าน Docker Compose พอร์ตภายใน container 5432 แมปออกมาเป็น 5433 บนเครื่อง)  

การสื่อสาร:  
Frontend เรียก Backend ผ่าน `VITE_API_URL` (ค่าเริ่มต้น `http://localhost:8080/api`)  
Backend เปิดพอร์ตเริ่มต้น `:8080` (กำหนดผ่าน `PORT`)

---

## 3) โครงสร้างโปรเจกต์และไฟล์สำคัญ

ภาพรวมไดเรกทอรี:

```
AATS-System/
├─ be_clean/                 # Backend (Go + Gin + GORM)
│  ├─ config/                # โหลดค่าคอนฟิกพื้นฐาน (port, DB URL, JWT)
│  ├─ handlers/              # ตัวจัดการ HTTP (auth, jobs, applications, notes, evaluation, dev, uploads, notifications)
│  ├─ middleware/            # CORS, Auth (JWT), RequireRoles
│  ├─ models/                # โมเดลและการเชื่อมต่อ DB (AutoMigrate)
│  ├─ utils/                 # utility (hash password, pagination)
│  ├─ uploads/               # โฟลเดอร์เก็บไฟล์ resume ที่อัปโหลด
│  ├─ docker-compose.yml     # เซ็ต Postgres (พอร์ตภายนอก 5433)
│  ├─ .env                   # ตัวอย่างค่า ENV ในเครื่อง
│  └─ main.go                # จุดเริ่มต้นของเซิร์ฟเวอร์, route mapping
│
├─ fe/                       # Frontend (React + Vite)
│  ├─ src/
│  │  ├─ pages/              # เพจแยกตามบทบาท: candidate / hr / hm / shared
│  │  ├─ services/           # api.js, authService, jobService, applicationService, notificationService
│  │  ├─ hooks/              # useRecruitmentData (โหลดรวม Applications/Jobs + details)
│  │  ├─ components/         # ชุดคอมโพเนนต์ UI/ฟอร์ม/การ์ด/ตาราง ฯลฯ
│  │  └─ App.jsx             # ตัวสลับหน้า/โฟลว์หลักตาม role
│  ├─ .env.example           # ตัวอย่างค่าตัวแปร VITE_API_URL
│  └─ vite.config.js         # คอนฟิก Vite
│
└─ scripts/                  # สคริปต์ SQL/PowerShell สำหรับงานบางอย่าง (เช่น promotion)
```

ไฟล์ที่น่าสนใจเพิ่มเติม:

- `be_clean/handlers/*.go` ครอบคลุมทุก endpoint สำคัญของระบบ  
- `be_clean/middleware/base.go` กำหนด CORS (AllowOrigins/Methods/Headers)  
- `be_clean/middleware/auth.go` ตรวจ JWT และผูก `user_id`/`user_role` ใน context  
- `be_clean/models/models.go` นิยามโมเดลหลัก (User/JobPosting/Application/Timeline/Evaluation/Note)  
- `fe/src/services/api.js` ฐาน Axios + interceptors (แนวทางจัดการ error/401/logout)  
- `fe/src/App.jsx` รวมเส้นทางการนำทางทุกบทบาท (ไม่มี React Router)

---

## 4) การตั้งค่าแวดล้อมและการเริ่มต้นใช้งาน

4.1 ค่าตัวแปรแวดล้อม Backend (`be_clean/.env`):

```
DATABASE_URL=postgres://aats_user:aats_password@127.0.0.1:5433/aats_db?sslmode=disable
PORT=8080
GIN_MODE=release
JWT_SECRET=your_super_secret_key_here
```

อธิบาย:

- `DATABASE_URL` จำเป็น ต้องชี้ไปที่ Postgres ที่ทำงานอยู่ (ค่าเริ่มต้นของ docker-compose คือ 5433)  
- `PORT` พอร์ตที่เซิร์ฟเวอร์ Gin จะฟัง  
- `GIN_MODE` แนะนำ `release` สำหรับใช้งานจริง ถ้าต้องการใช้ endpoint seed แบบ dev ให้เปลี่ยนเป็นโหมด debug  
- `JWT_SECRET` คีย์สำหรับลงลายเซ็น JWT (ควรเป็นค่าลับใน production)

4.2 ค่าตัวแปรแวดล้อม Frontend (`fe/.env.example`):

```
VITE_API_URL=http://localhost:8080/api
```

4.3 ขั้นตอนเริ่มระบบแบบ Local (แนะนำ):

1) เปิด Postgres ด้วย Docker Compose (จากโฟลเดอร์ `be_clean/`):

```
docker-compose up -d
```

จะได้ฐานข้อมูล `aats_db` บน `localhost:5433` user/password `aats_user`/`aats_password`  

2) ตั้งค่า `.env` ของ Backend ให้ชี้ `DATABASE_URL` ไปที่ฐานข้อมูลข้างต้น แล้วรันเซิร์ฟเวอร์:

```
cd be_clean
go run main.go
```

3) ตั้งค่า `.env.local` ของ Frontend ให้ `VITE_API_URL=http://localhost:8080/api` แล้วรัน:

```
cd fe
npm install
npm run dev
```

4) เปิดใช้งานผ่านเบราว์เซอร์:  
Frontend: `http://localhost:5173`  
Backend API: `http://localhost:8080`

หมายเหตุ: CORS อนุญาต origin `http://localhost:5173` และ `http://localhost:3000` โดยค่าเริ่มต้น

---

## 5) แบบจำลองข้อมูล (Data Model) และความสัมพันธ์

ตารางหลัก (ตาม `be_clean/models/models.go`):

5.1 User

- `ID` (string, PK)
- `Email` (string, unique, not null)
- `Password` (string, bcrypt hash, not null)
- `Role` (string: `candidate` | `hr` | `hm`)
- `Name` (string)
- `Phone` (string)
- `Department` (*string, optional)
- `Position` (*string, optional)
- `CreatedAt` (time)
- `UpdatedAt` (time)

5.2 JobPosting

- `ID` (string, PK)
- `Title` (string, not null)
- `Department` (string)
- `Location` (string)
- `ExperienceLevel` (string)
- `Description` (string)
- `Requirements` (string, JSON array เก็บเป็น string)
- `Responsibilities` (string, JSON array เก็บเป็น string)
- `Status` (string: `active`/`closed`/`draft`)
- `PostedDate` (time)
- `ClosingDate` (time)
- `CreatedBy` (string, อ้างอิง User.ID แบบ logical)
- `CreatedAt`/`UpdatedAt`

5.3 Application

- `ID` (string, PK)
- `JobID` (string, index)
- `ApplicantID` (string, index)
- `Resume` (string, URL/ชื่อไฟล์ที่อัปโหลด)
- `CoverLetter` (string)
- `Education` (string, JSON object เก็บเป็น string)
- `Experience` (string, JSON object เก็บเป็น string)
- `Skills` (string, JSON array เก็บเป็น string)
- `Status` (string: `submitted` | `screening` | `interview` | `offer` | `rejected` | `hired` | `withdrawn`)
- `SubmittedDate` (time)
- `CreatedAt`/`UpdatedAt`

5.4 ApplicationTimeline

- `ID` (string, PK)
- `ApplicationID` (string, index)
- `Status` (string)
- `Date` (time)
- `Description` (string)
- `CreatedAt` (time)

5.5 Evaluation (1:1 กับ Application)

- `ID` (string, PK)
- `ApplicationID` (string, uniqueIndex)  
- `EvaluatorID` (string)
- `EvaluatorName` (string)
- `TechnicalSkills` (int)
- `Communication` (int)
- `ProblemSolving` (int)
- `CulturalFit` (int)
- `OverallScore` (float32)
- `Strengths`/`Weaknesses`/`Comments` (string)
- `EvaluatedAt` (time)

5.6 Note

- `ID` (string, PK)
- `ApplicationID` (string, index)
- `Author` (string)
- `CreatedBy` (string, user id)
- `Content` (string)
- `CreatedAt` (time)

ความสัมพันธ์ (เชิงตรรกะ-ไม่ใช่ FK บังคับใน DB ยกเว้น Unique บางตัว):

- User 1:N JobPosting  
- User 1:N Application  
- JobPosting 1:N Application  
- Application 1:N Timeline  
- Application 1:N Note  
- Application 1:1 Evaluation (บังคับผ่าน uniqueIndex)

---

## 6) Backend API (ทุก Endpoint แบบละเอียด)

หมายเหตุเรื่อง Auth: 

- เส้นทางที่ขึ้นกับ `middleware.AuthMiddleware()` ต้องส่ง Header `Authorization: Bearer <JWT>`  
- Role-Based Access ใช้ค่า `user_role` ใน JWT Claims เพื่อตรวจสิทธิ์ในบางส่วนของโค้ด/หน้าจอ (เช่น สร้างประกาศงานควรจำกัด HR ในการใช้งานจริง)

6.1 Health

- GET `/health` → 200 `{ "status": "ok" }`

6.2 Dev Seed (มีเงื่อนไข: ทำงานเฉพาะโหมด `debug`)

- POST `/api/dev/seed`  
  - สร้างข้อมูลตัวอย่าง: Users (hr/hm/candidate), Jobs, Applications, Timelines (submitted/screening/interview), Notes/Evaluations บางส่วน  
  - หาก `gin.Mode() != gin.DebugMode` → 403

- POST `/api/dev/seed_more`  
  - สร้างผู้สมัครจำลองจำนวนมาก + กระจายใบสมัครหลายรายการต่อคน  
  - เงื่อนไขโหมดเดียวกันกับด้านบน

- POST `/api/dev/seed_more_fill`  
  - เติม Timeline/Notes/Evaluations ให้ applications ที่มาจาก seed ให้ครบถ้วนมากขึ้น  
  - เงื่อนไขโหมดเดียวกันกับด้านบน

6.3 Authentication

- POST `/api/auth/register`  
  - Body: `{ email, password, name, role }` (`role` หนึ่งใน `candidate|hr|hm`)  
  - สร้างผู้ใช้ใหม่ (hash password ด้วย bcrypt) → 201 `{ ok, user }` (ยังไม่คืน token)  
  - หมายเหตุ: ฝั่ง FE จะทำ auto-login ต่อทันทีด้วยอีเมล/รหัสผ่านชุดเดียวกัน

- POST `/api/auth/login`  
  - Body: `{ email, password }`  
  - ตรวจสอบ credential, ออก JWT (HS256) claims: `sub` (user id), `role`, `exp` (24h), `iat` → 200 `{ ok, token, user }`

- GET `/api/auth/me` (Auth)  
  - คืนข้อมูลผู้ใช้จาก `user_id` ใน JWT → 200 `{ ok, user }`

6.4 Job Postings

- GET `/api/jobs`  
  - Query: `status` (optional: `active|closed|draft`)  
  - คืน `{ ok, jobs: [...] }` เรียง `posted_date desc`

- GET `/api/jobs/:id`  
  - คืน `{ ok, job }` หรือ 404 ถ้าไม่พบ

- POST `/api/jobs` (Auth, ใช้งานจริงควรกำหนดให้ HR เท่านั้น)  
  - Body: `{ title, department, location, experience_level, description, requirements, responsibilities, status, closing_date }`  
  - สร้างงานใหม่ กำหนด `CreatedBy` จาก `user_id` ใน JWT, `PostedDate=now()`  
  - คืน 201 `{ ok, job }`

- PUT `/api/jobs/:id` (Auth)  
  - Body: ฟิลด์เดียวกับ Create (เลือกส่งเฉพาะที่จะแก้ไขได้)  
  - คืน `{ ok, job }`

- DELETE `/api/jobs/:id` (Auth)  
  - คืน `{ ok: true }`

6.5 Applications

- POST `/api/applications` (Auth)  
  - Body: `{ job_id, applicant_id?, resume, cover_letter, education, experience, skills }`  
  - นโยบาย:  
    - Candidate ปกติไม่ต้องส่ง `applicant_id` ระบบจะใช้ `user_id` จาก JWT  
    - หากส่ง `applicant_id` มาและผู้ขอไม่ใช่ HR → 403  
    - บังคับใช้กฎธุรกิจ (ดูหัวข้อ 7) เช่น ห้ามมีใบสมัครคงค้างเกิน 5 ฉบับ/ผู้สมัคร, ห้ามสมัครซ้ำตำแหน่งเดิมระหว่างรอผล, บังคับช่วงรอสมัครใหม่กรณีถูกปฏิเสธ (3 หรือ 6 เดือน)  
  - สถานะเริ่มต้น: `submitted` + บันทึก `SubmittedDate`  
  - คืน 201 `{ ok, application }` หรือ error พร้อมข้อความอธิบาย (ไทย)

- GET `/api/applications` (Auth)  
  - การเข้าถึง:  
    - Candidate เห็นเฉพาะของตนเอง (ระบบกรองด้วย `user_id`)  
    - HR/HM เห็นทั้งหมด และสามารถกรองด้วย query ได้  
  - Query รองรับ:  
    - `page` (เริ่ม 1), `limit` (ค่าเริ่มต้น 20, สูงสุด 200)  
    - `cursor` (RFC3339) → keyset pagination โดยใช้ `submitted_date < cursor`  
    - `job_id`, `applicant_id` (ยกเว้น candidate), `status`, `q` (ค้นหาใน cover_letter/education/experience/skills)  
    - `include_details=true` เพื่อให้ BE รวมข้อมูลประกอบ (job/applicant/timeline/notes/evaluation + meta) มาในรายการ  
    - `skip_count=true` เพื่อไม่ให้คำนวณยอดรวมทั้งหมด (ช่วยลดภาระ DB เมื่อ page แบบต่อเนื่อง)  
  - รูปแบบตอบกลับ:  
    - ปกติ: `{ ok, page, limit, total, apps: [Application] }`  
    - เมื่อ `include_details=true`: `{ ok, page, limit, total, apps: [ { application, meta, raw? } ] }`  
      - `meta` มีฟิลด์สำคัญ: `can_reapply` (bool), `can_reapply_date` (datetime), `waiting_months` (int), `rejection_stage` (`screening|interview`), `job_title|job_department|job_location`

- GET `/api/applications/:id` (Auth)  
  - คืนรายละเอียดแบบรวม: `{ ok, application, job?, applicant?, timeline:[], notes:[], evaluation? }`  
  - หาก role เป็น Candidate จะบังคับว่า `application.ApplicantID` ต้องเป็นของตนเอง มิฉะนั้น 403

- PATCH `/api/applications/:id/status` (Auth; ใช้งานจริงควรกำหนด HR เท่านั้น)  
  - Body: `{ status, description? }`  
  - เมื่อเปลี่ยนสถานะระบบจะสร้าง `ApplicationTimeline` ใหม่อัตโนมัติ  
  - ข้อจำกัด: หากจะเปลี่ยนเป็น `offer` หรือ `hired` ต้องมี Evaluation จาก HM แล้ว มิฉะนั้น 400 พร้อมข้อความอธิบาย

6.6 Notes

- POST `/api/applications/:id/notes` (Auth; HR/HM)  
  - Body: `{ content, author? }`  
  - ระบบกำหนด `CreatedBy` จาก JWT และเติม `Author` จากชื่อผู้ใช้โดยอัตโนมัติหากไม่ส่งมา  
  - คืน 201 `{ ok, note }`

- GET `/api/applications/:id/notes` (Auth)  
  - คืน `{ ok, notes: [...] }` เรียงล่าสุดก่อน

6.7 Evaluation (การประเมินโดย HM)

- POST `/api/applications/:id/evaluation` (Auth; HM/HR)  
  - Body: `{ technical_skills, communication, problem_solving, cultural_fit, strengths?, weaknesses?, comments?, overall_score? }`  
  - เงื่อนไข: สร้าง/อัปเดตได้เฉพาะเมื่อสถานะใบสมัครเป็น `interview`/`offer`/`hired`  
  - หาก `overall_score` ไม่ส่งมา ระบบคำนวณเป็นค่าเฉลี่ย 4 ด้านโดยอัตโนมัติ  
  - บังคับ 1:1 ต่อ Application (ถ้ามีอยู่แล้วจะอัปเดตแทน)  
  - คืน 201/200 พร้อม `{ ok, evaluation }`

- GET `/api/applications/:id/evaluation` (Auth)  
  - คืน 200 `{ ok, evaluation }` หรือ 404 หากยังไม่มีการประเมิน

6.8 Notifications (การรวมเหตุการณ์เพื่อทำ Badge/Feed)

- GET `/api/notifications/aggregate?user_id=&limit=50` (Auth)  
  - รวมรายการจาก Timeline/Evaluation เป็น feed เดียว  
  - ถ้าระบุ `user_id` จะกรองให้เหลือเฉพาะของผู้สมัครคนนั้น  
  - คืน `{ ok, notifications: [ { id, type, title, message, payload, timestamp } ] }`  
  - `type` เช่น `info` (timeline), `success` (evaluation)

6.9 Uploads (Resume)

- POST `/api/uploads/resume` (Auth; multipart/form-data)  
  - Field: `file`  
  - เก็บไฟล์ลง `be_clean/uploads/resumes/` ชื่อไฟล์เป็น UUID + ต้นฉบับ  
  - ตอบกลับ: `{ ok, filename, url, size, uploaded }`  
  - หมายเหตุ: ในโค้ดปัจจุบันไม่มี static file server เสิร์ฟ `/uploads/...` โดยตรง การใช้งานจริงควรตั้ง Static/Reverse Proxy หรือเก็บลง Object Storage แล้วให้ URL สาธารณะ

---

## 7) กฎธุรกิจ (Business Rules) และนโยบาย

กฎที่สำคัญซึ่งบังคับใช้โดยฝั่ง Backend:

1) จำกัดจำนวนใบสมัครคงค้างของผู้สมัคร (ไม่นับ `rejected`/`hired`) ไม่เกิน 5 ฉบับ  
2) ห้ามสมัครซ้ำตำแหน่งเดิมถ้าใบสมัครก่อนหน้ายังไม่สิ้นสุด (ไม่ใช่ `rejected/withdrawn/hired`)  
3) กรณีถูกปฏิเสธ (rejected): ต้องรอระยะเวลาก่อนสมัครใหม่  
   - หากถูกปฏิเสธช่วง Screening → รอ 3 เดือน  
   - หากเคยมี `interview` ก่อนถูกปฏิเสธ → รอ 6 เดือน  
   - ระบบคำนวณ `allowedAt` และคืน `meta.can_reapply`/`meta.can_reapply_date` ในการ list (เมื่อ `include_details=true`)  
4) เปลี่ยนสถานะเป็น `offer`/`hired` ต้องมี Evaluation จาก HM ก่อน (ระบบตรวจที่ PATCH status)  
5) สร้าง Timeline อัตโนมัติทุกครั้งที่เปลี่ยนสถานะ (พร้อม Description ที่ส่งมา)  
6) GET รายการ Applications ของ Candidate จะถูกจำกัดเฉพาะใบสมัครของตนเองเสมอ (บังคับโดย JWT)

---

## 8) ความปลอดภัย (Auth/JWT/RBAC/CORS/Password Hash)

- การยืนยันตัวตน: JWT (HS256)  
  - Claims: `sub` (user id), `role` (`candidate|hr|hm`), `exp` (24 ชม.), `iat`  
  - เก็บ Token ด้าน FE ใน `localStorage` คีย์ `auth_token` (เก็บ `user_data` แยกต่างหาก)  

- การกำหนดสิทธิ์ (RBAC):  
  - ใช้ Middleware ผูก `user_role` ไว้ใน Gin Context  
  - ตัวอย่างข้อจำกัด: Candidate เห็นเฉพาะใบสมัครตัวเอง, เปลี่ยนสถานะ/สร้างงานควรให้ HR/HM เท่านั้น (ฝั่งโค้ดตัวอย่างใช้ Auth บังคับ และตรวจในจุดสำคัญ เช่น PATCH status)  

- CORS:  
  - AllowOrigins: `http://localhost:5173`, `http://localhost:3000` และยอมรับ localhost อื่น ๆ ผ่าน `AllowOriginFunc`  
  - AllowMethods: GET, POST, PUT, PATCH, DELETE, OPTIONS  
  - AllowHeaders: Authorization, Content-Type  
  - AllowCredentials: true  
  - MaxAge: 12 ชั่วโมง

- Password Hash: ใช้ `bcrypt` (ผ่าน `utils/password.go`)

คำแนะนำ Production: จัดเก็บ `JWT_SECRET` ใน Secret Manager/ENV ของระบบจริง และจำกัด Allowed Origins เฉพาะโดเมนโปรดักชัน

---

## 9) การอัปโหลดไฟล์ (Resume)

- Endpoint: `POST /api/uploads/resume`  
- รองรับ multipart/form-data (field `file`)  
- จัดเก็บไฟล์ลงโฟลเดอร์ `be_clean/uploads/resumes/`  
- ตอบกลับ URL รูปแบบ `/uploads/resumes/<filename>` (ต้องมี static server/proxy ภายนอก หรือให้ FE จัดการดาวน์โหลดผ่าน BE/Storage อื่น)

ข้อควรทราบ: ปัจจุบันยังไม่กำหนดการจำกัดขนาดไฟล์/ชนิดไฟล์ หรือสแกนไวรัส ควรกำหนดในโปรดักชัน

---

## 10) การแจ้งเตือนและการรวมเหตุการณ์ (Aggregate Notifications)

- Endpoint: `GET /api/notifications/aggregate?user_id=&limit=`  
- รวมเหตุการณ์ล่าสุดจาก Timeline และ Evaluation  
- ใช้ใน FE เพื่อแสดง badge/ฟีดแจ้งเตือน และนับ unread โดยเทียบกับรายการที่ผู้ใช้เคยอ่าน (เก็บคีย์ `notifs_read_<uid>` ใน localStorage)

รูปแบบ Notification:  
`{ id: string, type: "info"|"success", title: string, message: string, payload?: object, timestamp: number }`

---

## 11) Frontend UI/UX (ทุกบทบาทและแต่ละหน้า)

สรุปการนำทางหลัก (ไม่มี React Router): ควบคุมผ่าน `src/App.jsx` ด้วย state `currentPage`, `currentUser`  
หลัง Login → สลับหน้าอัตโนมัติตามบทบาท: Candidate → Jobs, HR → HR Dashboard, HM → HM Dashboard

11.1 หน้าส่วนกลาง (Shared)

- LandingPage: แนะนำระบบ ปุ่ม Login/Register/Learn more  
- LoginPage: ฟอร์มเข้าสู่ระบบ (เรียก `/auth/login`) เก็บ token/user ลง localStorage  
- AboutSystemPage: บรรยายภาพรวม, ปุ่มเริ่มต้น  
- NotificationsPage: แสดงผลการแจ้งเตือนรวม (เรียก `/notifications/aggregate`)  
- EmailTestPage: สำหรับทดสอบเทมเพลตอีเมล (Mock)

11.2 ผู้สมัคร (Candidate)

- JobsListPage:  
  - โหลดงานจาก `/jobs`  
  - ตัวกรอง: คำค้นหา, location, department, experienceLevel  
  - การเรียง: ตามวันที่โพสต์/ชื่อ/กำลังจะปิดรับ  
  - ปุ่ม Apply → นำไปหน้า ApplyPage

- ApplyPage:  
  - โหลดรายละเอียดงานจาก `/jobs/:id`  
  - อัปโหลดเรซูเม่ (หากเลือกไฟล์) → `/uploads/resume` แล้วนำ URL มาประกอบ  
  - ส่งใบสมัคร `/applications` พร้อม `education/skills` เป็นต้น  
  - แสดง dialog สำเร็จ และนำไป Track Status

- TrackStatusPage:  
  - โหลดรายการใบสมัครของผู้ใช้ (ผ่าน `/applications` ที่ฝั่ง BE จะกรองด้วย JWT)  
  - เลือกแต่ละใบสมัครเพื่อดู Timeline/Notes/รายละเอียดงาน/ข้อมูลการติดต่อ  
  - อ่านจำนวนแจ้งเตือน (aggregate) และนับ unread ผ่าน localStorage

- ProfilePage: ดู/แก้ไขข้อมูลพื้นฐานใน UI (การอัปเดตจริงควรมี endpoint แก้ไขผู้ใช้ในอนาคต)

11.3 ฝ่ายบุคคล (HR)

- HRDashboardPage:  
  - ใช้ hook `useRecruitmentData({ includeDetails: true })` เพื่อโหลด Applications/Jobs/Details  
  - สรุปตัวเลข: จำนวนใบสมัคร, งานที่เปิดรับ, คิวรอตรวจ, ข้อเสนอ (offers)  
  - รายการล่าสุด (ผู้สมัคร/งาน/สถานะ/วันที่)

- HRApplicantsPage:  
  - แสดงใบสมัครทั้งหมด (พร้อมตัวกรอง/แบ่งหน้า)  
  - เลือกเพื่อดูรายละเอียดเชิงลึก (ApplicantDetailsPage)

- ApplicantDetailsPage:  
  - โหลด `/applications/:id` → ได้ application + job + applicant + timeline + notes + evaluation  
  - HR สามารถเพิ่มหมายเหตุ (POST notes) หรือเปลี่ยนสถานะ (PATCH status)

- JobManagementPage:  
  - จัดการประกาศงาน: สร้าง/แก้ไข/ลบ/เปลี่ยนสถานะ (เรียก `/jobs` series)  
  - ฟิลด์ `requirements/responsibilities` กรอกแบบบรรทัดละรายการ แล้วแปลงเป็น JSON string ก่อนส่ง BE

11.4 ผู้จัดการสายงาน (HM)

- HMDashboardPage:  
  - แสดงสถิติการประเมิน/รายการรอรีวิว  
- HMReviewPage:  
  - แสดงคิวใบสมัครที่รอ HM Review  
- HMEvaluationPage:  
  - ฟอร์มให้คะแนน 4 ด้าน + ข้อคิดเห็น (เรียก `/applications/:id/evaluation`)  
  - หลังมี Evaluation แล้ว HR จึงจะเปลี่ยนสถานะใบสมัครเป็น `offer`/`hired` ได้

UI/UX: ใช้ Tailwind + shadcn/ui ให้สไตล์สม่ำเสมอ รองรับ Responsive

---

## 12) Services ฝั่ง Frontend และ Storage/State

12.1 API Base (`src/services/api.js`)

- ตั้งค่า Axios instance ด้วย `baseURL=VITE_API_URL` และ `timeout`  
- Request interceptor: แนบ `Authorization: Bearer <token>` ถ้ามี  
- Response interceptor:  
  - คืนเฉพาะ `response.data`  
  - หาก 401 → เคลียร์ token/user_data และ redirect ไป `/login` (กรณีเคยล็อกอินมาก่อน)

12.2 Auth Service (`authService.js`)

- `register()` เรียก `/auth/register` แล้ว auto-login ต่อ (เก็บ token/user_data)  
- `login()` เรียก `/auth/login` เก็บ token/user_data  
- `getCurrentUser()` เรียก `/auth/me` และ sync user_data  
- `logout()` เคลียร์ localStorage + redirect  
- helper: `isAuthenticated()`, `getUserRole()`, `isCandidate/isHR/isHM`

12.3 Job Service (`jobService.js`)

- โหลดรายการ/รายละเอียดงาน + สร้าง/แก้ไข/ลบ/ค้นหา  
- แปลงข้อมูลงานจากรูปแบบ BE → FE (`adaptJobFromBE`)

12.4 Application Service (`applicationService.js`)

- โหลดรายการ/รายละเอียดใบสมัคร + สร้างใบสมัคร + เปลี่ยนสถานะ + เพิ่มโน้ต + สร้าง Evaluation  
- ใช้โดยหน้า Track/HR/HM

12.5 Notification Service (`notificationService.js`)

- เรียก `/notifications/aggregate` เพื่อสร้าง feed สำหรับ badge/กล่องแจ้งเตือน

12.6 Storage/State

- Token/User: เก็บใน `localStorage` (`auth_token`, `user_data`)  
- Notifications read: `notifs_read_<uid>`

---

## 13) การ Seed/ทดสอบข้อมูล (Dev Utilities)

- Endpoint seed ทั้งหมดอยู่ใน `handlers/dev.go` และจะทำงานเฉพาะ `gin.DebugMode` เท่านั้น  
- หากต้องการ seed ด้วย endpoint เหล่านี้ ให้ตั้ง `GIN_MODE=debug` ชั่วคราวแล้วเรียก:  
  - `POST /api/dev/seed`  
  - `POST /api/dev/seed_more`  
  - `POST /api/dev/seed_more_fill`

คำแนะนำ: ในเครื่องสำหรับทีมพัฒนา ให้ใช้ Docker Compose เปิด Postgres แล้ว seed เพื่อมีข้อมูลจำลองครบทั้ง Users/Jobs/Applications/Timeline/Notes/Evaluations

---

## 14) การ Deploy ด้วย Docker Compose

ฐานข้อมูล (Postgres) อยู่ใน `be_clean/docker-compose.yml`:

- Image: `postgres:16`  
- Database: `aats_db`  
- User/Password: `aats_user` / `aats_password`  
- Ports: แมปเป็น `5433:5432` บนเครื่องโฮสต์  
- ใช้ named volume `pgdata` สำหรับเก็บข้อมูลอย่างปลอดภัย

ขั้นตอนตัวอย่าง:

1) `docker-compose up -d` ในโฟลเดอร์ `be_clean/`  
2) ตั้งค่า `be_clean/.env` ให้ `DATABASE_URL` ชี้ไป `localhost:5433`  
3) รัน `go run main.go` เพื่อเปิด API บนพอร์ต `:8080`  
4) Build/Deploy Frontend (กำหนด `VITE_API_URL` ให้ชี้ API จริง)

---

## 15) แนวทางตรวจสอบและแก้ปัญหา (Troubleshooting)

- 401 Unauthorized:  
  - ตรวจ `Authorization: Bearer <token>`  
  - ตรวจ `JWT_SECRET` ฝั่ง BE และ token หมดอายุหรือไม่  
- 500/DB Error:  
  - ตรวจ `DATABASE_URL` ให้ถูกต้อง (host/port/user/password/db/sslmode)  
  - แน่ใจว่า Postgres ขึ้นและ port 5433 ว่าง  
- CORS Blocked:  
  - เพิ่ม origin ของ FE ใน `middleware/base.go` หรือกำหนดผ่าน reverse proxy  
- อัปโหลดเรซูเม่แล้วเปิด URL ไม่ได้:  
  - ตั้ง Static/Proxy ให้เสิร์ฟ `be_clean/uploads/resumes/*` หรือโยกไป Object Storage พร้อม URL สาธารณะ  
- Seed ไม่ทำงาน:  
  - ตรวจว่า `GIN_MODE=debug` ก่อนเรียก endpoint seed

---

## 16) ข้อจำกัดปัจจุบันและแนวทางพัฒนาต่อ

ข้อจำกัด (ตามโค้ดปัจจุบัน):

- ไม่มี WebSocket/Realtime จริง การแจ้งเตือนใช้การดึงรวม (aggregate) แบบดึงข้อมูลรอบ ๆ  
- ยังไม่มีระบบ Audit Log/Monitoring/Tracing  
- การเสิร์ฟไฟล์อัปโหลดยังไม่พร้อมใช้ในโปรดักชัน (ควรกำหนด Static/Proxy หรือ S3/Blob)  
- Validation เชิงลึก (เช่น ชนิด/ขนาดไฟล์เรซูเม่) ยังไม่ครอบคลุม  
- สิทธิ์การใช้งาน (เช่น จำกัด POST/PUT/DELETE บางเส้นทางเฉพาะ HR) ควรเข้มงวดขึ้นด้วย Role Middleware ที่ route level

แนวทางพัฒนาต่อ:

- เพิ่มระบบ Notification แบบ Push (WebSocket/Server-Sent Events/Push Service)  
- เสริม Audit Log + Error Tracking + Metrics Dashboard  
- แยก Static/File Storage ออกจาก BE ไปใช้บริการ Cloud (S3/Cloud Storage)  
- เพิ่ม Integration Email จริง (เช่น SendGrid/AWS SES) แทน Mock ฝั่ง FE  
- เพิ่ม Automated Tests (Unit/Integration/E2E)  
- เสริม Policy/Permission ที่ชัดเจนยิ่งขึ้นในแต่ละ endpoint

---

## 17) ภาคผนวก: ตัวอย่าง JSON และรหัสข้อผิดพลาด

ตัวอย่าง Login (Request/Response):

Request:

```json
POST /api/auth/login
{
  "email": "candidate1@aats.com",
  "password": "cand1234"
}
```

Response:

```json
200 OK
{
  "ok": true,
  "token": "<JWT>",
  "user": { "id": "uuid", "email": "candidate1@aats.com", "role": "candidate", "name": "สมชาย ผู้สมัคร" }
}
```

ตัวอย่างสร้างใบสมัคร (มีอัปโหลดเรซูเม่ก่อน):

```json
POST /api/uploads/resume (multipart/form-data)
-> { "ok": true, "url": "/uploads/resumes/<uuid>_resume.pdf" }

POST /api/applications
{
  "job_id": "<job-uuid>",
  "resume": "/uploads/resumes/<uuid>_resume.pdf",
  "cover_letter": "ยินดีร่วมงานกับบริษัท",
  "education": "{\"degree\":\"ป.ตรี\",\"institution\":\"มหาวิทยาลัยตัวอย่าง\"}",
  "experience": "{\"position\":\"Intern\",\"company\":\"TestCo\",\"duration\":\"1 ปี\"}",
  "skills": "[\"React\",\"TypeScript\"]"
}
```

ตัวอย่างเปลี่ยนสถานะ (ต้องมี Evaluation ก่อนสำหรับ `offer/hired`):

```json
PATCH /api/applications/<id>/status
{
  "status": "offer",
  "description": "ผ่านสัมภาษณ์และเสนอข้อเสนอ"
}
```

ตัวอย่างสร้าง Evaluation (HM):

```json
POST /api/applications/<id>/evaluation
{
  "technical_skills": 4,
  "communication": 4,
  "problem_solving": 3,
  "cultural_fit": 4,
  "strengths": "พื้นฐานแน่น",
  "weaknesses": "ประสบการณ์โปรดักชันยังน้อย",
  "comments": "โดยรวมดี",
  "overall_score": 3.75
}
```

รูปแบบข้อผิดพลาดโดยทั่วไป:

- 400: `{ "error": "invalid body" }`, `{ "error": "คุณมีใบสมัครคงค้าง..." }`  
- 401: `{ "error": "missing/invalid authorization header" }`  
- 403: `{ "error": "forbidden" }`  
- 404: `{ "error": "job/application/evaluation not found" }`  
- 409: `{ "error": "email already registered" }`  
- 500: `{ "error": "cannot ..." }` (DB/Server error)

---

สรุป: เอกสารฉบับนี้ครอบคลุมทุกองค์ประกอบของระบบตามซอร์สโค้ดปัจจุบัน ทั้งโครงสร้าง สคีมา ฐานข้อมูล Endpoint ทุกตัว กฎธุรกิจ ความปลอดภัย การอัปโหลดไฟล์ กระบวนการแจ้งเตือน UI/UX ของทั้งสามบทบาท ตลอดจนการตั้งค่าและการดีพลอย เมื่อใช้งานตามนี้จะสามารถพัฒนา/ทดสอบ/ดีพลอย/แก้ปัญหาได้อย่างครบถ้วนในโปรเจกต์นี้

