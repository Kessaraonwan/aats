# AATS - Applicant Tracking System (เอกสารฉบับเต็ม)

เอกสารนี้เป็นคู่มือครบถ้วนสำหรับโปรเจกต์ AATS (Applicant Tracking System) — รวมสถาปัตยกรรม, การติดตั้ง, การพัฒนา, การใช้งาน, นโยบายทางธุรกิจ, สคริปต์แก้ไขข้อมูล, การสำรองและการกู้คืน, การดีบัก และ FAQ ที่ละเอียดจนอ่านแล้วไม่ต้องถามต่อ

หมายเหตุ: เอกสารนี้เขียนโดยอิงจากโค้ดใน repo ณ วันที่เอกสารนี้ และรวมขั้นตอน/สคริปต์ที่ใช้จริงในโฟลเดอร์ `scripts/`

---

## สรุปภาพรวมสั้น ๆ
- Backend: Go (Gin) + GORM + PostgreSQL
- Frontend: React + Vite + TailwindCSS + shadcn/ui
- DB: PostgreSQL (containerized via docker-compose)
- โครงสร้างสิทธิ์: 3 roles — candidate, hr, hm
- สถานะ application: submitted, screening, interview, offer, rejected, hired

---

## เนื้อหาในเอกสารนี้ (หัวข้อหลัก)
1. Architecture & โครงสร้างโฟลเดอร์
2. Environment & prerequisites
3. การรันโปรเจกต์ (Dev / Docker / Production)
4. Database schema — ตารางสำคัญ และฟิลด์ที่ต้องรู้
5. API & Frontend contract (shape ของข้อมูลที่ FE คาดหวัง)
6. Business rules (กติกาทางธุรกิจที่บังคับในระบบ)
7. สคริปต์ที่ใช้แก้ข้อมูล (preview, warn, promote, revert) — รายละเอียดและวิธีใช้
8. การสำรองและการกู้คืน (pg_dump, pg_restore)
9. Troubleshooting — ปัญหาพบบ่อย และการแก้ไข
10. Security & operational notes
11. FAQ ที่ละเอียดครบถ้วน

---

## 1) Architecture & โครงสร้างโฟลเดอร์

โครงสร้างย่อของโปรเจกต์ (path relative to repository root):

```
AATS-System/
├─ be_clean/                # Backend (Go + Gin)
│  ├─ handlers/             # HTTP handlers (API endpoints)
│  ├─ middleware/           # Auth, roles, base middleware
│  ├─ models/               # GORM models (Application, Evaluation, Timeline, User, Note)
│  ├─ utils/                # helpers (password hashing, pagination)
│  ├─ main.go               # server entrypoint
│  └─ Dockerfile
├─ fe/                      # Frontend (React + Vite)
│  ├─ src/
│  │  ├─ components/        # UI components (including HR components)
│  │  ├─ pages/             # Pages (HR pages, HM pages, candidate pages)
│  │  └─ services/          # API client wrappers
│  └─ package.json
├─ scripts/                 # SQL / PowerShell utilities for diagnostics & fixes
├─ docker-compose.yml       # local dev stack: postgres (+ optional other services)
└─ README.md
```

อ่านไฟล์สำคัญเพิ่มเติม:
- `be_clean/models/models.go` — โครงสร้างข้อมูลที่ใช้งานจริง
- `fe/src/components/hr/ApplicantsTable.jsx` — ตาราง HR ที่แสดงผู้สมัคร (มี logic ซ่อนรายการ inconsistent)
- `scripts/preview_diagnostics.sql` — คำสั่ง SELECT เพื่อ preview ปัญหาข้อมูล
- `scripts/promote_apps.sql` — transactional script สำหรับ promote รวดเดียว
- `scripts/run_promote.ps1` — PowerShell helper เพื่อสำรองและรัน promote ภายใน container

---

## 2) Environment & prerequisites

สิ่งที่ต้องมีก่อนเริ่มพัฒนา (เครื่อง dev):
- Git
- Docker & docker-compose (recommended)
- Go 1.20+ (ที่ใช้จริงในโครงการเป็น Go 1.21 แต่ 1.20+ มักใช้ได้)
- Node.js 18+ (สำหรับ frontend)

ตามค่าเริ่มต้น docker-compose จะตั้งค่า PostgreSQL:
- DB name: `aats_db`
- DB user: `aats_user`
- DB password: `aats_password`
- host port: 5433 (container ภายในเป็น 5432) — ตรวจสอบใน `be_clean/docker-compose.yml` หรือ root `docker-compose.yml`

การตั้งค่า environment ของ backend อยู่ใน `be_clean/.env` (DATABASE_URL ฯลฯ)

---

## 3) การรันโปรเจกต์

แบบพัฒนา (ไม่ใช้ Docker):
- Backend
  1. เข้าโฟลเดอร์ `be_clean`
  2. สร้าง `.env` โดยคัดลอกจากตัวอย่าง และตั้ง `DATABASE_URL` ให้ตรงกับ DB ของคุณ
  3. `go mod tidy`
  4. `go run main.go` (หรือใช้ `air` หรือ `reflex` ถ้าต้องการ hot reload)

- Frontend
  1. เข้าโฟลเดอร์ `fe`
  2. `npm install`
  3. `npm run dev`

แบบใช้ Docker (แนะนำสำหรับ dev ที่ไม่อยากติดตั้ง DB บนโฮสต์):
1. `docker-compose up -d`
2. backend และ frontend อาจต้องเชื่อมกับ environment. ใช้ `docker-compose logs -f` เพื่อตรวจสอบ

หมายเหตุ: ถ้ารันแล้ว `Invoke-RestMethod http://localhost:8080/health` ส่ง error ให้ตรวจสอบ logs ของ `be_clean` container หรือ `go run` output (ดูปัญหาเช่น: DB connection, missing migrations)

---

## 4) Database schema — ตารางสำคัญ

สำคัญ: schema ถูกกำหนดโดย GORM ใน `be_clean/models/models.go`. ตารางและคอลัมน์สำคัญ:

- `users` (User)
  - id (PK), email (unique), role (candidate|hr|hm), name, phone, department, position

- `job_postings` (JobPosting)
  - id, title, department, status, posted_date, closing_date, created_by

- `applications` (Application)
  - id, job_id, applicant_id, resume, cover_letter, status (submitted|screening|interview|offer|rejected|hired), submitted_date, created_at, updated_at

- `application_timelines` (ApplicationTimeline)
  - id, application_id, status, date, description, created_at

- `evaluations` (Evaluation)
  - id, application_id (uniqueIndex — 1:1), evaluator_id, evaluator_name, technical_skills, overall_score, evaluated_at

- `notes` (Note)
  - id, application_id, author, created_by, content, created_at

ข้อสำคัญ: `evaluations.application_id` ถูกตั้ง uniqueIndex ในโมเดล — ระบบออกแบบให้มีการประเมิน 1 ครั้งต่อ application (1:1). ถ้าต้องการ multiple evaluations ต้องเปลี่ยน schema และโค้ดที่เกี่ยวข้อง

---

## 5) API & Frontend contract

สรุป shape ที่ FE คาดหวังจาก `useRecruitmentData`/`/api/...` (ตัวอย่าง field สำคัญ):

Application object (ที่ FE ใช้):

{
  id: string,
  jobId: string,
  status: string, // submitted|screening|interview|offer|rejected|hired
  submittedDate: string (ISO),
  jobTitle: string,
  candidateName: string,
  candidateEmail: string,
  candidatePhone: string,
  evaluation?: { overallScore: number },
  preScreeningScore?: number // 0-100, ถ้ามี
}

การแสดงคะแนนใน FE:
- ถ้า application status เป็น `interview` หรือมากกว่า (offer/hired) FE จะอนุญาตให้แสดงคะแนน HM (overallScore) ถ้ามี
- ถ้าไม่มี evaluation แต่มี preScreeningScore (0-100) จะ convert เป็น 0-5 scale โดย /20

สำคัญ: FE ตอนนี้มี safeguard — จะแสดงแถว `offer` / `hired` ที่ไม่มี HM eval เป็นค่า default *ซ่อน* เพื่อไม่ให้ HR งง (มี toggle ให้เปิดดู)

---

## 6) Business rules (กติกาทางธุรกิจ ที่ระบบบังคับ)

นี่เป็นกฎที่ implemented ใน backend/handlers และถูกออกแบบเพื่อความถูกต้องของกระบวนการ:

1. HR cannot set Offer/Hired unless HM has evaluated
   - Server-side guard: handlers จะตรวจสอบ presence ของ Evaluation ก่อนอนุญาตเปลี่ยนสถานะเป็น `offer` หรือ `hired` ผ่าน API (หากพยายามจะถูกปฏิเสธ)

2. Evaluation is 1:1 per Application
   - `evaluations.application_id` เป็น unique — ถ้าต้องการ multi-evaluation ให้เปลี่ยน schema

3. Timelines are deduped by (application_id, status, day)
   - Seeder และสคริปต์ต่าง ๆ จะไม่เพิ่ม timeline เดิมซ้ำภายในวันเดียวกัน

4. UI behavior
   - HM scores are hidden until the application reaches `interview` status (or later)
   - HR list page hides inconsistent offer/hired without HM eval by default

5. Seeder idempotency
   - `be_clean/handlers/dev.go` มี seeder แบบ idempotent (FirstOrCreate / Assign) เพื่อให้รันซ้ำได้โดยไม่ซ้ำข้อมูล

---

## 7) สคริปต์แก้ไขข้อมูล (รายละเอียด / วิธีใช้)

โฟลเดอร์ `scripts/` มีชุดสคริปต์ที่ผมเตรียมไว้เพื่อช่วยตรวจสอบและแก้ไขข้อมูลที่ไม่สอดคล้องกันอย่างปลอดภัย:

- `preview_diagnostics.sql` (read-only)
  - คำสั่ง SELECT-only เพื่อดู
    - Applications that have evaluation but status in `submitted`/`screening`
    - Applications in `offer`/`hired` without evaluation
    - Counts and example timelines
  - วิธีรัน (ถ้าคุณไม่มี psql บนโฮสต์ ให้ใช้ docker):

```powershell
docker cp .\scripts\preview_diagnostics.sql aats-postgres:/tmp/preview_diagnostics.sql
docker exec -i aats-postgres psql -U aats_user -d aats_db -f /tmp/preview_diagnostics.sql
```

- `promote_apps.sql` (transactional)
  - ทำงาน: หาทุก application ที่มี evaluation แต่สถานะยังเป็น `submitted`/`screening` แล้วทำการ
    - UPDATE status → `interview`
    - INSERT timeline `interview` (deduped by day)
  - ใช้กรณีต้องการทำ mass-correction ให้ข้อมูลย้อนกลับสอดคล้องกับ business rule
  - ควรสำรอง DB ก่อนรัน (ดู `run_promote.ps1`)

- `run_promote.ps1` (PowerShell helper)
  - ทำการ pg_dump (inside container), copy backup to host, copy promote sql to container, run promote
  - มี interactive confirmation (ต้องพิมพ์ YES)

ขั้นตอนปลอดภัย (recommended)

1) ตรวจสอบ (preview) — รัน `preview_diagnostics.sql` ที่เตรียมไว้ เพื่อดูว่ามีกี่แถวที่จะถูกกระทบ

PowerShell (Windows, ใช้ docker exec):

```powershell
docker cp .\scripts\preview_diagnostics.sql aats-postgres:/tmp/preview_diagnostics.sql
docker exec -i aats-postgres psql -U aats_user -d aats_db -f /tmp/preview_diagnostics.sql
```

หรือ Bash/macOS/Linux:

```bash
docker cp ./scripts/preview_diagnostics.sql aats-postgres:/tmp/preview_diagnostics.sql
docker exec -i aats-postgres psql -U aats_user -d aats_db -f /tmp/preview_diagnostics.sql
```

2) สำรองฐานข้อมูล (pg_dump) — สำคัญมาก ให้ทำก่อนทุกการแก้ไขแบบ destructive

PowerShell (Windows):

```powershell
# สร้าง backup inside container
docker exec -i aats-postgres pg_dump -U aats_user -d aats_db -F c -f /tmp/backup_before_action.dump
# คัดลอกสำรองออกมาไว้ที่โฮสต์
docker cp aats-postgres:/tmp/backup_before_action.dump .\scripts\backup_before_action.dump
```

Bash/macOS/Linux:

```bash
docker exec -i aats-postgres pg_dump -U aats_user -d aats_db -F c -f /tmp/backup_before_action.dump
docker cp aats-postgres:/tmp/backup_before_action.dump ./scripts/backup_before_action.dump
```

คำอธิบาย:
- `-F c` ให้ได้ไฟล์แบบ custom ที่ `pg_restore` รองรับ
- เก็บไฟล์ `./scripts/backup_before_action.dump` ไว้ปลอดภัย (off-host ถ้าเป็น production)

3) รันสคริปต์แก้ไข (ตัวอย่าง: `promote_apps.sql`)

PowerShell ตัวอย่างใช้ `run_promote.ps1` ที่เตรียมไว้ (interactive confirm):

```powershell
cd AATS-System
.\scripts\run_promote.ps1
```

หรือถ้าต้องการรันไฟล์ SQL ด้วยตัวเอง (docker + psql):

```powershell
docker cp .\scripts\promote_apps.sql aats-postgres:/tmp/promote_apps.sql
docker exec -i aats-postgres psql -U aats_user -d aats_db -f /tmp/promote_apps.sql
```

หรือ Bash/macOS/Linux:

```bash
docker cp ./scripts/promote_apps.sql aats-postgres:/tmp/promote_apps.sql
docker exec -i aats-postgres psql -U aats_user -d aats_db -f /tmp/promote_apps.sql
```

4) ตรวจสอบผลลัพธ์ (verify)

หลังรันสคริปต์ ให้ตรวจสอบ count / timeline / ตัวอย่าง rows:

```powershell
# จำนวน rows ที่เป็น interview (หรือเปรียบเทียบก่อน-หลัง)
docker exec -i aats-postgres psql -U aats_user -d aats_db -c "SELECT count(*) FROM applications WHERE status='interview';"

# ตัวอย่าง timeline ของแอปที่เพิ่งถูกโปรโมต (เปลี่ยน application_id ตามจริง)
docker exec -i aats-postgres psql -U aats_user -d aats_db -c "SELECT * FROM application_timelines WHERE application_id = '<app-id>' ORDER BY date DESC LIMIT 50;"
```

5) ถ้าต้องการย้อน (restore) จาก backup

PowerShell (restore via pg_restore inside container):

```powershell
# คัดลอกไฟล์สำรองกลับเข้า container (ถ้าไม่ได้อยู่ใน container อยู่แล้ว)
docker cp .\scripts\backup_before_action.dump aats-postgres:/tmp/backup_before_action.dump

# Restore (ตัวเลือก -c = clean/drop existing objects ก่อน restore)
docker exec -i aats-postgres pg_restore -U aats_user -d aats_db -c /tmp/backup_before_action.dump
```

หรือ Bash/macOS/Linux:

```bash
docker cp ./scripts/backup_before_action.dump aats-postgres:/tmp/backup_before_action.dump
docker exec -i aats-postgres pg_restore -U aats_user -d aats_db -c /tmp/backup_before_action.dump
```

คำเตือนและข้อสังเกต
- หากฐานข้อมูลใหญ่ `pg_restore` อาจใช้เวลานาน และอาจเกิดการขัดข้องของทรัพยากรบน container
- บางครั้งต้องหยุดบริการอื่น ๆ ก่อน restore เพื่อหลีกเลี่ยง race condition
- การใช้ `-c` (clean) จะลบข้อมูล/object ปัจจุบันและเขียนทับด้วย backup — ระวัง
- ถ้า DB ถูกตั้งค่าให้ไม่อนุญาต `CREATE EXTENSION`, สคริปต์ที่เรียก `CREATE EXTENSION IF NOT EXISTS pgcrypto;` อาจล้มเหลว — ให้ผู้ดูแล DB รันคำสั่งนี้ด้วยสิทธิ์ที่เหมาะสม

ตัวอย่าง workflow สั้น ๆ (Safe Flow):
1. รัน `preview_diagnostics.sql` → ดูผล
2. สร้าง backup (pg_dump) และเก็บไฟล์ไว้ (./scripts/backup_before_action.dump)
3. รัน `run_promote.ps1` (หรือ runc the SQL directly) เพื่อแก้ข้อมูล
4. ตรวจสอบผลด้วย SELECTs เช่น count / timelines
5. ถ้ามีปัญหา ให้ restore ด้วย `pg_restore`

---
---

## 8) การสำรองและการกู้คืน (backup/restore)

แนะนำ workflow ก่อนทำการแก้ไขใด ๆ ที่เป็น destructive:
1. `pg_dump` แบบ custom format (มี schema + data):

```powershell
docker exec -i aats-postgres pg_dump -U aats_user -d aats_db -F c -f /tmp/backup_before_action.dump
docker cp aats-postgres:/tmp/backup_before_action.dump .\scripts\backup_before_action.dump
```

2. ทำการรันสคริปต์แก้ไข
3. ถ้าจำเป็น ให้ restore ด้วย `pg_restore -c` (clean)

หมายเหตุ: สำรองไฟล์ไว้หลาย ๆ รุ่นตามขั้นตอน (timestamped) และอย่าลบไฟล์สำรองจนแน่ใจว่าข้อมูลถูกต้อง

---

## 9) Troubleshooting — ปัญหาพบบ่อย และวิธีแก้

ปัญหา: `psql : The term 'psql' is not recognized` (บน Windows)
- สาเหตุ: psql ไม่ได้ติดตั้งบน host
- แก้: ใช้ `docker exec` เพื่อรัน psql ภายใน container (ตัวอย่างด้านบน)

ปัญหา: FE หรือ BE ไม่เริ่ม (exit code 1)
- ตรวจสอบ logs:
  - FE: เปิด terminal ที่ `fe` แล้ว `npm run dev` — ดู error output
  - BE: `go run main.go` หรือดู container logs ถ้าใช้ docker-compose
- สาเหตุที่พบบ่อย: missing env var (DATABASE_URL), DB not running, migration/schema mismatch

ปัญหา: หน้า HR แสดงว่า "รับเข้าทำงานแล้ว" แต่ผู้ใช้งานบอกว่าไม่มีการประเมิน
- อธิบาย: ผู้สมัครหนึ่งคนอาจมีหลาย applications — หน้าที่แสดงรายละเอียดอาจเปิดแอปที่เก่ากว่าซึ่งมีสถานะ `hired`
- การแก้: FE จะซ่อน inconsistent offer/hired ที่ไม่พบ eval โดย default (toggle มีให้เปิดดู)

ปัญหา: ต้องการ mass-fix แต่กลัวผลกระทบ
- คำแนะนำ: รัน `preview_diagnostics.sql` ก่อน เสร็จแล้วสำรอง DB แล้วรันสคริปต์ใน transaction

---

## 10) Security & operational notes

- อย่าใช้ seeder (dev endpoints) ใน production — dev endpoints ถูกปิดนอก `gin.DebugMode()`
- หากรัน `CREATE EXTENSION pgcrypto` ต้องแน่ใจว่ามีสิทธิ์เพียงพอ
- เก็บไฟล์สำรองไว้นอกเครื่อง (s3 / vault) ถ้าข้อมูลเป็น production
- logs: อย่าเก็บ secrets ใน logs

---

## 11) FAQ (ละเอียดจนไม่ต้องถามต่อ)

Q: ทำไมผู้สมัครหนึ่งคนมีหลายสถานะได้?
A: เพราะ status ถูกผูกกับ `application` (การสมัครงานแต่ละตำแหน่ง/รอบ) — ผู้สมัคร 1 คนสามารถสมัครหลายตำแหน่งหรือหลายรอบได้

Q: สถานะทั้งหมดมีอะไรบ้าง และความหมาย?
A:
- submitted — ผู้สมัครส่งใบสมัครเรียบร้อย
- screening — HR กำลังตรวจสอบ/คัดกรอง
- interview — นัดสัมภาษณ์/กำลังสัมภาษณ์
- offer — ได้รับการเสนอเงื่อนไขงาน (ยังไม่รับหรือปฏิเสธ)
- rejected — ไม่ผ่านการคัดเลือก
- hired — รับเข้าทำงานแล้ว (จบ flow)

Q: ทำไมมีแอปเป็น `offer` แต่ไม่มี HM evaluation?
A: มีหลายสาเหตุเป็นไปได้:
  1) HR เปลี่ยนสถานะผิดขั้นตอน (ระบบเดิมก่อนมี guard)
  2) มี HM evaluation แต่บันทึกหาย (data loss / manual deletion)
  3) แอปนั้นถูกโปรโมตจากสคริปต์เดิมโดยอัตโนมัติ (เช่น admin run mass-promotion)

Q: ต้องการแก้ให้ถูกต้องแบบอัตโนมัติ ทำได้ไหม?
A: ได้ — มี 2 แนวทางหลัก:
  - เติม evaluations ให้กับแอปที่ missing (ถ้ามีข้อมูลคะแนนจากที่อื่น)
  - ย้อนสถานะ `offer` → `interview` สำหรับแอปที่ไม่มี evaluation (และใส่ timeline แจ้งเตือน)
  - ทั้งสองแบบควรทำหลัง backup และหลังตรวจสอบ sample rows

Q: มีเครื่องมือช่วย preview ก่อนแก้ไหม?
A: ใช่ — `scripts/preview_diagnostics.sql` และตัวอย่างคำสั่ง `docker exec ... psql -f` ที่ใช้รัน preview

Q: ต้องการให้ HR มองไม่เห็นรายการ inconsistent ในหน้า applicants — ระบบทำได้ไหม?
A: ได้แล้ว — FE ถูกแก้ให้ซ่อนแถว `offer`/`hired` ที่ไม่มี HM evaluation โดย default (มี toggle ให้โชว์)

Q: จะกู้คืนข้อมูลจาก backup อย่างไร?
A: ใช้ `pg_restore -c` กับไฟล์ `.dump` ที่ได้จาก `pg_dump -F c` (ตัวอย่างอยู่ในเอกสารสคริปต์)

Q: ผมเป็น HR แต่บางครั้งเห็นสถานะไม่ตรงกับที่คุยกับ HM — ควรทำอย่างไร?
A: ตรวจสอบ timeline ของ application เพื่อดู sequence ของ events (`application_timelines`). ถ้ายังไม่ชัดให้ติดต่อ HM/ดู audit logs ถ้ามี

Q: มีการบังคับว่าต้องมี HM evaluation ก่อน HR จะ Offer/Hire ไหม?
A: มีการบังคับฝั่ง server — API จะ validate ถ้าไม่มี HM evaluation จะไม่อนุญาตให้เปลี่ยนสถานะเป็น offer/hired (แจ้ง error)

---

## จุดติดต่อ (ถ้าต้องการความช่วยเหลือเพิ่มเติม)
- ถ้าต้องการผมช่วยรันสคริปต์ promote/revert ให้ — แจ้งให้ผมทราบว่าต้องการแบบไหน (promote auto → interview for eval-present; หรือ revert offer→interview for missing eval)
- หากต้องการตัวช่วยเติม evaluation ตัวอย่าง (dummy) บอกคะแนนและข้อความที่ต้องการให้ผมใส่ ผมจะเตรียมสคริปต์ให้

---

เอกสารนี้ครอบคลุมทั้งภาพรวมเชิงสถาปัตยกรรม รายละเอียด schema การทำงาน การรัน การแก้ปัญหา และสคริปต์ที่ต้องใช้จริง หากต้องการผมสามารถ:
- เพิ่มตัวอย่าง `pg_restore` แบบละเอียดพร้อมคำสั่ง Windows PowerShell
- สร้าง script เพิ่มเติม เช่น `revert_offer_to_interview.sql` และ `run_revert.ps1` (transactional) พร้อมกับการทดสอบเบื้องต้น

บอกผมว่าต้องการไฟล์/สคริปต์เสริมอะไรเพิ่มเติม แล้วผมจะสร้างให้พร้อมขั้นตอนการทดสอบ

# AATS - Applicant Tracking System

## 📋 ภาพรวมโปรเจกต์

AATS (Applicant Tracking System) เป็นระบบจัดการการสมัครงานแบบครบวงจร ที่ออกแบบมาเพื่อช่วยให้องค์กรสามารถจัดการกระบวนการรับสมัครงานได้อย่างมีประสิทธิภาพ

### 🎯 วัตถุประสงค์หลัก
- ลดความซับซ้อนในกระบวนการรับสมัครงาน
- เพิ่มประสิทธิภาพในการจัดการผู้สมัครงาน
- สร้างประสบการณ์ที่ดีสำหรับผู้สมัครและผู้ใช้งานภายในองค์กร
- ติดตามสถานะการสมัครงานแบบ Real-time

## 🚀 เทคโนโลยีที่ใช้

### Backend (be/)
- **Go 1.21** - Programming Language
- **Gin Framework** - Web Framework
- **GORM** - ORM สำหรับจัดการฐานข้อมูล
- **PostgreSQL** - ฐานข้อมูลหลัก
- **JWT** - Authentication & Authorization
- **Docker** - Containerization

### Frontend (fe/)
- **React 18** - UI Framework
- **Vite** - Build Tool
- **TailwindCSS** - CSS Framework
- **shadcn/ui** - UI Components
- **Axios** - HTTP Client
- **React Router** - Navigation

## 👥 User Roles

1. **Candidate** - ผู้สมัครงาน
   - ดูประกาศงาน
   - สมัครงาน
   - ติดตามสถานะ

2. **HR** - ฝ่ายทรัพยากรบุคคล
   - สร้าง/จัดการประกาศงาน
   - จัดการใบสมัคร
   - เปลี่ยนสถานะผู้สมัคร

3. **HM** - Hiring Manager
   - ประเมินผู้สมัคร
   - ให้คะแนนและความเห็น
   - ตัดสินใจการรับเข้าทำงาน

## 📁 โครงสร้างโปรเจกต์

```
AATS/
├── be/                     # Backend (Go + Gin)
│   ├── handlers/          # API Handlers
│   ├── middleware/        # Authentication Middleware
│   ├── models/           # Database Models
│   ├── routes/           # API Routes
│   ├── utils/            # Utility Functions
│   ├── main.go           # Entry Point
│   ├── go.mod            # Go Dependencies
│   └── Dockerfile        # Docker Configuration
│
├── fe/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/   # React Components
│   │   ├── pages/        # Page Components
│   │   ├── services/     # API Services
│   │   └── utils/        # Utility Functions
│   ├── package.json      # Node Dependencies
│   └── vite.config.js    # Vite Configuration
│
├── backend/prisma/         # Database Schema (Prisma)
├── scripts/               # Utility Scripts
└── docs/                  # Documentation Files
```

## 🛠️ การติดตั้งและการใช้งาน

### Prerequisites
- Go 1.21+
- Node.js 18+
- PostgreSQL 13+
- Docker (optional)

### 1. Clone Repository
```bash
git clone [repository-url]
cd AATS
```

### 2. Setup Backend
```bash
cd be

# Install dependencies
go mod tidy

# Setup environment
cp .env.example .env
# แก้ไข .env ตามการตั้งค่าของคุณ

# Start server
go run main.go
```

### 3. Setup Frontend
```bash
cd fe

# Install dependencies
npm install

# Setup environment
cp .env.local.example .env.local
# แก้ไข .env.local ตามการตั้งค่าของคุณ

# Start development server
npm run dev
```

### 4. Using Docker (Alternative)
```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f
```

## 🎨 Features

- **Role-based Authentication** - ระบบสิทธิ์แบบ 3 ระดับ
- **Real-time Status Tracking** - ติดตามสถานะแบบ Real-time
- **Comprehensive Evaluation** - ระบบประเมินแบบละเอียด
- **Responsive Design** - รองรับทุกขนาดหน้าจอ
- **RESTful API** - API ที่สมบูรณ์และใช้งานง่าย

## 📚 Documentation

- [การใช้งานแบบละเอียด](./USAGE-GUIDE.md)
- [UI/UX Guidelines](./UI-UPDATE-PLAN.md)
- [System Architecture](./SYSTEM-DOCUMENTATION.md)
- [API Documentation](./PROJECT_CONTEXT.md)

## 🚀 Quick Start

```bash
# Start Backend
cd be && go run main.go

# Start Frontend (new terminal)
cd fe && npm run dev

# Access Application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8080
```

## 🧪 Testing

ใช้ไฟล์ `test-api.js` สำหรับทดสอบ API:

```bash
node test-api.js
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**เริ่มต้นใช้งานได้ทันที! 🚀**

สำหรับคำแนะนำการใช้งานละเอียด ดูที่ [USAGE-GUIDE.md](./USAGE-GUIDE.md)  