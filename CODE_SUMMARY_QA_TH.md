## สรุประบบโค้ด (Q&A) — ภาษาไทย

นี่เป็นเอกสารสรุประบบของโปรเจค AATS-System ในรูปแบบคำถาม-คำตอบ (Q&A) เพื่อให้สามารถอ่านและตอบคำถามเกี่ยวกับโค้ดได้ครบทั้งระบบ backend และ frontend

---

### Backend — ภาพรวมคืออะไร?

- คำตอบ: โฟลเดอร์ `be_clean/` เป็น backend ซึ่งเขียนด้วยภาษา Go ใช้ Gin เป็น web framework, GORM เป็น ORM, และรองรับฐานข้อมูล Postgres (หรือ fallback เป็น SQLite)

### ไฟล์สำคัญมีอะไรบ้างและทำหน้าที่อะไร?

- `be_clean/main.go` — จุดเริ่มต้นของแอพ. โหลด `.env`, init DB, ตั้งค่า middleware, และลงทะเบียน route ต่างๆ (`/health`, `/api/...`) แล้วรัน server
- `be_clean/config/config.go` — โหลดการตั้งค่าจาก environment variables (PORT, DATABASE_URL, JWT_SECRET) เป็น struct `Config`
- `be_clean/models/models.go` — นิยามโมเดลหลัก (User, Job, Application, Note, HMEvaluation, ApplicationTimeline) และฟังก์ชัน `InitDB` เพื่อเชื่อมต่อ DB, สร้างตาราง และตรวจ/สร้าง indices
- `be_clean/handlers/handlers.go` — ตัวจัดการ (handlers) ของ HTTP endpoints สำคัญ เช่น Register, Login, Me, ListUsers, ListJobs, ApplyJob, AddNote, AddEvaluation, Mock endpoints สำหรับ FE
- `be_clean/middleware/` — มี middleware สำหรับ auth, logging, common middleware (ไฟล์ตัวอย่างใน repo: `auth.go`, `base.go`) เพื่อจัดการ JWT authentication และการป้องกัน route ตาม role
- `be_clean/utils/pagination.go` — helper สำหรับ parse pagination params (ใช้ใน ListUsers เป็นต้น)

### Backend รันอย่างไร?

- ขั้นตอนพื้นฐาน:
  1) ตั้ง environment variables หรือสร้างไฟล์ `.env` (ตัวอย่างค่าที่สำคัญด้านล่าง)
  2) รัน `go run main.go` หรือใช้ `make` ในกรณีที่มี `Makefile` (มีไฟล์ Makefile ในโฟลเดอร์)

- ตัวแปรสำคัญ (ENV):
  - `PORT` (default: `8081`)
  - `DATABASE_URL` (Postgres DSN) — ถ้าเว้นว่างจะใช้ SQLite ไฟล์ `be_clean.db`
  - `JWT_SECRET` (ใช้สร้าง/ตรวจ JWT, default อยู่ที่ `dev-secret` หากไม่ได้ตั้ง)

### Backend มี endpoints อะไรบ้าง (สรุปสำคัญ)?

- /health, /healthz [GET]
  - ใช้ตรวจสถานะ service, คืนค่า `{status: "ok"}`

- /api/auth/register [POST]
  - ลงทะเบียนผู้ใช้ใหม่ รับ `{email, password, name}`
  - สร้าง user, returns `{token, user: {email,name}}`

- /api/auth/login [POST]
  - เข้าสู่ระบบด้วย `{email,password}` คืน token และ user data

- /api/auth/me [GET]
  - ต้องมี JWT (middleware.AuthRequired) คืนข้อมูลผู้ใช้จาก token

- /api/users [GET]
  - ต้อง auth, คืนรายการผู้ใช้แบบ pagination และรองรับ query `q` สำหรับค้นหา

- /api/jobs [GET]
  - แสดงรายการงาน (public)
- /api/jobs/:id [GET]
  - แสดงรายละเอียดงาน

- /api/mock/jobs, /api/mock/applications [GET]
  - mock endpoints สำหรับ frontend development

- /api/applications [POST]
  - สมัครงาน (ต้อง auth)

- /api/applications/my [GET]
  - คืนรายการ application ของผู้ใช้งานที่ auth

- /api/applications/:id/status [PUT]
  - เปลี่ยนสถานะ application (ต้องมี role `hr`)

- /api/applications/:id/notes [POST]
  - เพิ่ม note ใน application (ต้องมี role `hr` หรือ `hm`)

- /api/applications/:id/evaluations [POST]
  - เพิ่ม HM evaluation (ต้องมี role `hm`)

### Authentication / Authorization ทำอย่างไร?

- ใช้ JWT ที่เซ็นด้วย `JWT_SECRET` (HS256)
- Token มี claims: `email`, `role`, `exp`
- Middleware `AuthRequired()` ตรวจความถูกต้องของ JWT และเซ็ตค่า `email` ใน context
- Middleware `RequireRole("hr", "hm")` ตรวจ role ของผู้ใช้ก่อนอนุญาต

### Database behavior และ migrations เป็นแบบไหน?

- `models.InitDB` พยายามเชื่อมต่อ Postgres ถ้ามี `DATABASE_URL` หากไม่สำเร็จจะ fallback ไปใช้ SQLite
- ใช้ GORM migrator API เพื่อเช็คว่ามีตาราง/คอลัมน์หรือไม่ หากไม่มีจะสร้างขึ้นแบบ idempotent
- สร้าง unique index `idx_applications_user_job` บน (user_id, job_id) เพื่อป้องกันการสมัครซ้ำ

### Edge cases / ข้อควรระวังใน backend?

- หาก DB ปิด หรือ DSN ผิด จะ fallback เป็น SQLite — ควรชัดเจนว่าต้องการพฤติกรรมนี้หรือไม่
- Secret `JWT_SECRET` หากไม่ถูกตั้งค่า จะใช้ `dev-secret` ซึ่งไม่ปลอดภัยใน production
- การลงทะเบียนตรวจ `user exists` โดยค้นหา email; มีการลบแถวที่มี `id = ""` ก่อน create (เป็น pattern ป้องกัน row residue)
- password ถูกเก็บเป็น bcrypt hash — ดีแล้ว แต่ต้องแน่ใจว่า transport ใช้ HTTPS ใน production

---

### Frontend — ภาพรวมคืออะไร?

- คำตอบ: โฟลเดอร์ `fe/` เป็น frontend SPA เขียนด้วย React (JSX) ใช้ Vite เป็น bundler, TailwindCSS สำหรับ styling, และ axios สำหรับเรียก API

### ไฟล์สำคัญที่อ่านแล้วมีอะไร?

- `fe/package.json` — แสดง dependencies และสคริปต์ (`dev`, `build`, `preview`, `lint`)
- `fe/src/services/api.js` — สร้าง axios instance ที่ชี้ไปยัง `VITE_API_URL` หรือ `http://localhost:8081/api`, ใส่ token จาก `localStorage` ใน header, และ interceptor ที่ทำ redirect ไปหน้า `/login` เมื่อได้รับ 401

### Frontend รันอย่างไร?

- คำสั่งพื้นฐาน:
  - ติดตั้ง dependencies: `npm ci` (หรือ `npm install`)
  - ระหว่างการพัฒนา: `npm run dev` (Vite)
  - build: `npm run build`

### วิธีการเชื่อมต่อกับ backend?

- ค่า base URL ของ API มาจาก `import.meta.env.VITE_API_URL` ถ้าไม่ถูกตั้งจะ fallback ไปที่ `http://localhost:8081/api`
- JWT token เก็บใน `localStorage` key: `auth_token`
- axios response interceptor จะ return `response.data` เสมอ ดังนั้น service ที่เรียก API คาดว่าจะได้ payload ตรงๆ

### Edge cases / ข้อควรระวังใน frontend?

- การเก็บ JWT ใน localStorage มีความเสี่ยง XSS — พิจารณาใช้ HttpOnly cookie ถ้าต้องการความปลอดภัยสูง
- axios interceptor ทำ redirect เมื่อ 401 โดยตั้ง `window.location.href = '/login'` — ใน SPA ควรใช้ router navigation แทนถ้าใช้ react-router (แต่ redirect โดยตรงก็โอเคสำหรับการใช้งานง่าย)

---

### คำถามที่คนมักจะถาม — Q&A แบบพร้อมตอบ (ไทย)

Q: วิธีตั้งค่า environment สำหรับรัน backend ในเครื่องพัฒนาควรมีอะไรบ้าง?

A: อย่างน้อยต้องมี:
- `PORT` — (เช่น `8081`) หากไม่ระบุจะใช้ 8081
- `DATABASE_URL` — เช่น `postgres://user:pass@localhost:5432/dbname` (ถ้าไม่ใส่จะใช้ SQLite `be_clean.db`)
- `JWT_SECRET` — ควรตั้งเป็นสตริงยาวและปลอดภัยสำหรับ production (ถ้าไม่ตั้งจะใช้ `dev-secret`)

Q: ถ้าเรียก `/api/auth/me` ได้ 401 ต้องตรวจอะไร?

A: ตรวจว่า token ถูกเก็บใน localStorage (`auth_token`) และว่า header Authorization ถูกส่ง: `Authorization: Bearer <token>` โดย server ตรวจ JWT secret ว่าตรงกับ `JWT_SECRET` ที่ตั้งใน env ด้วย

Q: จะป้องกันการสมัครซ้ำได้อย่างไร?

A: DB มี unique index บน email (User.Email) และยังมี unique index บน applications(user_id, job_id) เพื่อป้องกันสมัครซ้ำ แต่ควรจับ error จาก DB เมื่อมีการละเมิด unique constraint และส่ง error message ที่เหมาะสม

Q: จะเพิ่ม role ใหม่ (เช่น `admin`) ต้องแก้ส่วนไหน?

A: หลัก ๆ ต้อง:
- อัปเดต logicใน backend (handlers และ middleware.RequireRole) ให้ยอมรับ role ใหม่
- ปรับ UI ใน frontend ที่แสดง/ซ่อนปุ่มตาม role
- อัปเดต seed data ถ้ามีการสร้าง user ตัวอย่าง

Q: ถ้าอยากเปลี่ยน storage ของ token ให้ปลอดภัยขึ้นควรทำอย่างไร?

A: แนะนำใช้ HttpOnly Secure SameSite cookie เพื่อป้องกัน XSS ทำให้ JavaScript ในหน้าเว็บอ่าน cookie ไม่ได้ และใช้ CSRF protection (หรือใช้ double submit cookie pattern) เพื่อป้องกัน CSRF

Q: การ migrate schema จะทำยังไง?

A: ปัจจุบัน `InitDB` ใช้วิธี migrator to create tables แบบ idempotent ไม่ได้ใช้ AutoMigrate อย่างเต็มรูปแบบ เพื่อความปลอดภัยใน production ควรใช้ migration tool เฉพาะ (เช่น golang-migrate) เพื่อจัดการ schema change และ rollback

Q: มี mock endpoints ให้ไหมสำหรับ frontend dev?

A: มี: `/api/mock/jobs` และ `/api/mock/applications` คืนข้อมูลจากไฟล์ `public/mock_jobs.json` และ `public/mock_applications.json` (หรือ handler ที่กำหนด) เพื่อใช้ในการพัฒนา FE โดยไม่ต้องมี DB หรือ account จริง

---

### ข้อเสนอแนะสั้น ๆ (Practical suggestions)

- ตั้ง `JWT_SECRET` ใน environment สำหรับ production และไม่ใช้ค่า default
- พิจารณาแยกการตั้งค่า DB สำหรับ development/production และเอกสารค่า env ให้ชัด
- เปลี่ยนการเก็บ token จาก localStorage เป็น HttpOnly cookie หากต้องการความปลอดภัยสูง
- เพิ่ม migration pipeline เช่น `golang-migrate` และเก็บไฟล์ migration ใน repo
- เพิ่ม tests (unit + integration / e2e) สำหรับ endpoints สำคัญเช่น auth และ application workflow

---

ไฟล์นี้สร้างขึ้นเพื่อเป็นจุดเริ่มต้นสำหรับการเข้าใจโค้ดทั้งหมดและตอบคำถามเกี่ยวกับส่วนต่าง ๆ ของระบบ

ผมได้เพิ่มรายละเอียดเชิงปฏิบัติสำหรับการรัน backend, การตั้งค่า DB, ตัวอย่าง request/response และคำแนะนำการดีบักในหัวข้อด้านล่าง — อ่านและทดลองตามคำสั่ง PowerShell ที่ให้ไว้เพื่อตรวจหาปัญหาและแก้ไขได้เร็วขึ้น

---

## การรันและการตั้งค่าสำหรับ Backend (ละเอียด)

### ตัวอย่างไฟล์ `.env` (dev)

สร้างไฟล์ `.env` ในโฟลเดอร์ `be_clean/` หรือเซ็ต environment ใน PowerShell ดังนี้ (ตัวอย่างค่า):

DATABASE_URL=postgres://aats_user:aats_pass@localhost:5432/aats_db?sslmode=disable
PORT=8081
JWT_SECRET=your-dev-jwt-secret

หมายเหตุ: หากไม่ตั้ง `DATABASE_URL` ระบบจะ fallback ไปใช้ SQLite ไฟล์ `be_clean.db` แทน

### คำสั่ง PowerShell เพื่อรัน backend (โฟลเดอร์ `be_clean`)

เปิด PowerShell แล้วสั่ง (อยู่ใน root ของ repository หรือระบุ path):

```powershell
# ไปที่โฟลเดอร์ backend
Set-Location 'C:\Users\TOR\Desktop\AATS-System\be_clean'

# เซ็ต env ชั่วคราวและรัน (Postgres)
$env:PORT='8081'; $env:DATABASE_URL='postgres://aats_user:aats_pass@localhost:5432/aats_db?sslmode=disable'; $env:JWT_SECRET='dev-secret'; go run .\main.go

# ถ้าต้องการใช้ SQLite (fallback)
$env:PORT='8081'; Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue; $env:JWT_SECRET='dev-secret'; go run .\main.go
```

ถ้าต้องการหยุด server ให้กด Ctrl+C

### รัน backend ผ่าน Docker (ถ้ามี docker-compose ของ backend)

ถ้า repository มีไฟล์ `be_clean/docker-compose.yml` หรือ root มี docker-compose ที่ config postgres + app, ให้ใช้คำสั่ง:

```powershell
Set-Location 'C:\Users\TOR\Desktop\AATS-System\be_clean'
docker compose up --build
```

(คำสั่งนี้ต้องติดตั้ง Docker Desktop และเปิดใช้งาน docker compose)

---

## การตั้งค่า Database

1) Postgres (แนะนำสำหรับ dev & prod):

- สร้าง database และ user ก่อน เช่น (ตัวอย่างใช้ psql):
  - CREATE USER aats_user WITH PASSWORD 'aats_pass';
  - CREATE DATABASE aats_db OWNER aats_user;

- ตั้งค่า `DATABASE_URL` ให้ชี้ไปยัง DSN เช่น `postgres://user:pass@localhost:5432/aats_db?sslmode=disable`

2) SQLite (fallback):

- ถ้า `DATABASE_URL` ไม่ถูกตั้ง ระบบจะสร้างและใช้ไฟล์ `be_clean.db` ในโฟลเดอร์ `be_clean/` โดยอัตโนมัติ

หมายเหตุการ migration: `models.InitDB` จะตรวจและสร้างตาราง/คอลัมน์แบบ idempotent ในการเริ่มครั้งแรก แต่สำหรับ production ควรใช้ migration tool เฉพาะ เช่น `golang-migrate` เพื่อรองรับการเปลี่ยน schema อย่างปลอดภัย

---

## ตัวอย่าง request/response (ทดสอบด้วย PowerShell)

1) Register

```powershell
Invoke-RestMethod -Method Post -Uri 'http://localhost:8081/api/auth/register' -ContentType 'application/json' -Body '{"email":"alice@example.com","password":"secret123","name":"Alice"}'
```

ตัวอย่าง response (200/201):

{
  "token": "<jwt-token>",
  "user": {"email":"alice@example.com","name":"Alice"}
}

2) Login

```powershell
Invoke-RestMethod -Method Post -Uri 'http://localhost:8081/api/auth/login' -ContentType 'application/json' -Body '{"email":"alice@example.com","password":"secret123"}'
```

เก็บ token ตัวอย่างวิธีเก็บในตัวแปร PowerShell:

```powershell
$login = Invoke-RestMethod -Method Post -Uri 'http://localhost:8081/api/auth/login' -ContentType 'application/json' -Body '{"email":"alice@example.com","password":"secret123"}'
$token = $login.token
```

3) Me (ตรวจ token)

```powershell
Invoke-RestMethod -Method Get -Uri 'http://localhost:8081/api/auth/me' -Headers @{ Authorization = "Bearer $token" }
```

ตัวอย่าง response:

{
  "data": {"email":"alice@example.com","name":"Alice","role":"candidate"}
}

4) List jobs (public)

```powershell
Invoke-RestMethod -Method Get -Uri 'http://localhost:8081/api/jobs'
```

5) Apply job (ต้อง auth)

```powershell
Invoke-RestMethod -Method Post -Uri 'http://localhost:8081/api/applications' -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body '{"job_id":"<job-id>","resume_url":"https://example.com/resume.pdf"}'
```

ตัวอย่าง response:

{
  "id": "...",
  "user_id": "...",
  "job_id": "...",
  "status": "applied",
  "created_at": "..."
}

---

## คำแนะนำการดีบักเมื่อ BE ไม่ทำงาน

1) ดู logs ที่ console เมื่อรัน `go run main.go` — `models.InitDB` จะพิมพ์ dialector ที่ใช้ (postgres หรือ sqlite) และข้อความการสร้างตาราง

2) ปัญหา JWT 401:
- ตรวจว่า `JWT_SECRET` ใน environment ของ server ตรงกับค่าที่ใช้ตอนสร้าง token (ถ้ใช้ FE เก่า token อาจถูกเซ็นด้วย secret อื่น)

3) ปัญหา DB connection:
- หากใช้ Postgres ให้ตรวจว่า service รันอยู่และ DSN ถูกต้อง
- ทดสอบด้วย `psql` หรือเครื่องมือ DB client เพื่อตรวจว่า connect ได้

4) ตรวจสอบไฟล์ SQLite:

```powershell
Get-ChildItem -Path . -Filter 'be_clean.db' -Recurse
```

ถ้ามีไฟล์แสดงว่า fallback ทำงาน แต่ข้อมูลอาจเป็น state เดิมของ dev

5) ข้อผิดพลาด unique index (สมัครซ้ำ):
- ถ้าพบข้อผิดพลาดจาก DB ว่าละเมิด unique constraint ให้จับและ return error ที่เหมาะสมใน handler หรือให้ FE แสดงข้อความว่า "คุณได้สมัครตำแหน่งนี้แล้ว"

6) เพิ่ม logging ชั่วคราวใน handler ส่วนที่สงสัยเพื่อดูค่า incoming payload หรือ error messages ก่อนส่ง response

---

## การทดสอบ (Postman / curl)

- หากใช้ curl บน Windows (หรือ Git Bash):

```bash
curl -X POST http://localhost:8081/api/auth/login -H "Content-Type: application/json" -d '{"email":"alice@example.com","password":"secret123"}'
```

- หรือสร้าง Postman collection ที่มี endpoints: register, login, me, jobs, applications

---

## ปัญหาทั่วไปที่มักพบและวิธีแก้

- Server ไม่ขึ้น: ตรวจว่า Go ถูกติดตั้ง และ `go run` ทำงาน, อ่าน error trace ที่ console
- DB ติดปัญหา connection: ตรวจ DSN, port, user/password และว่า DB service ฟัง port ดังกล่าว
- 401 unauthorized: ตรวจ token, header `Authorization: Bearer <token>`, และ `JWT_SECRET`
- Missing migrations: `InitDB` จะสร้างตาราง แต่ถ้ามี schema change ที่ซับซ้อนให้ใช้ migration tool

---

## Checklist สำหรับทำให้ BEทำงานได้ (ขั้นตอนแนะนำ)

1) ตั้งค่า Postgres local หรือใช้ SQLite สำหรับ dev
2) ตั้ง `JWT_SECRET` ใน environment ให้เหมาะสม
3) รัน `go run .` ใน `be_clean` และดู logs ว่ามีการสร้างตารางหรือ error ใดๆ
4) ใช้ PowerShell `Invoke-RestMethod` ตัวอย่างด้านบนเพื่อลอง register -> login -> me
5) หากเกิด error ที่ไม่เข้าใจ ให้คัดลอก error log มาส่งให้ผมได้ ผมจะช่วยวิเคราะห์

---

## ถัดไปที่ผมช่วยได้

ผมได้เพิ่มเนื้อหาเชิงปฏิบัติลงในไฟล์นี้เรียบร้อยแล้ว ถ้าต้องการผมจะ:

- เพิ่มตัวอย่าง request/response แบบเต็มสำหรับทุก endpoint
- สร้างไฟล์ `BACKEND_RUNBOOK.md` ที่มีขั้นตอนทีละขั้นแบบภาพรวมการตั้งค่าเครื่องพัฒนา
- สร้าง script PowerShell อัตโนมัติสำหรับเซ็ต env และรัน backend (ตัวอย่าง `run-backend.ps1`)

บอกผมว่าต้องการส่วนเพิ่มเติมใดต่อเลยครับ — ถ้าตอนนี้ BE ยังไม่ขึ้น ให้ส่ง error log จาก console ของการรัน `go run` มา ผมจะช่วยวิเคราะห์แบบทีละบรรทัด

---

## อธิบายระบบเชิงลึก (per-file / per-module)

ต่อไปนี้เป็นคำอธิบายว่าแต่ละไฟล์หรือโฟลเดอร์ทำอะไร และข้อมูลเดินทางอย่างไร (data flow) ระหว่างชิ้นส่วนต่างๆ

- `be_clean/main.go`
  - ทำหน้าที่ bootstrap แอพ: โหลด `.env` ผ่าน `godotenv`, โหลด config (`config.Load()`), ติดตั้ง DB โดยเรียก `models.InitDB`, สร้าง Gin router, ผูก middleware, ลงทะเบียน routes (health, api group) แล้วเรียก `r.Run(":" + port)` เพื่อเริ่มรับ HTTP

- `be_clean/config/config.go`
  - อ่าน environment variables: `PORT`, `DATABASE_URL`, `JWT_SECRET` และคืน struct `Config` ให้ `main.go` ใช้

- `be_clean/models/models.go`
  - นิยามโมเดลข้อมูลหลัก: `User`, `Job`, `Application`, `ApplicationTimeline`, `Note`, `HMEvaluation`
  - ฟังก์ชัน `InitDB(dsn string)` พยายามเชื่อมต่อ Postgres (ถ้ามี DSN) ถ้าไม่สำเร็จจะใช้ SQLite เป็น fallback
  - ใช้ GORM migrator เพื่อตรวจและสร้างตาราง/คอลัมน์/indices แบบ idempotent
  - มี hook `BeforeCreate` เพื่อกำหนด UUID ให้ primary key

- `be_clean/handlers/handlers.go`
  - รับผิดชอบ logic ของ HTTP endpoints หลัก เช่น register/login/me/list users/jobs/applications/notes/evaluations
  - ทำงานร่วมกับ `models.DB` (GORM) เพื่อ query/insert/update records
  - ทำ hashing รหัสผ่านด้วย bcrypt ก่อนบันทึก
  - สร้าง JWT ด้วย `JWT_SECRET` ผ่านฟังก์ชัน `generateTokenWithRole`

- `be_clean/middleware/auth.go` (และ `base.go`)
  - `AuthRequired()` middleware: ตรวจ Authorization header, ตรวจ JWT signature, ดึงค่า `email` และ `role` ลงใน context
  - `RequireRole(...)` middleware: ตรวจว่า role ตรงกับรายการที่อนุญาตก่อนให้เข้าถึง route

- `be_clean/utils/pagination.go`
  - ช่วย parse query params เช่น `page`, `limit`, `offset` และคืนค่าให้ handlers ใช้ในการ query

Data flow (แบบสั้น):
1. Client (FE) ส่ง HTTP request -> Backend (Gin router)
2. Middleware อ่าน JWT (ถ้ามี) และเติม context
3. Handler ตรวจ input (Gin binding), เรียก GORM ผ่าน `models.DB` เพื่ออ่าน/เขียนข้อมูล
4. Handler คืน JSON response ให้ FE (หรือ error)

## สถานะปัจจุบันของระบบ (จาก repo ที่มี)

- Frontend (`fe/`) ใช้งานได้ (คุณรัน `npm ci` แล้ว) — สามารถ `npm run dev` เพื่อดูหน้าเว็บได้ (ขึ้นอยู่กับการตั้ง VITE_API_URL ว่าเชื่อมกับ BE ที่ไหน)
- Backend (`be_clean/`) มีซอร์สครบถ้วน แต่ในเครื่องของคุณตอนนี้ BE ยังไม่ขึ้น (ตามที่กล่าว) — สาเหตุทั่วไปคือยังไม่ได้ตั้งค่า `DATABASE_URL` ให้เชื่อมกับ Postgres, JWT_SECRET ไม่ตั้ง, หรือเกิด error ขณะ `InitDB` (เช่น permission, missing driver)

ถ้าตอนนี้ไม่มี BE ทำงาน FE จะใช้ mock endpoints (`/api/mock/jobs`, `/api/mock/applications`) หรือ data mocked ใน FE เพื่อให้หน้าเว็บแสดงผลบางส่วนได้ — แต่ฟีเจอร์ที่ต้องเรียก BE จริง (สมัครงาน, ดู profile, งานที่ต้อง auth) จะไม่ทำงาน

## แผนปฏิบัติการ (ทำทีละขั้น) เพื่อให้ BE ขึ้นได้

ขั้นตอนที่แนะนำ (ลำดับ):

1) ตรวจ environment และ dependencies
   - ติดตั้ง Go (เวอร์ชัน 1.20+ แนะนำ) และตรวจ `go env`
   - ตรวจว่า PostgreSQL รันอยู่ถ้าต้องการใช้ Postgres

2) ตั้งค่า `.env` หรือเซ็ต env vars ชั่วคราว (ตัวอย่าง):
   - `DATABASE_URL=postgres://aats_user:aats_pass@localhost:5432/aats_db?sslmode=disable`
   - `PORT=8081`
   - `JWT_SECRET=dev-secret`

3) ลองรัน backend ในโหมด verbose:
   - `Set-Location 'C:\Users\TOR\Desktop\AATS-System\be_clean'`
   - `go run .` แล้วสังเกต logs: จะบอกว่าพยายามเชื่อมต่อ DB แบบไหน และปัญหาเกิดตรงไหน

4) ถ้า DB connect ผิดพลาด:
   - ตรวจ DSN, port, username/password
   - ทดสอบ `psql` หรือ `pg_isready`

5) ถ้า `InitDB` ใช้ SQLite (fallback) และคุณต้องการ Postgres ให้ลบ `DATABASE_URL` ที่ว่างหรือแก้ค่าให้ถูกต้อง

6) ทดสอบ endpoints พื้นฐานด้วย `Invoke-RestMethod` (Register, Login, Me)

7) ถ้ายัง error ให้เก็บ console log ของ server (stack trace) แล้วส่งมาให้ผม ผมจะวิเคราะห์ทีละบรรทัด

---

## สร้างสคริปต์ PowerShell ช่วยรัน backend (ผมเพิ่มไฟล์ให้แล้ว)

ผมได้เพิ่มไฟล์ `be_clean/run-backend.ps1` ที่จะ:
- โหลด `.env` ถ้ามี (โดยอ่านแต่ละบรรทัด `KEY=VALUE` แล้วเซ็ตเป็น environment variable)
- ตั้งค่า env ชั่วคราวบน session และรัน `go run .`

ไฟล์: `be_clean/run-backend.ps1` (ถูกสร้างใน repo) — ใช้งานแบบ:

```powershell
Set-Location 'C:\Users\TOR\Desktop\AATS-System\be_clean'
.\run-backend.ps1
```

สคริปต์จะพยายามอ่านไฟล์ `.env` ในโฟลเดอร์ `be_clean` (ถ้ามี) แล้วเซ็ต env vars ให้ session ปัจจุบันก่อนรัน `go run .` — ถ้าต้องการผมสามารถปรับให้รับพารามิเตอร์เช่น `-UseSqlite` หรือ `-Dsn '...'` ได้

---

ผมได้แก้เอกสารและเพิ่มไฟล์สคริปต์เรียบร้อยแล้ว (ถ้าต้องการผมจะส่งเนื้อหาของ `run-backend.ps1` ให้ดูหรือปรับแต่งเพิ่มเติม) — ต่อไปอยากให้ผมช่วยอะไรต่อ? เช่น ให้ผมรัน `go run` ใน environment ของคุณ (คุณต้อง copy/paste logs มา) หรือต้องการให้ผมเพิ่มตัวอย่าง request/response แบบสมบูรณ์ทั้งหมดในไฟล์เอกสารนี้


