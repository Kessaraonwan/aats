# AATS – คำถาม–คำตอบเชิงลึก (ครอบคลุมทุกประเด็น)

เอกสารนี้ตอบคำถามเชิงสถาปัตยกรรม การออกแบบข้อมูล การทำงานของ API/Frontend ความปลอดภัย กฎธุรกิจ การ deploy และการแก้ปัญหา โดยยึดจากซอร์สโค้ดจริงในโปรเจกต์ `AATS-System` ณ ปัจจุบัน เพื่อใช้ทบทวนก่อนการสอบถาม/นำเสนอผลงาน

หมายเหตุ: อ้างอิงไฟล์ด้วย path ของโปรเจกต์เพื่อความตรวจสอบได้ เช่น `be_clean/handlers/applications.go`, `fe/src/services/api.js`

---

## สถาปัตยกรรม/ภาพรวม

1) ถาม: เลือกสถาปัตยกรรมแยก FE/BE เพื่อแก้ปัญหาอะไร และช่วยสเกล/ความปลอดภัย/การ deploy แยกอย่างไร?
ตอบ: การแยก Frontend (React) ออกจาก Backend (Go + Gin) ทำให้แต่ละส่วนพัฒนา ทดสอบ ดีพลอย และสเกลได้อิสระ ลด coupling ระหว่าง UI กับกฎธุรกิจ/ข้อมูล สามารถวาง FE บน CDN/Edge เพื่อเสิร์ฟเร็ว ขณะที่ BE รันหลัง reverse proxy พร้อมนโยบายความปลอดภัย (JWT/CORS) ชัดเจน รองรับ horizontal scaling ฝั่ง BE ได้ง่ายผ่าน stateless API (อ้างอิง: FE อยู่ `fe/`, BE อยู่ `be_clean/`).

2) ถาม: FE/BE สื่อสารกันผ่าน `VITE_API_URL` และ prefix `/api` มีข้อควรระวังเมื่อเปลี่ยนเป็นโปรดักชันอย่างไร?
ตอบ: ต้องปรับ `fe/.env.local` ให้ `VITE_API_URL` ชี้โดเมน API จริงที่ปลอดภัย (HTTPS) และปรับ CORS ฝั่ง BE ให้ยอมรับเฉพาะ origin โปรดักชัน (แก้ใน `be_clean/middleware/base.go`) รวมถึงวาง reverse proxy (เช่น Nginx) ให้เสิร์ฟเส้นทาง `/api` ไปยัง BE และอาจแคชแบบเหมาะสมเฉพาะ GET.

3) ถาม: กลยุทธ์ลดโหลดเมื่อข้อมูลใหญ่ (`cursor`, `skip_count`, `include_details`) ออกแบบมาแก้ปัญหาใด?
ตอบ: 
- `cursor` (keyset pagination) ลดค่าการคิวรีเมื่อข้อมูลโตมาก โดยหลีกเลี่ยง OFFSET (อ้างอิง `handlers/applications.go` ฟังก์ชัน `ListApplications`).
- `skip_count=true` ข้าม COUNT(*) ซึ่งแพงบนตารางใหญ่.
- `include_details=true` ให้ BE รวม job/applicant/timeline/notes/evaluation และ meta ในคำตอบเพียงครั้งเดียว ลด N+1 calls ฝั่ง FE.

4) ถาม: เหตุผลที่เลือก Go+Gin+GORM+Postgres สำหรับ BE เทียบกับสแตกอื่นในด้านประสิทธิภาพ/ความเรียบง่าย?
ตอบ: Go ให้คอนเคอเรนซีและประสิทธิภาพดี, Gin มี ergonomics ที่กระชับ, GORM ช่วย ORM/AutoMigrate ลด boilerplate, Postgres แข็งแรงด้าน ACID/Index/ILIKE/Search เบื้องต้น เหมาะกับข้อมูลเชิงโครงสร้างของ ATS.

5) ถาม: โฟลเดอร์/โมดูลใดคือ critical path ที่กระทบระบบมากที่สุดเมื่อเปลี่ยนแปลง?
ตอบ: `be_clean/handlers/` (ตรรกะ endpoint), `be_clean/models/` (สคีมา/การเชื่อม DB), `be_clean/middleware/` (Auth/CORS), และ `fe/src/services/` (ชั้นสื่อสาร API). การแก้ไขส่วนเหล่านี้ส่งผลตรงต่อการทำงาน end-to-end.

---

## ข้อมูล/สคีมา

6) ถาม: เหตุผลที่เก็บ `requirements`/`responsibilities` เป็น JSON string (array) และผลต่อการค้นหา/รายงาน?
ตอบ: ช่วยเก็บรายการแบบ dynamic โดยไม่ต้องสร้างตาราง/ความสัมพันธ์ย่อย ลดความซับซ้อน CRUD ของงาน ในเบื้องต้นยังค้นหาได้ด้วย ILIKE (ทั้งก้อน) แต่การรายงานเชิงวิเคราะห์เชิงลึกอาจจำกัด ควรพิจารณา normalise/ใช้ JSONB + index ในอนาคต หากต้องคิวรีภายในรายการย่อย (ไฟล์: `be_clean/models/models.go` struct `JobPosting`).

7) ถาม: การบังคับ 1:1 Evaluation ต่อ Application ทำอย่างไร?
ตอบ: บังคับระดับ DB ผ่าน `uniqueIndex` ที่ `Evaluation.ApplicationID` และตรรกะฝั่งโค้ดทำ upsert (ถ้ามีอยู่แล้วจะอัปเดต) (ไฟล์: `models/models.go` + `handlers/evaluation.go`).

8) ถาม: บทบาทของ `ApplicationTimeline` ต่อการตรวจสอบย้อนหลัง และสร้างเมื่อใดบ้าง?
ตอบ: ใช้เป็น audit trail แสดงลำดับสถานะของใบสมัครพร้อมเวลา/คำอธิบาย สร้างอัตโนมัติเมื่อ PATCH เปลี่ยนสถานะ (ไฟล์: `handlers/applications.go` ใน `UpdateApplicationStatus`).

9) ถาม: ใช้ความสัมพันธ์แบบ logical (ไม่มี FK จริง) มีผลต่อความถูกต้องข้อมูลอย่างไร และลดความเสี่ยงอย่างไร?
ตอบ: ลด coupling ระดับ DB และง่ายต่อ seed/migration อย่างไรก็ตามเสี่ยง orphan records จำเป็นต้องควบคุมด้วยตรรกะฝั่งโค้ด (ตรวจมี job/applicant ก่อนสร้าง application) และพิจารณาเพิ่ม FK/constraint ในโปรดักชัน.

10) ถาม: ฟิลด์ `CreatedBy` ใน `JobPosting` ใช้ audit ว่า HR คนใดเป็นผู้สร้างงานอย่างไร?
ตอบ: เมื่อ `POST /api/jobs` ระบบอ่าน `user_id` จาก JWT แล้วตั้ง `CreatedBy` เป็นผู้สร้าง ช่วยตรวจสอบย้อนกลับได้ว่าประกาศงานมาจาก HR คนใด (ไฟล์: `handlers/jobs.go` ฟังก์ชัน `CreateJob`).

---

## API – Auth/Users/Jobs

11) ถาม: ทำไม `POST /auth/register` ไม่คืน token แต่ FE ยัง auto-login ได้ โฟลว์นี้ทำงานอย่างไร?
ตอบ: Register คืน `{ ok, user }` จากนั้น FE เรียก `/auth/login` ต่อทันทีด้วยอีเมล/รหัสผ่านเดียวกันเพื่อรับ `{ token, user }` แล้วเก็บใน `localStorage` (ไฟล์: `fe/src/services/authService.js`).

12) ถาม: โครงสร้าง JWT (`sub`,`role`,`exp`) ใน `/auth/login` และผลของ TTL 24 ชม. ต่อ UX/ความปลอดภัย?
ตอบ: `sub`=user id, `role`=บทบาท, `exp`=วันหมดอายุ ~24 ชม. ช่วยลดความเสี่ยง token ค้างนานเกินไป ผู้ใช้ที่เปิดทิ้งไว้ข้ามวันอาจถูกเด้ง 401 ต้องล็อกอินใหม่ (ไฟล์: `handlers/auth.go`).

13) ถาม: `GET /api/jobs` รองรับฟิลเตอร์/การเรียงอะไร และการ parse `closing_date` เป็น ISO ทำที่ไหน?
ตอบ: รองรับฟิลเตอร์ `status` และเรียงด้วย `posted_date desc` ฝั่ง FE จะ parse/แสดงผลวันและคัดกรองงานที่ยังเปิดรับ รวมถึงสร้าง payload `closing_date` เป็น ISO ก่อนส่ง (ไฟล์: `handlers/jobs.go`, ฝั่ง FE `JobManagementPage.jsx`).

14) ถาม: `POST /api/jobs` ตั้ง `CreatedBy` จาก JWT อย่างไร และควรกำหนด Role ใดบ้างในโปรดักชัน?
ตอบ: อ่าน `user_id` จาก Gin Context (ตั้งโดย `AuthMiddleware`) แล้วเซ็ต `CreatedBy` แนะนำครอบด้วย `RequireRoles("hr")` ที่ route เพื่อจำกัดเฉพาะ HR (ปัจจุบันยังไม่ได้ผูก middleware ที่ระดับเส้นทางใน `main.go`).

15) ถาม: กรณีผิดพลาดของ Jobs CRUD (404/409/500) ถูกจัดการและสื่อสาร error message อย่างไร?
ตอบ: ใช้ HTTP status ที่สื่อความหมายและ `{ "error": "..." }` ที่เข้าใจได้ เช่น 404 เมื่อไม่พบงาน, 500 เมื่อ fail DB ช่วยให้ FE แสดง toast/error ได้ตรงจุด (ไฟล์: `handlers/jobs.go`).

---

## API – Applications/Timeline/Notes

16) ถาม: นโยบายจำกัดใบสมัครคงค้าง ≤ 5 (ไม่นับ `rejected/hired`) ตรวจนับอย่างไรและครอบคลุม edge cases?
ตอบ: นับด้วย `COUNT` เฉพาะสถานะที่ไม่ใช่ `rejected/hired` ก่อน `CreateApplication` หาก ≥ 5 ตอบ 400 พร้อมข้อความชัดเจน ปิดช่องโหว่สมัครถี่ ๆ (ไฟล์: `handlers/applications.go` ฟังก์ชัน `CreateApplication`).

17) ถาม: การห้ามสมัครซ้ำงานเดียวกันตราบใดที่ยัง active ตรวจด้วยเงื่อนไขสถานะใดบ้าง?
ตอบ: หากมี application เดิมของ job เดียวกันที่สถานะไม่ใช่ `rejected/withdrawn/hired` จะ block การสมัครซ้ำทันที (ไฟล์: `handlers/applications.go`).

18) ถาม: `PATCH /applications/:id/status` สร้าง `ApplicationTimeline` อย่างไร และใช้ `description` เพื่อ audit อย่างไร?
ตอบ: เมื่อบันทึกสถานะใหม่เสร็จ จะสร้าง Timeline พร้อม `status`, `date=now()`, `description` ที่รับมา ใช้เป็นหลักฐานเชิงบริบทของการเปลี่ยนสถานะ (ไฟล์: `handlers/applications.go`).

19) ถาม: ความแตกต่างของ `include_details`/`skip_count`/`cursor` ใน `GET /applications` เหมาะกับสถานการณ์ไหนบ้าง?
ตอบ: 
- `include_details=true` ใช้เมื่อต้องการข้อมูลครบ (ลด N+1) เช่นหน้า Dashboard/Reports.
- `skip_count=true` ใช้ตอน page ผ่านรายการมาก ๆ แบบเลื่อนต่อเนื่องเพื่อลดภาระ DB.
- `cursor=<RFC3339>` ใช้ keyset pagination สำหรับตารางใหญ่เพื่อประสิทธิภาพ.

20) ถาม: ข้อจำกัดการเข้าถึงของ Candidate ใน `GET /applications` และ `GET /applications/:id` ถูกบังคับอย่างไร?
ตอบ: หาก `user_role=candidate` ระบบกรองเฉพาะใบสมัคร `applicant_id` ของตนเอง และเมื่อเรียกรายการเดี่ยว หากไม่ใช่เจ้าของจะตอบ 403 (ไฟล์: `handlers/applications.go`).

21) ถาม: Notes ถูกสร้าง/ดึงอย่างไร และมีการเติมชื่อผู้เขียนอัตโนมัติหรือไม่?
ตอบ: `POST /applications/:id/notes` ใช้ `user_id` จาก JWT เซ็ต `CreatedBy` และหากไม่ส่ง `author` ระบบจะพยายามอ่านชื่อผู้ใช้เติมให้ (`middleware`+query ผู้ใช้แบบ silent) `GET` เรียงล่าสุดก่อน (ไฟล์: `handlers/notes.go`).

---

## API – Evaluation/Notifications/Uploads

22) ถาม: เงื่อนไขการสร้าง/อัปเดต `Evaluation` (ต้องสถานะ >= `interview`) และการคำนวณ `overall_score` อัตโนมัติ?
ตอบ: อนุญาตเฉพาะเมื่อ Application อยู่สถานะ `interview|offer|hired` หาก `overall_score` ไม่ส่งมา ระบบคำนวณเฉลี่ย 4 ด้านโดยอัตโนมัติ (ไฟล์: `handlers/evaluation.go`).

23) ถาม: เหตุผลและวิธีตรวจบังคับว่า `offer/hired` ต้องมี `Evaluation` ก่อนใน PATCH สถานะ?
ตอบ: ก่อนเซ็ตเป็น `offer`/`hired` จะคิวรี `Evaluation` ตาม `application_id` หากไม่มีตอบ 400 พร้อมข้อความอธิบาย เพื่อให้ขั้นตอนคัดกรองมีคุณภาพและตรวจสอบได้ (ไฟล์: `handlers/applications.go` ใน `UpdateApplicationStatus`).

24) ถาม: `GET /notifications/aggregate` รวบรวมจาก Timeline/Evaluation อย่างไร โครงสร้างข้อมูลและการ sort ตามเวลา?
ตอบ: รวม timeline ล่าสุดและ evaluation ล่าสุด แปลงเป็นอ็อบเจกต์ `{ id, type, title, message, payload, timestamp }` แล้ว sort โดย `timestamp desc` และจำกัดตาม `limit` (ไฟล์: `handlers/notifications.go`).

25) ถาม: `POST /uploads/resume` เก็บไฟล์ที่ไหน ตั้งชื่อไฟล์อย่างไร และข้อจำกัดปัจจุบัน?
ตอบ: บันทึกไฟล์ลง `be_clean/uploads/resumes/` ตั้งชื่อเป็น `<UUID>_<ชื่อไฟล์ต้นฉบับ>` ตอบกลับ URL ภายใน `/uploads/resumes/...` ปัจจุบันยังไม่มี static server ใน BE จึงควรเสิร์ฟผ่าน proxy/static หรือย้ายไป Object Storage ในโปรดักชัน (ไฟล์: `handlers/uploads.go`).

26) ถาม: เหตุใดการรวม notification ฝั่ง BE จึงดีกว่าปล่อยให้ FE รวมเอง?
ตอบ: ลด round-trips และ N+1 คิวรีบน FE, ทำให้นโยบายการรวม/การจัดลำดับเวลา/ฟิลเตอร์สอดคล้องเดียวกันทุก client, ง่ายต่อการทดสอบ/ตรวจสอบ.

---

## กฎธุรกิจ

27) ถาม: ความต่างของช่วงรอสมัครใหม่ 3 เดือน vs 6 เดือน ตรวจ “เคยสัมภาษณ์ก่อนถูกปฏิเสธ” จากข้อมูลใด?
ตอบ: ระบบค้นหา timeline ล่าสุดที่เป็น `rejected` ของใบสมัครก่อนหน้า และตรวจว่ามี `interview` เกิดก่อนหน้านั้นหรือไม่ ถ้ามีรอ 6 เดือน ไม่เช่นนั้นรอ 3 เดือน แล้วคำนวณ `allowedAt` เปรียบเทียบกับ `now()` (ไฟล์: `handlers/applications.go`).

28) ถาม: กรณี `withdrawn` นโยบาย re-apply เป็นอย่างไร และ meta `can_reapply`/`can_reapply_date` สะท้อนอะไร?
ตอบ: หากสถานะก่อนหน้าเป็น `withdrawn` จะ `can_reapply=true` และตั้งวันที่อ้างอิงตาม `UpdatedAt`/timeline เพื่อให้ผู้สมัครสมัครใหม่ได้ทันที (meta ถูกคำนวณใน `ListApplications` เมื่อ `include_details=true`).

29) ถาม: การสร้าง Timeline อัตโนมัติช่วยให้ audit trail มีคุณภาพอย่างไร ควรบันทึก `description` ระดับไหน?
ตอบ: บันทึกผู้เปลี่ยนสถานะ/เหตุผลย่อ ช่วยตรวจสอบย้อนหลัง/ทบทวนกระบวนการ แนะนำบันทึกสั้น กระชับ มีบริบทพอ (เช่น “ผ่าน HR screening, นัดสัมภาษณ์ 12/10”).

30) ถาม: ข้อจำกัดสิทธิ์ HR/HM ในโค้ดปัจจุบันถูกบังคับตรงไหนบ้าง และควรปิดช่องโหว่เพิ่มเติมอย่างไร?
ตอบ: มีการบังคับบางส่วนใน handler เฉพาะจุด (เช่น Candidate เห็นเฉพาะของตนเอง, offer/hired ต้องมี Evaluation) แต่ route-level RBAC ยังไม่ได้ผูกทุกจุด แนะนำใช้ `middleware/role.go` ครอบเส้นทางสำคัญ (Jobs CRUD, Patch status, Notes/Evaluation) ในโปรดักชัน.

31) ถาม: กรณี HR สร้างใบสมัครแทนผู้สมัคร ระบบอนุญาตผ่าน `applicant_id` อย่างไร และป้องกันการสวมสิทธิ์อย่างไร?
ตอบ: หากผู้เรียกมี JWT และเป็น HR จึงอนุญาตส่ง `applicant_id` แทนผู้สมัครได้ หากไม่ใช่ HR แต่ส่ง `applicant_id` ของคนอื่นมาจะถูก 403 (ไฟล์: `handlers/applications.go`).

---

## ความปลอดภัย/CORS

32) ถาม: `AuthMiddleware` ตรวจ header `Authorization: Bearer <token>` อย่างไร และส่ง error เมื่อผิดพลาดแบบใด?
ตอบ: แยกค่า `Bearer`/token, อ่าน `JWT_SECRET`, parse JWT (HS256) แล้วตั้ง `user_id`/`user_role` ใน context หากไม่พบ/ไม่ถูกต้อง ตอบ 401/500 พร้อม `{ "error": ... }` (ไฟล์: `middleware/auth.go`).

33) ถาม: หาก `JWT_SECRET` ไม่ถูกตั้งค่า ระบบตอบสนองอย่างไร และควรป้องกันเหตุนี้อย่างไรในโปรดักชัน?
ตอบ: ตอบ 500 พร้อมข้อความชัดเจน แนะนำตั้งค่า ENV ผ่าน Secret Manager/CI/CD และมี healthcheck/startup check เพื่อ fail fast หากค่าไม่ถูกต้อง (ไฟล์: `handlers/auth.go`, `middleware/auth.go`).

34) ถาม: นโยบาย CORS อนุญาต `localhost` ใดบ้าง และต้องปรับเป็น domain จริงอะไรบ้างเมื่อขึ้นโปรดักชัน?
ตอบ: อนุญาต `http://localhost:5173`, `http://localhost:3000` และ `AllowOriginFunc` ที่ยอมรับทุกพอร์ต `localhost` ใน dev ควรปรับให้ยอมรับเฉพาะโดเมน FE โปรดักชัน (ไฟล์: `middleware/base.go`).

35) ถาม: ควรใช้ `RequireRoles` ครอบ route ใดบ้างเพื่อเข้มงวด RBAC?
ตอบ: Jobs CRUD (`POST/PUT/DELETE /api/jobs`), เปลี่ยนสถานะใบสมัคร (`PATCH /applications/:id/status`), สร้างหมายเหตุ (`POST /applications/:id/notes`), สร้าง/อัปเดตการประเมิน (`POST /applications/:id/evaluation`) ควรจำกัด HR/HM ตามกรณี.

36) ถาม: การเก็บ token ใน `localStorage` มีความเสี่ยงใด และทางเลือกเช่น httpOnly cookie/Token Rotation มีผลดีอย่างไร?
ตอบ: `localStorage` เสี่ยง XSS ขโมย token ทางเลือกคือ cookie httpOnly + SameSite/CSRF token หรือใช้ short-lived access token + refresh token rotation ลดผลกระทบเมื่อ token รั่ว.

---

## Frontend UI/UX/Navigation

37) ถาม: เหตุผลที่ไม่ใช้ React Router แต่ใช้ state ใน `src/App.jsx` เพื่อสลับหน้า ผลต่อ maintainability/testing?
ตอบ: สำหรับ prototype/เดโม โครงสร้างแบบ state-driven ทำได้เร็ว ลด dependency และคุม flow ง่าย แต่เมื่อระบบโตควรย้ายไป Router เพื่อ URL ที่ bookmark/share ได้ง่าย และรองรับ deep link/test ที่ชัดเจนกว่า (ไฟล์: `fe/src/App.jsx`).

38) ถาม: โฟลว์นำทางหลัง Login ตามบทบาท (candidate/hr/hm) ทำอย่างไร และกันผู้ใช้ไม่ล็อกอินเข้าหน้าภายในอย่างไร?
ตอบ: หลัง login เซ็ต `currentUser` และเปลี่ยน `currentPage` ตาม `role` ถ้าไม่มี `isAuthenticated` หรือ `currentUser` จะรีไดเรกต์กลับ Landing/ Login (เช็คใน `renderPage()` ของ `App.jsx`).

39) ถาม: JobsListPage dedupe งานด้วย content key (title/location/department/postedDate) แก้ปัญหา seed ซ้ำอย่างไร และข้อเสียที่อาจซ่อน?
ตอบ: ลดการแสดงซ้ำเมื่อฐานข้อมูลมีรายการซ้ำเนื่องจาก seed/ข้อมูลทดสอบ แต่ข้อเสียคือถ้าต่างกันนิดเดียว (เช่น detail ต่าง) อาจถูกมองว่าเหมือนและถูกตัดทิ้ง ควรแก้ที่ต้นทางข้อมูลในระยะยาว (ไฟล์: `fe/src/pages/candidate/JobsListPage.jsx`).

40) ถาม: ApplyPage อัปโหลดไฟล์ผ่าน `/uploads/resume` และประกอบ payload (education/skills JSON string) อย่างไร?
ตอบ: ถ้าแนบไฟล์จะส่ง multipart ไป `/uploads/resume` ได้ URL แล้วประกอบ payload: `education` เป็น JSON string ของ object, `skills` เป็น JSON string ของ array ก่อน `POST /applications` (ไฟล์: `fe/src/pages/candidate/ApplyPage.jsx`).

41) ถาม: TrackStatusPage ทำ normalization response หลายรูปแบบและเติมข้อมูล jobTitle/timeline/notes เพิ่มอย่างไร?
ตอบ: รองรับทั้งรูป `{ apps: [Application] }` และ `{ apps: [{ application, meta, raw }] }` ด้วยการ map/merge ให้ได้ฟิลด์เดียวกัน แล้วยิง `GET /applications/:id` เพื่อเติมรายละเอียด timeline/notes/job/applicant (ไฟล์: `fe/src/pages/candidate/TrackStatusPage.jsx`).

---

## Frontend Services/Hooks/State

42) ถาม: Interceptor ใน `api.js` จัดการ 401 โดยไม่ทำให้หน้า Login เด้งทับเองอย่างไร?
ตอบ: ตรวจว่ามี token เดิมและผู้ใช้ไม่ได้อยู่ที่เส้นทาง login อยู่แล้ว จึงค่อย redirect ป้องกันกรณี submit ผิดที่หน้า login แล้วถูกรีไดเรกต์ซ้ำ (ไฟล์: `fe/src/services/api.js`).

43) ถาม: `useRecruitmentData` ดึงแบบ batch ด้วย `skip_count` + dedupe application และ map รายละเอียดเป็น `details` อย่างไร?
ตอบ: วนดึงหน้า ๆ โดยตั้ง `skip_count=true` เก็บรวม `appsRaw` แล้ว dedupe ตาม `id` สร้าง `applications` ที่ normalize พร้อม map `details` จาก wrapper/raw ที่ BE ใส่มาเมื่อ `includeDetails=true` (ไฟล์: `fe/src/hooks/useRecruitmentData.js`).

44) ถาม: เหตุใดไม่มี `/applications/my` แต่ `getApplications()` ยังได้รายการของฉัน?
ตอบ: ฝั่ง BE ตรวจ `user_role=candidate` แล้วกรองด้วย `user_id` อัตโนมัติ ทำให้ endpoint เดียวกันใช้ได้ทั้ง HR/HM และ Candidate โดยไม่ต้องมีเส้นทางพิเศษ (ไฟล์: `handlers/applications.go`).

45) ถาม: คีย์ `localStorage` ที่ใช้ (`auth_token`,`user_data`,`notifs_read_<uid>`) มี lifecycle และผลต่อ UX/ความปลอดภัยอย่างไร?
ตอบ: ช่วยให้คงสถานะล็อกอิน/ข้อมูลผู้ใช้/สถานะการอ่านแจ้งเตือนระหว่างรีเฟรช แต่หาก token หมดอายุ interceptor จะลบและพากลับไป login ควรระวัง XSS ตามข้อ 36.

46) ถาม: การตั้ง `VITE_API_URL` ให้สอดคล้องแต่ละแวดล้อม (dev/staging/prod) มีวิธีตรวจสอบ/แก้ไขความคลาดเคลื่อนอย่างไร?
ตอบ: ตั้งค่าใน `.env.local`/ตัวแปร ENV ระหว่างบิลด์ ตรวจด้วย Network tab ว่าเรียกถูกโดเมน/พอร์ต และตรวจ CORS ฝั่ง BE หากโดเมนไม่อยู่ใน allowlist.

---

## Deploy/Env/Seeding/Troubleshooting

47) ถาม: ทำไม map พอร์ต Postgres เป็น `5433:5432` และการใช้ named volume `pgdata` ช่วยอะไรบน Windows?
ตอบ: เพื่อหลีกเลี่ยงชนกับ Postgres อื่นที่อาจใช้ 5432 อยู่ และ named volume ให้ Docker จัดการ permission ลดปัญหา initdb บน Windows (ไฟล์: `be_clean/docker-compose.yml`).

48) ถาม: ขั้นตอน bring-up แบบ local ที่ถูกต้องและ dependency อะไรบ้าง?
ตอบ: 1) `docker-compose up -d` ให้ Postgres พร้อมใช้ 2) ตั้ง `be_clean/.env` ให้ `DATABASE_URL` ชี้ `localhost:5433` 3) `go run main.go` (BE) 4) `npm run dev` (FE) 5) ตรวจ CORS/PORT ให้ตรงกัน.

49) ถาม: เหตุผลที่ endpoint seed เปิดใช้เฉพาะ `gin.DebugMode` และความเสี่ยงหากเปิดในโปรดักชัน?
ตอบ: seed เปลี่ยนแปลงข้อมูลจำนวนมากเพื่อทดสอบ หากเปิดในโปรดักชันอาจทำให้ข้อมูลปน/รั่ว แฮนเดลอร์จึงบล็อกเมื่อ `gin.Mode()!=Debug` (ไฟล์: `handlers/dev.go`).

50) ถาม: แนวทางแก้ CORS block, 401/JWT หมดอายุ, และปัญหาเสิร์ฟไฟล์ resume ควรทำอย่างไร?
ตอบ: 
- CORS: เพิ่ม origin โปรดักชันใน `middleware/base.go`/reverse proxy.
- 401: ตรวจ `Authorization`/`JWT_SECRET` และ TTL; ให้ FE จัดการ logout/refresh UX ดี.
- Resume: เสิร์ฟผ่าน static/proxy ที่ map `/uploads/resumes/*` หรือเก็บใน Object Storage พร้อม URL สาธารณะ.

---

สรุป: เอกสาร QA นี้ตอบคำถามสำคัญเชิงระบบทั้งหมดอิงจากซอร์สโค้ดจริง ครอบคลุมสถาปัตยกรรม การสื่อสาร FE/BE สคีมา/กฎธุรกิจ ความปลอดภัย/สิทธิ์ การทำงานของ endpoint และกลยุทธ์ประสิทธิภาพ รวมถึงประเด็นการดีพลอยและแก้ปัญหา เพื่ออธิบายและป้องกันคำถามต่อเนื่องได้ครบถ้วน

