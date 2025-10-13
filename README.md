
# AATS - Applicant Tracking System

## 📋 ภาพรวมโปรเจกต์

AATS (Applicant Tracking System) เป็นระบบจัดการการสมัครงานแบบครบวงจร ที่ออกแบบมาเพื่อช่วยให้องค์กรสามารถจัดการกระบวนการรับสมัครงานได้อย่างมีประสิทธิภาพ

### 🎯 วัตถุประสงค์หลัก
- ลดความซับซ้อนในกระบวนการรับสมัครงาน
- เพิ่มประสิทธิภาพในการจัดการผู้สมัครงาน
- สร้างประสบการณ์ที่ดีสำหรับผู้สมัครและผู้ใช้งานภายในองค์กร
- ติดตามสถานะการสมัครงานแบบ Real-time

## 🚀 เทคโนโลยีที่ใช้

### Backend
The original backend folder (`be/`) has been removed from this workspace. The frontend (`fe/`) ships with mock data and adapters that allow running the UI without a local backend. If you need the backend later, restore it from your backups or the original repository.

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
├── fe/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/   # React Components
│   │   ├── pages/        # Page Components
│   │   ├── services/     # API Services (adapters use mock data)
│   │   └── utils/        # Utility Functions
│   ├── package.json      # Node Dependencies
│   └── vite.config.js    # Vite Configuration
│
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

# Install dependencies
# Setup environment
# Start server
### Backend
The backend has been removed from this workspace. The frontend can run with mock data. See `fe/README.md` for running the frontend with mocks or pointing to a remote API.

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
 - [สรุปโครงการ (ภาษาไทย)](./docs/PROJECT_SUMMARY_TH.md)

## 🚀 Quick Start

```bash
# Start Frontend
cd fe && npm install && npm run dev

# Access Application
# Frontend: http://localhost:5173
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