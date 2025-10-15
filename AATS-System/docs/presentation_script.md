# สคริปต์พรีเซนต์โปรเจกต์ AATS (แบ่ง 5 คน แบบครบทุกประเด็น)

## โครงสร้างการพูด (5 คน)
1. ภาพรวมระบบและปัญหาที่แก้ไข (เปิด)
2. สถาปัตยกรรมและเทคโนโลยี (ภาพรวมโค้ด)
3. Frontend (UI/UX, React, Flow, Safeguard)
4. Backend (API, Business Logic, Rules, Seeder)
5. Database, Scripts, Data Fix, DevOps, Q&A เตรียมตอบคำถาม

---

### คนที่ 1: ภาพรวมระบบและปัญหาที่แก้ไข

"สวัสดีครับ/ค่ะอาจารย์และคณะกรรมการ วันนี้กลุ่มของเราขอเสนอโปรเจกต์ AATS - Applicant Tracking System ซึ่งเป็นระบบจัดการการสมัครงานแบบครบวงจร จุดเด่นคือการแก้ปัญหาการจัดการผู้สมัครงานที่ซับซ้อนในองค์กร เช่น การคัดกรอง, การประเมิน, การเสนอ, และการรับเข้าทำงาน โดยระบบนี้ช่วยให้ทุกฝ่ายทำงานร่วมกันได้อย่างมีประสิทธิภาพและโปร่งใส"

"เราวิเคราะห์ pain point จริง เช่น HR เปลี่ยนสถานะผิดขั้นตอน, ข้อมูลไม่ครบ, หรือผู้สมัครตกหล่น ระบบนี้จึงออกแบบให้มี business rules ที่บังคับทุกขั้นตอนและมี audit trail ผ่าน timeline"

"User Stories หลัก:
- ผู้สมัคร (Candidate) สมัครงาน, อัปโหลดเอกสาร, ติดตามสถานะ
- HR สร้าง/ปิดประกาศงาน, คัดกรอง, เปลี่ยนสถานะ, ดู timeline
- HM ประเมินผู้สมัคร, ให้คะแนน, เพิ่มความคิดเห็น
"

"ระบบรองรับการใช้งานหลาย role พร้อมกัน มีการแจ้งเตือนสถานะและ error handling ที่ชัดเจน เช่น ถ้า HR กด offer โดยไม่มี HM evaluation ระบบจะ reject และแจ้งเตือนทันที"

**Q&A เตรียมตอบ:**
- Q: ระบบนี้แก้ปัญหาอะไรได้บ้าง?
  A: ลดข้อผิดพลาด, เพิ่มความเร็ว, สร้างความโปร่งใส, audit ได้ทุกขั้นตอน, รองรับการทำงานหลายฝ่าย
- Q: ถ้า HR หรือ HM ทำผิด flow จะเกิดอะไร?
  A: ระบบจะ reject และแจ้งเตือนทันที (ทั้ง FE/BE)
- Q: ถ้าผู้สมัครลืมแนบเอกสารหรือข้อมูลไม่ครบ?
  A: ระบบจะ validate และแจ้งเตือนก่อน submit

---

### คนที่ 2: สถาปัตยกรรมและเทคโนโลยี (ภาพรวมโค้ด)

"ระบบนี้ใช้สถาปัตยกรรมแยก frontend-backend โดย backend เป็น Go (Gin + GORM) เชื่อมต่อ PostgreSQL ส่วน frontend เป็น React + Vite + TailwindCSS มี docker-compose สำหรับ dev environment และ scripts สำหรับ data fix"

"Technical Stack:
- Backend: Go 1.21, Gin, GORM, JWT, PostgreSQL
- Frontend: React 18, Vite, TailwindCSS, shadcn/ui, Axios
- DevOps: Docker, docker-compose, PowerShell/Bash scripts
"

"โครงสร้างโค้ดแบ่งชัดเจน เช่น models, handlers, middleware, utils ใน backend และ components, pages, services ใน frontend ทุกส่วนมี separation of concerns และสามารถ maintain/scale ได้ง่าย มี README และเอกสารประกอบครบถ้วน"

"ตัวอย่างโฟลเดอร์:
- be_clean/models/models.go: กำหนด schema
- be_clean/handlers/: API endpoint
- fe/src/components/: UI component
- scripts/: SQL/PowerShell สำหรับแก้ไขข้อมูล
"

**Q&A เตรียมตอบ:**
- Q: โค้ด backend กับ frontend เชื่อมกันอย่างไร?
  A: ผ่าน RESTful API (JSON contract) มีการจัดการ error และ response code
- Q: ถ้าอยาก debug หรือแก้ business rule ต้องดูไฟล์ไหน?
  A: ดูที่ `be_clean/handlers/` สำหรับ logic, `models.go` สำหรับ schema, และ `fe/src/components/` สำหรับ UI logic
- Q: ถ้าอยาก deploy production ต้องปรับอะไร?
  A: ปรับ env, ใช้ docker-compose, ตรวจสอบ security (เช่น JWT secret, DB access)

---

### คนที่ 3: Frontend (UI/UX, React, Flow, Safeguard)

"Frontend ใช้ React 18 + Vite + TailwindCSS ออกแบบ UI ให้ responsive และ intuitive โดยแบ่ง role เป็น Candidate, HR, HM ซึ่งแต่ละ role จะเห็นเมนูและฟีเจอร์ที่ต่างกัน เช่น HR เห็นหน้าจอจัดการผู้สมัคร มีเครื่องมือกรอง/ค้นหา/เรียงข้อมูล HM เห็นหน้าประเมินและให้คะแนน"

"Flow หลัก:
- Candidate: สมัครงาน → ติดตามสถานะ → ดูผลสัมภาษณ์
- HR: ดูใบสมัคร → คัดกรอง → เปลี่ยนสถานะ → ดู timeline
- HM: ประเมิน → ให้คะแนน → เพิ่มความคิดเห็น
"

"มี logic safeguard เช่น หน้า HR จะซ่อนแถว offer/hired ที่ไม่มี HM evaluation โดย default เพื่อป้องกันความสับสน และมี toggle ให้เปิดดูได้ถ้าต้องการ ทุก component ถูกออกแบบให้ reusable และ maintainable มี error boundary และ loading state ครบ"

"ตัวอย่างโค้ด:
- fe/src/components/hr/ApplicantsTable.jsx: filter แถวที่ข้อมูลไม่สมบูรณ์
- fe/src/pages/hr/HRApplicantsPage.jsx: mapping ข้อมูลจาก API
"

**Q&A เตรียมตอบ:**
- Q: ถ้า FE แสดงข้อมูลผิดหรือไม่ตรงกับ backend จะเกิดอะไร?
  A: FE มี logic filter/safeguard แต่สุดท้าย backend เป็นตัวบังคับ business rule
- Q: ถ้าอยากเพิ่มฟีเจอร์ใหม่ใน FE ต้องแก้ตรงไหน?
  A: เพิ่ม component ใน `fe/src/components/` และเชื่อม API ใน `services/`
- Q: ถ้าเจอ error หรือ loading state จัดการอย่างไร?
  A: มี error boundary, loading spinner, และแจ้งเตือนผู้ใช้

---

### คนที่ 4: Backend (API, Business Logic, Rules, Seeder)

"Backend ใช้ Go 1.21 + Gin + GORM เชื่อมต่อ PostgreSQL มี API ที่บังคับ business rules เช่น HR ต้องรอ HM ประเมินก่อนถึงจะ offer/hired ได้ มีการ validate ทุก request และบันทึก timeline ทุก event เพื่อ audit ได้"

"Business Logic หลัก:
- ตรวจสอบสิทธิ์และ role ทุก endpoint
- validate ข้อมูลก่อนเปลี่ยนสถานะ
- บันทึก timeline ทุก event
- มี dev seeder ที่ idempotent สามารถรันซ้ำได้โดยไม่ซ้ำข้อมูล และ endpoint สำหรับ seed ข้อมูลตัวอย่างเพื่อทดสอบ flow จริง
"

"ตัวอย่างโค้ด:
- be_clean/handlers/applications.go: logic เปลี่ยนสถานะ
- be_clean/models/models.go: schema และ unique constraint
- be_clean/handlers/dev.go: seeder แบบ idempotent
"

**Q&A เตรียมตอบ:**
- Q: ถ้าอยากเปลี่ยน business rule เช่น เพิ่มขั้นตอนใหม่ ต้องแก้ตรงไหน?
  A: เพิ่ม logic ใน handler ที่เกี่ยวข้อง เช่น `handlers/applications.go` และปรับ schema ใน `models.go` ถ้าจำเป็น
- Q: ถ้า HR กด offer โดยไม่มี HM evaluation จะเกิดอะไร?
  A: API จะ reject request และแจ้ง error กลับไป FE
- Q: ถ้าอยาก seed ข้อมูลใหม่ต้องทำอย่างไร?
  A: เรียก endpoint dev seeder หรือปรับฟังก์ชันใน `dev.go`

---

### คนที่ 5: Database, Scripts, Data Fix, DevOps, Q&A เตรียมตอบคำถาม

"Database ใช้ PostgreSQL มี docker-compose สำหรับ dev environment ในโฟลเดอร์ scripts มี SQL และ PowerShell สำหรับตรวจสอบและแก้ไขข้อมูล เช่น preview_diagnostics.sql สำหรับดูข้อมูลที่ไม่สอดคล้อง, promote_apps.sql สำหรับโปรโมตสถานะ application ที่มี evaluation แล้วแต่ยังไม่ถึง interview และ run_promote.ps1 สำหรับสำรองและรันสคริปต์แบบปลอดภัย"

"ตัวอย่างคำสั่งจริง:
- สำรอง DB: `docker exec -i aats-postgres pg_dump -U aats_user -d aats_db -F c -f /tmp/backup.dump`
- รันสคริปต์: `docker cp ./scripts/promote_apps.sql aats-postgres:/tmp/promote_apps.sql` และ `docker exec -i aats-postgres psql -U aats_user -d aats_db -f /tmp/promote_apps.sql`
- กู้คืน: `docker exec -i aats-postgres pg_restore -U aats_user -d aats_db -c /tmp/backup.dump`
"

"Workflow แนะนำ:
1. รัน preview_diagnostics.sql → ดูผล
2. สำรอง DB (pg_dump)
3. รัน promote_apps.sql หรือ run_promote.ps1
4. ตรวจสอบผลด้วย SELECT/Timeline
5. Restore ถ้าจำเป็น
"

"Error Handling:
- ทุกสคริปต์มี transaction และ rollback ได้
- มี timeline แจ้งเตือนทุก event สำคัญ
- มี warning timeline สำหรับข้อมูลที่ไม่สมบูรณ์
"

**Q&A เตรียมตอบ:**
- Q: ถ้าข้อมูลผิดพลาดจะกู้คืนได้ไหม?
  A: มีไฟล์สำรองจาก pg_dump และสามารถ restore ด้วย pg_restore ได้ทันที
- Q: ถ้าอยาก mass-fix ข้อมูลต้องทำอย่างไร?
  A: รัน preview_diagnostics.sql → สำรอง DB → รัน promote_apps.sql → ตรวจสอบผล → restore ถ้าจำเป็น
- Q: ถ้าอยาก debug หรือแก้ไขข้อมูลใน DB ต้องดูตรงไหน?
  A: ดูที่ scripts/ และใช้ docker exec + psql ใน container
- Q: ถ้าเจอ error ในการรันสคริปต์ต้องทำอย่างไร?
  A: ตรวจสอบ transaction, ดู logs, restore จาก backup

---

## Security & Best Practices

### 1. JWT Authentication & Role Guard
- ใช้ JWT (JSON Web Token) สำหรับ session และการตรวจสอบสิทธิ์
- ทุก request ที่ต้องการ auth จะต้องมี token ใน header
- ตัวอย่าง middleware ตรวจสอบ JWT และ role:
```go
// middleware/auth.go
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")
        user, err := ValidateToken(token)
        if err != nil {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
            return
        }
        c.Set("user", user)
        c.Next()
    }
}
func RoleGuard(role string) gin.HandlerFunc {
    return func(c *gin.Context) {
        user := c.MustGet("user").(User)
        if user.Role != role {
            c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Insufficient permission"})
            return
        }
        c.Next()
    }
}
```

### 2. Password Hashing
- ใช้ bcrypt ในการ hash password ก่อนเก็บลง database
- ไม่เก็บ plain password
- ตัวอย่างฟังก์ชัน hash/check:
```go
// utils/password.go
func HashPassword(password string) (string, error) {
    bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
    return string(bytes), err
}
func CheckPasswordHash(password, hash string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
    return err == nil
}
```

### 3. Input Validation & Sanitization
- Validate ทุก input ที่มาจาก user ก่อนใช้งาน
- ใช้ ShouldBindJSON, regex, length check, type check
- ตัวอย่าง:
```go
// handlers/applications.go
if err := c.ShouldBindJSON(&req); err != nil {
    c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
    return
}
if len(req.Name) > 100 {
    c.JSON(http.StatusBadRequest, gin.H{"error": "Name too long"})
    return
}
```

### 4. SQL Injection Prevention
- ใช้ GORM ORM สำหรับ query, ไม่ใช้ string concat
- ทุก query parameterized
- ตัวอย่าง:
```go
// models/database.go
err := db.Where("email = ?", email).First(&user).Error
```

### 5. Secure API Design
- ใช้ HTTPS ใน production
- จำกัดสิทธิ์แต่ละ endpoint ด้วย role guard
- ไม่ return ข้อมูล sensitive เช่น password hash, token
- ตรวจสอบ error และ log ทุก event สำคัญ

### 6. .env & Secret Management
- เก็บ secret (JWT, DB password) ใน .env, ไม่ hardcode ในโค้ด
- ตัวอย่าง .env:
```
JWT_SECRET=supersecretkey
DB_PASSWORD=strongpassword
```

### 7. Logging & Monitoring
- Log ทุก event สำคัญ, error, timeline
- ไม่ log ข้อมูล sensitive
- ตัวอย่าง log:
```go
log.Printf("User %s changed status to %s", user.ID, req.NewStatus)
```

---

## Testing & Quality Assurance

### 1. Backend (Go) Unit & Integration Testing
- ใช้ Go test (`testing` package) สำหรับ unit/integration test
- Mock database ด้วย `sqlmock` หรือใช้ test DB
- ตัวอย่าง unit test ฟังก์ชัน business rule:
```go
// handlers/applications_test.go
func TestChangeStatus_RequireHM(t *testing.T) {
    app := Application{Status: "applied", EvaluatedByHM: false}
    req := ChangeStatusRequest{NewStatus: "offer"}
    err := ChangeStatusLogic(app, req)
    if err == nil {
        t.Errorf("Should reject offer if not evaluated by HM")
    }
}
```
- Integration test: ทดสอบ API endpoint จริง, ตรวจสอบ response code, DB state

### 2. Frontend (React) Testing
- ใช้ Jest + React Testing Library สำหรับ unit/component test
- Mock API ด้วย MSW (Mock Service Worker)
- ตัวอย่าง test component filter:
```jsx
// ApplicantsTable.test.jsx
import { render, screen } from '@testing-library/react';
import ApplicantsTable from './ApplicantsTable';
const rows = [
  { id: 1, name: 'A', evaluatedByHM: true },
  { id: 2, name: 'B', evaluatedByHM: false }
];
test('filters out unevaluated rows by default', () => {
  render(<ApplicantsTable rows={rows} />);
  expect(screen.getByText('A')).toBeInTheDocument();
  expect(screen.queryByText('B')).toBeNull();
});
```

### 3. Test Strategy & Coverage
- ทุกฟังก์ชันสำคัญต้องมี unit test
- ทุก flow สำคัญ (สมัคร, ประเมิน, offer) มี integration test
- ใช้ coverage tool (`go test -cover`, `jest --coverage`) ตรวจสอบ
- ทดสอบ error case, edge case, invalid input

### 4. Error Simulation & Mock Data
- Backend: mock DB, simulate error (เช่น DB down, invalid input)
- Frontend: mock API, simulate network error, loading state
- ตัวอย่าง simulate error:
```go
// applications_test.go
func TestChangeStatus_DBError(t *testing.T) {
    // mock db return error
    // assert error handled
}
```
```jsx
// ApplicantsTable.test.jsx
// mock API return 500, check error boundary
```

### 5. CI/CD Integration
- รัน test อัตโนมัติทุกครั้งที่มีการ push/PR
- ถ้า test fail จะไม่ deploy
- ตัวอย่าง workflow:
```yaml
# .github/workflows/test.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run backend tests
        run: cd be_clean && go test ./...
      - name: Run frontend tests
        run: cd fe && npm test
```

---

## Performance & Scalability

### 1. Database Indexing & Query Optimization
- ใช้ index ใน field ที่ query บ่อย เช่น status, job_id, user_id
- ตัวอย่างการสร้าง index:
```sql
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_job_id ON applications(job_id);
```
- ใช้ EXPLAIN ANALYZE ตรวจสอบ query plan
- ตัวอย่าง query ที่ optimize:
```sql
SELECT id, status FROM applications WHERE status = 'offer' LIMIT 50 OFFSET 0;
```

### 2. Pagination & Data Fetching
- ทุก API ที่ return list ใช้ pagination (limit/offset)
- ลดการโหลดข้อมูลทีละมาก ๆ
- ตัวอย่าง backend:
```go
// utils/pagination.go
func Paginate(page, pageSize int) (limit, offset int) {
    limit = pageSize
    offset = (page - 1) * pageSize
    return
}
```
- ตัวอย่าง frontend:
```jsx
// fe/src/hooks/useApplicants.js
const [page, setPage] = useState(1);
useEffect(() => {
  api.get(`/applications?page=${page}&limit=20`).then(...)
}, [page]);
```

### 3. Async API & Non-blocking Operations
- ใช้ goroutine ใน Go สำหรับงานที่ต้องรอ เช่น ส่งอีเมล, log, timeline
- ตัวอย่าง:
```go
// handlers/applications.go
 go models.InsertTimeline(app.ID, "status_changed", req.NewStatus)
```
- FE ใช้ async/await, loading spinner, ไม่ block UI

### 4. Caching (ถ้ามี)
- สามารถใช้ Redis/Memcached สำหรับ cache job list, user profile
- ตัวอย่าง pseudo-code:
```go
// jobs.go
if cache.Has("job_list") {
  return cache.Get("job_list")
}
jobs := db.Find(&Job{})
cache.Set("job_list", jobs)
```

### 5. Horizontal Scalability
- ออกแบบ API stateless, scale ได้หลาย instance
- ใช้ docker-compose, สามารถเพิ่ม replica ได้
- ตัวอย่าง docker-compose:
```yaml
services:
  backend:
    image: aats-backend
    deploy:
      replicas: 3
```

### 6. Monitoring & Bottleneck Detection
- ใช้ log, metric, query slow log, error log
- ตัวอย่าง log query:
```sql
SELECT * FROM pg_stat_activity WHERE state = 'active';
```
- ใช้ tool เช่น Grafana, Prometheus, pgAdmin สำหรับ monitor

### 7. Practical Tips
- Query เฉพาะ field ที่จำเป็น ไม่ใช้ SELECT *
- ใช้ batch insert/update สำหรับ mass data
- ตรวจสอบ memory leak, goroutine leak ใน Go
- FE: ใช้ lazy load, virtual scroll สำหรับ list ยาว

---

## Deployment & CI/CD

### 1. Environment Configuration
- ใช้ไฟล์ `.env` สำหรับ config ที่เปลี่ยนตาม environment (dev, prod)
- ตัวอย่าง .env:
```
DB_HOST=localhost
DB_USER=aats_user
DB_PASSWORD=secret
JWT_SECRET=supersecretkey
```
- Backend อ่าน config ผ่าน `config.go` (ใช้ viper/env)

### 2. Docker & docker-compose
- ใช้ Dockerfile สำหรับ build backend/frontend เป็น image
- ตัวอย่าง Dockerfile (backend):
```dockerfile
FROM golang:1.21-alpine
WORKDIR /app
COPY . .
RUN go build -o main .
CMD ["./main"]
```
- ตัวอย่าง docker-compose.yml:
```yaml
version: '3.8'
services:
  backend:
    build: ./be_clean
    env_file: .env
    ports:
      - "8080:8080"
    depends_on:
      - db
  frontend:
    build: ./fe
    ports:
      - "5173:5173"
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: aats_user
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: aats_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

### 3. Deployment Workflow
- Build image → Push to registry (ถ้ามี) → Deploy ด้วย docker-compose หรือ cloud
- ตัวอย่างคำสั่ง deploy:
```sh
docker-compose up -d --build
```
- ตรวจสอบ log:
```sh
docker-compose logs backend
```

### 4. CI/CD Pipeline
- ใช้ GitHub Actions สำหรับ build/test/deploy อัตโนมัติ
- ตัวอย่าง workflow:
```yaml
# .github/workflows/deploy.yml
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build backend
        run: cd be_clean && docker build -t aats-backend .
      - name: Build frontend
        run: cd fe && docker build -t aats-frontend .
      - name: Run tests
        run: cd be_clean && go test ./... && cd ../fe && npm test
      - name: Deploy
        run: docker-compose up -d --build
```
- สามารถเพิ่ม step สำหรับ push image ไปยัง Docker Hub หรือ cloud provider

### 5. Best Practices
- แยก config ตาม environment, ไม่ hardcode secret
- รัน test ก่อน deploy ทุกครั้ง
- ใช้ tag/version ใน image เพื่อ rollback ได้
- ตรวจสอบ log และ monitor หลัง deploy

---

## Monitoring & Logging

### 1. Logging Event, Error, Timeline, Audit Trail
- Backend log ทุก event สำคัญ เช่น status change, error, timeline
- ใช้ log.Printf, gin logger, หรือ external log service (ELK, Grafana)
- ตัวอย่าง log format:
```go
log.Printf("[EVENT] User %s changed status to %s for Application %s", user.ID, req.NewStatus, app.ID)
log.Printf("[ERROR] %v", err)
```
- Timeline/Audit: ทุกการเปลี่ยนแปลงจะ insert timeline record ใน DB
- ตัวอย่าง query log timeline:
```sql
SELECT * FROM application_timelines WHERE application_id = 'xxx' ORDER BY date DESC;
```
- FE log error ด้วย error boundary, console.error

### 2. Monitoring Tools
- ใช้ pgAdmin, Grafana, Prometheus สำหรับ monitor DB, API, error rate
- สามารถตั้ง alert เมื่อ error หรือ latency สูง

---

## API Documentation

### 1. OpenAPI/Swagger
- ใช้ Swagger/OpenAPI สำหรับ generate doc จาก backend
- ตัวอย่าง annotation ใน Go:
```go
// @Summary Change application status
// @Description Change status with business rule enforcement
// @Param application_id path string true "Application ID"
// @Param new_status body string true "New Status"
// @Success 200 {object} Application
// @Failure 400,403 {object} ErrorResponse
// @Router /applications/{id}/status [put]
```
- ใช้ tool เช่น swaggo/swag (`swag init`) เพื่อ generate doc
- Doc จะมี endpoint, request/response, error code

### 2. Endpoint สำคัญ
- POST /auth/login — login, return JWT
- GET /applications — list, filter, paginate
- PUT /applications/{id}/status — change status (enforce rule)
- POST /evaluations — add evaluation
- GET /application_timelines/{id} — audit trail

---

## User Experience & Accessibility

### 1. UI/UX Design Principles
- FE ออกแบบให้ใช้งานง่าย, intuitive, role-based menu
- Responsive: ใช้ TailwindCSS, media query, flex/grid
- Accessibility: ใช้ semantic HTML, aria-label, keyboard navigation
- ตัวอย่าง:
```jsx
<button aria-label="เปลี่ยนสถานะ" tabIndex={0}>Offer</button>
```
- มี loading spinner, error boundary, feedback ทุก action
- สี/contrast เหมาะสม, ขนาดตัวอักษรอ่านง่าย

---

## Troubleshooting & FAQ

### 1. ปัญหาที่เจอบ่อย & วิธีแก้
- API error 401/403: ตรวจสอบ token, role guard, JWT expiry
- DB connection fail: ตรวจสอบ .env, docker-compose, port
- FE ไม่แสดงข้อมูล: ตรวจสอบ API response, console error, network tab
- Seeder ไม่ทำงาน: ตรวจสอบ transaction, log, DB state
- Timeline ไม่ขึ้น: ตรวจสอบ insert timeline, query log

### 2. Q&A สำหรับการ debug
- Q: ถ้า API error จะดู log ตรงไหน?
  A: ดู backend log (stdout, log file), timeline DB, FE console
- Q: ถ้าข้อมูลไม่ตรงกับ DB จะ debug ยังไง?
  A: Query DB โดยตรง, ตรวจสอบ API response, log event
- Q: ถ้า deploy แล้วระบบล่ม ต้องทำอะไร?
  A: ดู log ทุก service, rollback image, ตรวจสอบ config
- Q: ถ้าอยากดู audit trail ของผู้สมัคร?
  A: Query application_timelines ตาม application_id

---

## สรุป
- สคริปต์นี้แบ่งบทพูดตาม logic flow ของระบบ ครอบคลุมทุกหัวข้อสำคัญ
- มีตัวอย่างคำสั่งจริงสำหรับ scripts/ และการแก้ไขข้อมูล
- เตรียม Q&A สำหรับตอบคำถามอาจารย์แบบละเอียดสุด ๆ
- ทุกคนสามารถ hand-off ต่อกันได้อย่างลื่นไหล
- มี user story, flow, error handling, และตัวอย่างโค้ดครบ

(หมายเหตุ: สามารถปรับ/เพิ่มรายละเอียดตาม style หรือเวลาที่อาจารย์กำหนดได้)