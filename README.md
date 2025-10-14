
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