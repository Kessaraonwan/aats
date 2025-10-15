# สคริปต์พรีเซนต์ (TH) – AATS: 5 หน้าเด่น, 5 ผู้บรรยาย, เดโครบวงจร

ปรับปรุงล่าสุด: 2025-10-16

จุดประสงค์: เอกสารนี้จัดบทพูด โครงสร้างสไลด์ และลำดับเดโม สำหรับการนำเสนอระบบ AATS โดยเน้น 5 หน้าหลัก ครอบคลุม Persona/Flow/Endpoint/Key Messages พร้อมแผนสำรองเมื่อเดโมมีปัญหา

กลุ่มผู้บรรยาย (ตัวอย่าง – แก้ชื่อได้):
- ผู้นำเสนอ 1: หน้า Shared – Landing + Login
- ผู้นำเสนอ 2: Candidate – Jobs List
- ผู้นำเสนอ 3: Candidate – Apply
- ผู้นำเสนอ 4: HR – Applicants Management
- ผู้นำเสนอ 5: HM – Evaluation

ไฟล์หน้าเว็บที่เกี่ยวข้อง (Frontend):
- `fe/src/pages/shared/LandingPage.jsx`
- `fe/src/pages/shared/LoginPage.jsx`
- `fe/src/pages/candidate/JobsListPage.jsx`
- `fe/src/pages/candidate/ApplyPage.jsx`
- `fe/src/pages/hr/HRApplicantsPage.jsx`
- `fe/src/pages/hm/HMEvaluationPage.jsx`

Endpoint หลัก (Backend): ดูที่ `be_clean/handlers/*.go`
- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- Jobs: `/api/jobs`, `/api/jobs/:id`
- Applications: `/api/applications`, `/api/applications/:id`, `/api/applications/:id/status`
- Notes: `/api/applications/:id/notes`
- Evaluation: `/api/applications/:id/evaluation`
- Uploads: `/api/uploads/resume`

ระยะเวลาแนะนำ (รวม ~15 นาที + Q&A 2 นาที)
- 1) Landing+Login (2.5 นาที)
- 2) Jobs List (3 นาที)
- 3) Apply (3 นาที)
- 4) HR Applicants (3 นาที)
- 5) HM Evaluation (3 นาที)
- Q&A (2 นาที)

หมายเหตุการเตรียมเดโม
- บัญชีตัวอย่างจาก seed (`handlers/dev.go`):
  - HR: `hr@aats.com` / `hr123456`
  - HM: `hm@aats.com` / `hm123456`
  - Candidate: `candidate1@aats.com` / `cand1234`
- ตั้งค่า FE ชี้ไป BE: `fe/.env.local` → `VITE_API_URL=http://localhost:8080/api`
- BE ใช้ Postgres (docker-compose พอร์ต 5433) และ `.env` ใน `be_clean/`

---

## สไลด์ 0 — เปิดงาน/บริบท (ผู้นำเสนอหลัก, 30 วินาที)
Key messages
- “AATS คือระบบ Applicant Tracking System สำหรับสมัคร-คัดกรอง-ประเมิน ครบวงจร”
- “วันนี้สาธิต 5 หน้าไฮไลต์ ครอบคลุม 3 บทบาท: Candidate, HR, HM”
- “โครงสร้าง FE/BE แยกชัดเจน เชื่อมผ่าน REST API + JWT”

Script (ย่อ)
- “สวัสดีครับ/ค่ะ กลุ่มของเราพัฒนาระบบ AATS เพื่อลดงานเอกสารและเพิ่มความโปร่งใสในการสรรหาบุคลากร วันนี้จะพาไปดู 5 หน้าเด่น ตั้งแต่เข้าระบบ สมัครงาน จัดการผู้สมัคร จนถึงการประเมินโดยผู้จัดการสายงาน”

---

## 1) Shared – Landing + Login (ผู้นำเสนอ 1, 2.5 นาที)
ไฟล์: `fe/src/pages/shared/LandingPage.jsx`, `fe/src/pages/shared/LoginPage.jsx`
Endpoint เกี่ยวข้อง: `POST /api/auth/login`, `GET /api/auth/me`

วัตถุประสงค์/Persona
- ผู้ใช้ใหม่เข้าใจภาพรวมระบบและเข้าใช้งานได้อย่างราบรื่น

เดโมสเต็ป
1) เปิด Landing: ชี้ปุ่ม “เข้าสู่ระบบ/สมัครสมาชิก” และลิงก์ “เกี่ยวกับระบบ”
2) กด Login: ใส่บัญชี Candidate ตัวอย่าง (หรือ HR/HM ตามลำดับส่วนถัดไป)
3) สำเร็จแล้ว FE เก็บ `auth_token` + `user_data` ที่ `localStorage` และเปลี่ยนเส้นทางตามบทบาท

ประเด็นต้องพูด
- Interceptor ที่ `fe/src/services/api.js` จัดการ 401/redirect แบบไม่รบกวนหน้าล็อกอิน
- JWT claims (`sub`,`role`) ใช้ควบคุมการเข้าถึงหน้าในแอป

Script (ตัวอย่าง)
- “หน้านี้ให้ผู้ใช้เริ่มต้นและรับรู้คุณค่าของระบบ เราใช้ JWT เพื่อยืนยันตัวตน ทุกคำขอไป BE จะมี Bearer Token แนบมาโดยอัตโนมัติ เมื่อเข้าสู่ระบบแล้ว ระบบจะพา Candidate ไปหน้า ‘งานที่เปิดรับ’ ทันที”

---

## 2) Candidate – Jobs List (ผู้นำเสนอ 2, 3 นาที)
ไฟล์: `fe/src/pages/candidate/JobsListPage.jsx`
Endpoint: `GET /api/jobs`

วัตถุประสงค์/Persona
- Candidate ค้นหา เลือก และเตรียมสมัครงานได้ง่าย

เดโมสเต็ป
1) แสดงตัวกรอง: คำค้นหา, location, department, experience level
2) อธิบายการเรียง: วันที่โพสต์ล่าสุด, ตัวอักษร, ใกล้ปิดรับ
3) คลิกบัตรงาน → ปุ่ม “สมัครงาน” (ไปหน้า Apply)

ประเด็นต้องพูด
- Dedupe งานฝั่ง FE เพื่อเลี่ยงข้อมูลทดสอบซ้ำ (content key)
- เกณฑ์เปิดรับ: `status=active` หรือ `closingDate` ยังไม่เลยกำหนด

Script (ตัวอย่าง)
- “หน้า Jobs List ออกแบบให้ค้นหาเร็วและเห็นใจความสำคัญชัดเจน เรามีตัวกรองหลักและการเรียงที่สอดคล้องกับการใช้จริง พร้อมลดความสับสนด้วยการคัดงานที่ซ้ำจาก seed ออกตั้งแต่ฝั่ง UI”

---

## 3) Candidate – Apply (ผู้นำเสนอ 3, 3 นาที)
ไฟล์: `fe/src/pages/candidate/ApplyPage.jsx`
Endpoint: `GET /api/jobs/:id`, `POST /api/uploads/resume`, `POST /api/applications`

วัตถุประสงค์/Persona
- Candidate กรอกสมัคร อัปโหลดเรซูเม่ และส่งใบสมัครสำเร็จ

เดโมสเต็ป
1) เปิดหน้าสมัคร: โหลดรายละเอียดงาน (title, dept, location)
2) อัปโหลดเรซูเม่ → เรียก `/uploads/resume` ได้ URL กลับ
3) กรอกข้อมูล: cover letter, education (JSON string), skills (JSON array)
4) ส่ง `/applications` → แสดง dialog สำเร็จ + นำไป Track หรือ Jobs

ประเด็นต้องพูด
- กฎธุรกิจสำคัญ (บังคับที่ BE):
  - จำกัดใบสมัครคงค้าง ≤ 5 (ยกเว้น `rejected/hired`)
  - ห้ามสมัครซ้ำงานเดิมถ้ารอบก่อนยัง active
  - ถูกปฏิเสธ: ต้องรอตาม stage (Screening 3 เดือน / มีสัมภาษณ์ 6 เดือน)
- Upload เก็บไฟล์ใน `be_clean/uploads/resumes/` → โปรดักชันควรเสิร์ฟผ่าน static/proxy หรือ S3

Script (ตัวอย่าง)
- “เพื่อให้การสมัครโปร่งใสและควบคุมภาระงาน ระบบตั้งนโยบายชัดเจนบนฝั่งเซิร์ฟเวอร์ เช่น จำกัดจำนวนใบสมัครที่คงค้าง และบังคับช่วงรอเมื่อถูกปฏิเสธตามบริบท เพื่อยุติการสมัครซ้ำๆ โดยไม่เปลี่ยนแปลงสาระ”

---

## 4) HR – Applicants Management (ผู้นำเสนอ 4, 3 นาที)
ไฟล์: `fe/src/pages/hr/HRApplicantsPage.jsx` (+ รายละเอียด `ApplicantDetailsPage.jsx`)
Endpoint: `GET /api/applications` (กรอง/แบ่งหน้า), `GET /api/applications/:id`, `POST /api/applications/:id/notes`, `PATCH /api/applications/:id/status`

วัตถุประสงค์/Persona
- HR มองเห็นภาพรวมใบสมัครทั้งหมด ค้นหา/กรอง และจัดการได้

เดโมสเต็ป
1) แสดงตารางผู้สมัคร + ตัวกรองสถานะ/คำค้นหา
2) เปิดรายละเอียดใบสมัคร: แสดง Job, Timeline, Notes, Evaluation (ถ้ามี)
3) เพิ่ม Note (ตัวอย่าง): เหตุผล/สิ่งที่ต้องการเพิ่มเติม
4) เปลี่ยนสถานะ (ตัวอย่าง): จาก `screening` → `interview` (อธิบาย Timeline เพิ่มอัตโนมัติ)

ประเด็นต้องพูด
- Candidate เห็นเฉพาะของตนเอง แต่ HR เห็นทั้งหมด (RBAC/JWT)
- เปลี่ยนเป็น `offer/hired` ต้องมี Evaluation จาก HM ก่อน (บังคับใน BE)

Script (ตัวอย่าง)
- “หน้าจอนี้ช่วย HR ลดงานโทร/จดมือ ด้วยการเห็น Timeline และ Note รวมอยู่ในที่เดียว และทุกครั้งที่เปลี่ยนสถานะ ระบบจะสร้างไทม์ไลน์เป็นหลักฐานเพื่อการ audit ที่ชัดเจน”

---

## 5) HM – Evaluation (ผู้นำเสนอ 5, 3 นาที)
ไฟล์: `fe/src/pages/hm/HMEvaluationPage.jsx`
Endpoint: `POST /api/applications/:id/evaluation`, `GET /api/applications/:id/evaluation`

วัตถุประสงค์/Persona
- HM ให้คะแนนและความคิดเห็นอย่างเป็นระบบ เพื่อใช้ประกอบการตัดสินใจของ HR

เดโมสเต็ป
1) เปิดฟอร์มประเมิน: ด้าน Technical/Communication/Problem-solving/Cultural Fit
2) กรอกคะแนน + ข้อคิดเห็น → บันทึก (create/update 1:1 ต่อ Application)
3) อธิบายว่าหลังมี Evaluation → HR จึงจะเลื่อนเป็น `offer`/`hired` ได้

ประเด็นต้องพูด
- ถ้า `overall_score` ไม่ส่งมา ระบบเฉลี่ยให้ที่ฝั่ง BE
- โครงสร้างบังคับ 1:1 ผ่าน unique index ช่วยป้องกันซ้ำซ้อน

Script (ตัวอย่าง)
- “เราออกแบบให้ HM ใส่ความเห็นเชิงคุณภาพควบคู่กับคะแนน มุมมองนี้ถูกฝังในกระบวนการตัดสินใจ โดยระบบบังคับว่าต้องมีการประเมินก่อน HR จะเสนอข้อเสนอหรือรับเข้าทำงาน เพื่อรักษาคุณภาพกระบวนการ”

---

## สไลด์ปิด — สรุปคุณค่า/ทางเทคนิค (ผู้นำเสนอหลัก, 30–45 วินาที)
- คุณค่า: ลดภาระงาน, เพิ่มความโปร่งใส, ผู้สมัครติดตามได้เอง
- ทางเทคนิค: FE/BE แยกชัดเจน, JWT, RBAC, CORS, Postgres + GORM, กลยุทธ์ประสิทธิภาพ (`cursor`, `skip_count`, `include_details`)
- Deployment: Docker Compose (Postgres 5433), ENV ชัดเจน, พร้อมต่อยอด Email/Realtime

---

## ภาคผนวก A — สคริปต์พูดย่อ (พร้อมต่อเวลา)
ผู้นำเสนอ 1 (Landing+Login ~2.5 นาที)
- “ภาพรวม AATS และการเข้าใช้งาน… หลังล็อกอิน ระบบจะนำผู้ใช้ไปหน้าที่สอดคล้องกับบทบาททันที…”
- “ฝั่งเทคนิค เราใช้ JWT และ Interceptor ของ Axios เพื่อแนบ token และจัดการ 401 อย่างนุ่มนวล…”

ผู้นำเสนอ 2 (Jobs List ~3 นาที)
- “ผู้สมัครค้นหางานได้รวดเร็วด้วยตัวกรองหลัก… เราจัดการข้อมูลซ้ำจาก seed ตั้งแต่ฝั่ง UI เพื่อไม่ให้ผู้ใช้สับสน…”

ผู้นำเสนอ 3 (Apply ~3 นาที)
- “การอัปโหลดเรซูเม่ทำผ่าน `/uploads/resume` ก่อน แล้วนำ URL ไปแนบใน payload สมัคร… กฎธุรกิจช่วยควบคุมการสมัครซ้ำและภาระงาน HR…”

ผู้นำเสนอ 4 (HR Applicants ~3 นาที)
- “HR ดูรายละเอียดผู้สมัครได้ครบในหน้าเดียวทั้ง Timeline/Notes/Evaluation และสามารถอัปเดตสถานะซึ่งถูกบันทึกเป็นไทม์ไลน์โดยอัตโนมัติ…”

ผู้นำเสนอ 5 (HM Evaluation ~3 นาที)
- “แบบฟอร์มประเมิน 4 ด้าน พร้อมคอมเมนต์ และบังคับให้มีการประเมินก่อนเข้าสู่ขั้นเสนอข้อเสนอ/รับเข้าทำงาน เพื่อรักษาคุณภาพการคัดเลือก…”

---

## ภาคผนวก B — แผนสำรองเดโม (เมื่อ BE/DB ล่ม)
- เตรียมบัญชี login mock และสกรีนช็อต/วิดีโอสั้นสำหรับแต่ละหน้า
- เปิด FE โหมด mock data: 
  - ใช้ Network tab จำลอง response 200 (หรือเปิด PR ที่สลับ `api.js` ไปยังไฟล์ JSON ชั่วคราว)
- กรณีอัปโหลดเรซูเม่: แสดงไฟล์ตัวอย่างและข้ามขั้นตอนอัปโหลด โดยอธิบาย flow แทน
- หากสถานะ/ไทม์ไลน์: ใช้หน้าจอ Applicant Details ที่แคปไว้ พร้อมอธิบายจุดที่ BE สร้าง Timeline automático

---

## ภาคผนวก C — สไลด์โครง (Template 8–10 สไลด์)
1) ชื่อโปรเจกต์ + สมาชิก + วัตถุประสงค์
2) สถาปัตยกรรมภาพรวม (FE/BE/DB + API)
3) หน้า 1: Landing+Login (ภาพหน้าจอ + จุดเด่น)
4) หน้า 2: Jobs List (ภาพหน้าจอ + ตัวกรอง/เรียง)
5) หน้า 3: Apply (ภาพหน้าจอ + Upload + Policy)
6) หน้า 4: HR Applicants (ภาพหน้าจอ + Timeline/Notes/Status)
7) หน้า 5: HM Evaluation (ภาพหน้าจอ + 1:1/Overall score)
8) เทคนิคสำคัญ/ประสิทธิภาพ (JWT, RBAC, include_details, cursor, skip_count)
9) Deployment/Env (Docker Compose, ENV, CORS)
10) สรุป + Q&A

---

เคล็ดลับการพูด
- พูดนำด้วย “ปัญหา–แนวทาง–ผลลัพธ์” ในทุกหน้า
- โยงกลับค่าของผู้ใช้ปลายทาง (HR/HM/Candidate)
- เมื่อเดโม กดช้า-ชัด-นิ่ง และบอกว่า “ขณะนี้ระบบเรียก API …” เพื่อสร้างความเข้าใจเชิงเทคนิค
- สลับผู้บรรยายแบบต่อเนื่อง: คนก่อนปิดด้วย “ต่อไปเราจะเห็น …” คนถัดไปเปิดด้วย “จากที่กล่าวมา เมื่อผู้ใช้ทำ … จะไปยัง …”

