# สคริปต์พรีเซนต์: เจาะลึกโค้ดระบบ AATS (ละเอียดขั้นสูง)

## ภาพรวมโค้ดระบบ (Overview)
ระบบ AATS (Applicant Tracking System) ถูกออกแบบแบบแยกส่วน (modular, layered) เพื่อความชัดเจนในการ maintain, scale, debug และ audit โดยแบ่งเป็น 3 ส่วนหลัก:
- **Backend (Go):** API, Business Logic, Data Validation, Seeder, Timeline, Auth
- **Frontend (React):** UI/UX, State Management, API Integration, Safeguard, Error Boundary
- **Database & Scripts:** PostgreSQL, SQL/PowerShell สำหรับ data fix, automation, backup, restore

ทุกส่วนเชื่อมต่อกันผ่าน RESTful API (JSON) มีการ enforce business rule ทั้งฝั่ง FE/BE เพื่อความถูกต้องของข้อมูลและความปลอดภัย

---

## Backend (be_clean/)
### ภาพรวม
- ภาษา Go (เวอร์ชั่น 1.21)
- Framework: Gin (HTTP router), GORM (ORM), uuid, bcrypt, JWT
- โฟลเดอร์หลัก: models, handlers, middleware, utils, config
- จุดเด่น: separation of concerns, business rule enforcement, idempotent seeder, timeline audit, error handling

### โฟลเดอร์/ไฟล์สำคัญ
#### models/
- `models.go`: กำหนด schema ของทุก entity เช่น Application, Job, User, Timeline
  - **Struct:** กำหนด field, type, relation, constraint เช่น unique, foreign key
  - **Example:** Application struct มี status, job_id, user_id, timeline, evaluatedByHM
  - **Design:** ใช้ struct tag สำหรับ mapping DB, validation, index
  - **Debug:** ถ้า schema ไม่ตรงกับ DB ให้ดู auto-migrate ใน `database.go`
- `database.go`: ฟังก์ชันเชื่อมต่อ DB, auto-migrate, transaction, error log
  - **Example:** InitDB() เชื่อมต่อ, migrate, log error
  - **Design:** ใช้ transaction ทุกจุดที่เปลี่ยนข้อมูลสำคัญ เช่น promote, seed

#### handlers/
- `applications.go`: API สำหรับจัดการใบสมัคร เช่น สร้าง, เปลี่ยนสถานะ, validate business rule
  - **Function:** Create, Update, ChangeStatus, GetByID, List, Delete
  - **Business Rule:** HR กด offer/hired ได้ก็ต่อเมื่อ HM ประเมินเสร็จ (เช็ค evaluatedByHM)
  - **Error Handling:** ถ้าไม่ผ่าน rule จะ return 400/403 พร้อม message
  - **Debug:** ดู log, timeline, response code
- `auth.go`: login, JWT, role-based access, refresh token
  - **Function:** Login, Register, ValidateToken, GetRole
  - **Design:** ใช้ bcrypt hash password, JWT สำหรับ session
- `dev.go`: seeder แบบ idempotent, endpoint สำหรับ seed/reseed ข้อมูล
  - **Function:** SeedAll, SeedJobs, SeedUsers, ResetDB
  - **Design:** ใช้ transaction, upsert, clear ก่อน insert
- `jobs.go`, `evaluation.go`, `notes.go`: API สำหรับ job, การประเมิน, note
  - **Function:** CRUD, validate, timeline

#### middleware/
- `auth.go`: JWT validation, role guard, error response
  - **Function:** AuthMiddleware, RoleMiddleware
  - **Design:** แยก logic guard ออกจาก handler
- `base.go`, `role.go`: ตรวจสอบสิทธิ์, logging, panic recovery

#### config/
- `config.go`: อ่าน env, ตั้งค่า DB, JWT, port, debug mode
  - **Design:** ใช้ struct, viper/env, default fallback

#### utils/
- `pagination.go`: ฟังก์ชันแบ่งหน้า, limit, offset
- `password.go`: hash/check password, error log

### Data Flow & Interaction
- ทุก request → middleware (auth, role) → handler (validate, business rule) → model (DB) → response (JSON)
- ทุก event สำคัญ (เช่น status change) จะบันทึก timeline audit
- Seeder ใช้ transaction, upsert, clear ก่อน insert เพื่อ idempotency

### ตัวอย่างโค้ด
```go
// models.go
 type Application struct {
   ID        uuid.UUID `gorm:"primaryKey"`
   Status    string
   JobID     uuid.UUID
   UserID    uuid.UUID
   Timeline  []Timeline
   EvaluatedByHM bool
 }

// applications.go
 func ChangeStatus(c *gin.Context) {
   // ตรวจสอบ role
   // validate business rule
   // ถ้าไม่ผ่าน return error
   // ถ้าผ่าน update status, บันทึก timeline
 }

// dev.go
 func SeedAll() {
   // ใช้ transaction, clear table, insert ข้อมูลใหม่
 }
```

### Debug/Extend
- ถ้า API error: ดู log, timeline, response code, validate input
- ถ้าอยากเพิ่ม business rule: เพิ่ม logic ใน handler, ปรับ schema ใน model
- ถ้าอยาก extend entity: เพิ่ม field ใน struct, migrate DB

---

## Backend (be_clean/) — เจาะจุดสำคัญ
### 1. Business Rule Enforcement (HR offer/hired ต้องมี HM evaluation)
```go
// handlers/applications.go
func ChangeStatus(c *gin.Context) {
    var req ChangeStatusRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
        return
    }
    app, err := models.GetApplicationByID(req.ApplicationID)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Application not found"})
        return
    }
    // Business rule: ต้องมี HM evaluation ก่อน offer/hired
    if req.NewStatus == "offer" || req.NewStatus == "hired" {
        if !app.EvaluatedByHM {
            c.JSON(http.StatusForbidden, gin.H{"error": "HM must evaluate before offer/hired"})
            return
        }
    }
    // เปลี่ยนสถานะและบันทึก timeline
    app.Status = req.NewStatus
    models.SaveApplication(app)
    models.InsertTimeline(app.ID, "status_changed", req.NewStatus)
    c.JSON(http.StatusOK, app)
}
```

### 2. Timeline Audit (ทุก event สำคัญ)
```go
// models/models.go
func InsertTimeline(appID uuid.UUID, eventType, detail string) error {
    timeline := Timeline{
        ApplicationID: appID,
        EventType:     eventType,
        Detail:        detail,
        Date:          time.Now(),
    }
    return db.Create(&timeline).Error
}
```

### 3. Idempotent Seeder (dev.go)
```go
// handlers/dev.go
func SeedAll() {
    db.Transaction(func(tx *gorm.DB) error {
        tx.Exec("DELETE FROM applications")
        tx.Exec("DELETE FROM jobs")
        // Insert jobs, users, applications แบบ upsert
        for _, job := range jobs {
            tx.Clauses(clause.OnConflict{UpdateAll: true}).Create(&job)
        }
        // ...insert users, applications...
        return nil
    })
}
```

---

## Frontend (fe/) — เจาะจุดสำคัญ
### 1. Safeguard/Filter แถวผิดปกติ (ApplicantsTable.jsx)
```jsx
// src/components/hr/ApplicantsTable.jsx
const [showAll, setShowAll] = useState(false);
const filteredRows = rows.filter(row => row.evaluatedByHM);
const displayRows = showAll ? rows : filteredRows;

return (
  <>
    <button onClick={() => setShowAll(!showAll)}>
      {showAll ? 'ซ่อนแถวผิดปกติ' : 'แสดงทั้งหมด'}
    </button>
    <table>
      <tbody>
        {displayRows.map(row => (
          <tr key={row.id} className={row.evaluatedByHM ? '' : 'bg-yellow-100'}>
            <td>{row.name}</td>
            <td><ScoreBadge score={row.score} /></td>
            {/* ... */}
          </tr>
        ))}
      </tbody>
    </table>
  </>
);
```

### 2. Error Boundary (จับ error ทุกจุด)
```jsx
// src/components/common/ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    // log error
  }
  render() {
    if (this.state.hasError) {
      return <div>เกิดข้อผิดพลาด กรุณารีเฟรช</div>;
    }
    return this.props.children;
  }
}
```

### 3. API Integration & Token (api.js)
```js
// src/services/api.js
import axios from 'axios';
const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use(config => {
  config.headers.Authorization = localStorage.getItem('token');
  return config;
});
api.interceptors.response.use(null, error => {
  if (error.response.status === 401) {
    // redirect to login
  }
  return Promise.reject(error);
});
export default api;
```

---

## Scripts (scripts/) — เจาะจุดสำคัญ
### 1. Preview Diagnostics (SQL)
```sql
-- scripts/preview_diagnostics.sql
SELECT a.id, a.status, e.evaluatedat
FROM applications a
LEFT JOIN evaluations e ON a.id = e.application_id
WHERE (a.status IN ('offer','hired') AND e.evaluatedat IS NULL)
ORDER BY a.id;
```

### 2. Promote Apps (SQL, Transaction)
```sql
-- scripts/promote_apps.sql
BEGIN;
UPDATE applications SET status = 'interview' WHERE status = 'applied' AND EXISTS (
  SELECT 1 FROM evaluations e WHERE e.application_id = applications.id
);
INSERT INTO application_timelines (application_id, event_type, detail, date)
SELECT id, 'status_changed', 'promoted to interview', NOW()
FROM applications WHERE status = 'interview';
COMMIT;
```

### 3. PowerShell Runner (Backup + Promote)
```powershell
# scripts/run_promote.ps1
$backup = "/tmp/backup_$(Get-Date -Format yyyyMMdd_HHmmss).dump"
docker exec -i aats-postgres pg_dump -U aats_user -d aats_db -F c -f $backup
Write-Host "Backup done: $backup"
docker cp ./scripts/promote_apps.sql aats-postgres:/tmp/promote_apps.sql
docker exec -i aats-postgres psql -U aats_user -d aats_db -f /tmp/promote_apps.sql
Write-Host "Promote script executed"
```

---

## เจาะลึกทุกฟังก์ชัน/ไฟล์ Backend (be_clean/)
### models/
- **models.go**
  - Application: struct, status, job_id, user_id, timeline, evaluatedByHM
    ```go
    type Application struct {
      ID uuid.UUID `gorm:"primaryKey"`
      Status string
      JobID uuid.UUID
      UserID uuid.UUID
      Timeline []Timeline
      EvaluatedByHM bool
    }
    ```
    - ฟังก์ชัน: ใช้กับ GORM สำหรับ CRUD, relation กับ Timeline
  - Job: struct, title, description, status
  - User: struct, name, email, role, password (hash)
  - Timeline: struct, eventType, detail, date
- **database.go**
  - InitDB(): เชื่อมต่อ DB, auto-migrate
  - Transaction: ใช้กับ seeder, promote, mass update

### handlers/
- **applications.go**
  - CreateApplication(): รับข้อมูล, validate, insert, return JSON
  - ChangeStatus(): enforce business rule, update status, insert timeline
  - GetApplicationByID(): query by ID, join timeline
  - ListApplications(): query all, filter, paginate
- **auth.go**
  - Login(): รับ email/password, hash, JWT, return token
  - Register(): สร้าง user ใหม่, hash password
  - ValidateToken(): ตรวจสอบ JWT, return user/role
- **dev.go**
  - SeedAll(): clear table, insert jobs/users/applications, upsert
  - SeedJobs(), SeedUsers(): insert ตัวอย่าง
  - ResetDB(): ลบข้อมูลทั้งหมด
- **jobs.go**
  - CRUD job, validate status
- **evaluation.go**
  - CreateEvaluation(): insert คะแนน, update evaluatedByHM
  - ListEvaluations(): join application/job
- **notes.go**
  - CRUD note, link กับ application

### middleware/
- **auth.go**
  - AuthMiddleware(): ตรวจสอบ JWT, set user context
  - RoleMiddleware(): ตรวจสอบ role, block/allow
- **base.go**
  - Logging, panic recovery
- **role.go**
  - Guard เฉพาะ endpoint

### utils/
- **pagination.go**
  - Paginate(): รับ page/limit, return slice
- **password.go**
  - HashPassword(), CheckPasswordHash()

---

## เจาะลึกทุกฟังก์ชัน/ไฟล์ Frontend (fe/)
### src/components/
- **hr/ApplicantsTable.jsx**
  - render table, filter, toggle, color badge
  - map row, conditional class, call ScoreBadge
- **common/ScoreBadge.jsx**
  - รับ score, render สี, logic class
- **common/ErrorBoundary.jsx**
  - จับ error, render fallback
- **pages/hr/HRApplicantsPage.jsx**
  - fetch API, map data, handle loading/error

### src/services/
- **api.js**
  - get/post/put/delete, set token, intercept error

### src/hooks/
- useApplicants(): fetch, state, effect
- useJobs(): fetch, state
- useDebounce(): delay input

### src/utils/
- formatDate(), calculateScore(), sortBy()

---

## เจาะลึก Database (PostgreSQL)
### Table Schema
- **applications**
  - id (PK), status, job_id (FK), user_id (FK), evaluated_by_hm (bool)
- **jobs**
  - id (PK), title, description, status
- **users**
  - id (PK), name, email, role, password_hash
- **evaluations**
  - id (PK), application_id (FK), score, comment, evaluated_at
- **application_timelines**
  - id (PK), application_id (FK), event_type, detail, date
- **notes**
  - id (PK), application_id (FK), content, created_at

### Relationships
- Application → Job (many-to-one)
- Application → User (many-to-one)
- Application → Timeline (one-to-many)
- Application → Evaluation (one-to-many)
- Application → Note (one-to-many)

### Key Queries
- Join application + evaluation + timeline
  ```sql
  SELECT a.id, a.status, e.score, t.event_type, t.date
  FROM applications a
  LEFT JOIN evaluations e ON a.id = e.application_id
  LEFT JOIN application_timelines t ON a.id = t.application_id
  WHERE a.status = 'offer';
  ```
- Promote application (SQL)
  ```sql
  UPDATE applications SET status = 'interview'
  WHERE status = 'applied' AND EXISTS (
    SELECT 1 FROM evaluations e WHERE e.application_id = applications.id
  );
  ```

---

## ตัวอย่าง Scenario การทำงาน
- Candidate สมัครงาน → FE ส่งข้อมูล → BE validate + insert → DB เก็บ application + timeline
- HR ดูใบสมัคร → FE fetch → BE query + filter → DB join application/job/evaluation
- HM ประเมิน → FE ส่งคะแนน → BE insert evaluation + update evaluatedByHM → DB update + timeline
- HR กด offer → BE เช็ค evaluatedByHM → ถ้าไม่ผ่าน reject, ถ้าผ่าน update status + timeline
- Admin run promote script → SQL mass update + insert timeline

---

## Debug/Extend ทุกจุด
- Backend: log, timeline, error response, test handler/model
- Frontend: console, network, state, error boundary
- Database: query, join, transaction, restore

---

## วิธีคิดและการออกแบบ (Design Decisions)
- ทุกส่วนแยก concern ชัดเจน, ลด coupling, เพิ่ม maintainability
- Business rule enforce ทั้ง FE/BE, audit timeline ทุก event
- Seeder idempotent, รันซ้ำได้, ป้องกันข้อมูลซ้ำ
- สคริปต์ data fix มี preview, backup, restore, transaction safety
- UI/UX ออกแบบให้ intuitive, error-proof, role-based access
- Error handling ครบทุกชั้น: FE, BE, DB, script
- Logging และ timeline audit ทุก event สำคัญ
- ทุกฟังก์ชัน/ไฟล์มี comment, log, และ testable

---

## สรุป
- โค้ดทุกส่วนออกแบบให้ maintain, scale, debug ได้ง่าย, audit ได้ทุก event
- มีตัวอย่างโค้ด, workflow, และ scenario จริง
- ทุกคนในทีมต้องเข้าใจ flow, logic, และวิธีแก้ไขปัญหาในแต่ละส่วน
- พร้อมตอบคำถามเชิงลึกเกี่ยวกับโค้ดทุกไฟล์ ทุกฟังก์ชัน ทุก scenario
- สามารถ debug, extend, audit, และแก้ไขได้ทุกจุด

(หมายเหตุ: สามารถปรับ/เพิ่มรายละเอียดตาม style หรือเวลาที่อาจารย์กำหนดได้)
