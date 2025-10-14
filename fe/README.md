# AATS Frontend

AATS (Advice Applicant Tracking System) Frontend - React application with Vite

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Navigate to frontend directory**
```bash
cd fe
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

Application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
fe/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── candidate/      # Candidate-specific components
│   │   ├── hm/            # Hiring Manager components
│   │   ├── hr/            # HR components
│   │   ├── shared/        # Shared components
│   │   └── ui/            # shadcn/ui components
│   ├── pages/             # Page components
│   │   ├── candidate/     # Candidate pages
│   │   ├── hm/           # HM pages
│   │   ├── hr/           # HR pages
│   │   └── shared/       # Shared pages (login, etc.)
│   ├── data/             # Mock data & constants
│   ├── services/         # API services
│   ├── utils/            # Utility functions
│   ├── styles/           # Global styles
│   ├── App.jsx           # Main App component
│   └── main.jsx          # Application entry point
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎨 UI Components

Built with **shadcn/ui** and **TailwindCSS**:

### Component Categories
- **Forms**: Input, Textarea, Select, Checkbox, Radio
- **Navigation**: Breadcrumb, Navigation Menu, Tabs
- **Layout**: Card, Sheet, Dialog, Accordion
- **Feedback**: Alert, Toast, Badge, Progress
- **Data Display**: Table, Avatar, Calendar

### Custom Components
- **ApplicationCard** - Display job applications
- **JobCard** - Display job postings
- **StatusTimeline** - Show application progress
- **EvaluationForm** - HM evaluation interface
- **Navigation** - Role-based navigation

## 🔐 Authentication & Routing

### Protected Routes
- **Candidate Routes**: `/candidate/*`
- **HR Routes**: `/hr/*`
- **HM Routes**: `/hm/*`

### Public Routes
- `/login` - User login
- `/register` - User registration (candidates only)

## 📊 Pages Overview

### Candidate Pages
```
/candidate/jobs              - Browse job postings
/candidate/apply/:jobId      - Apply for specific job
/candidate/track             - Track application status
/candidate/history           - Application history
/candidate/profile           - Edit profile
```

### HR Pages
```
/hr/dashboard               - HR dashboard & analytics
/hr/jobs                    - Manage job postings
/hr/jobs/create             - Create new job posting
/hr/jobs/:id/edit           - Edit job posting
/hr/applicants              - View all applications
/hr/applicants/:id          - Application details
```

### HM Pages
```
/hm/dashboard               - HM dashboard
/hm/evaluations             - Applications to evaluate
/hm/evaluate/:id            - Evaluation form
/hm/history                 - Evaluation history
```

## 🌐 API Integration

### Base Configuration
```javascript
// src/services/api.js
const API_BASE_URL = 'http://localhost:8080/api'
```

### Service Files
- `authService.js` - Authentication APIs
- `jobService.js` - Job management APIs
- `applicationService.js` - Application APIs
- `userService.js` - User profile APIs

### Authentication
JWT token stored in localStorage:
```javascript
// Automatically included in API requests
Authorization: Bearer <token>
```

## 🎯 Key Features

### For Candidates
- ✅ Browse and search job postings
- ✅ Multi-step application wizard
- ✅ Real-time status tracking
- ✅ Application history
- ✅ Profile management

### For HR Staff
- ✅ Job posting management (CRUD)
- ✅ Application review and filtering
- ✅ Status management
- ✅ Notes and comments
- ✅ Dashboard analytics

### For Hiring Managers
- ✅ Application evaluation
- ✅ Scoring system (1-5 scale)
- ✅ Evaluation history
- ✅ Dashboard metrics

## 🎨 Styling & Theming

### TailwindCSS Configuration
- **Design System**: Consistent spacing, colors, typography
- **Dark Mode**: Class-based dark mode support
- **Responsive**: Mobile-first responsive design
- **Custom Colors**: Application status colors

### CSS Variables
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 98%;
  /* ... */
}
```

## 🔧 Build & Deployment

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Production Build
```bash
npm run build
```

Output will be in `dist/` directory.

### Environment Variables
Create `.env.local` for local development:
```env
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=AATS Frontend
```

## 🧪 Testing

### Component Testing
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Run tests
npm run test
```

## 📱 Mobile Support

- **Responsive Design**: Works on all screen sizes
- **Touch Friendly**: Optimized for mobile interactions
- **Progressive Enhancement**: Graceful degradation

## 🔍 Accessibility

- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Proper focus handling
- **Color Contrast**: WCAG 2.1 AA compliance

## 🚀 Performance

- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Components loaded on demand
- **Optimized Images**: WebP support with fallbacks
- **Caching**: Efficient API response caching

## 🔗 Related

- Backend API: `/be` - Go REST API
- Documentation: `SYSTEM-DOCUMENTATION.md`
- Design System: `COLOR-GUIDE.md`

---

**Last Updated:** October 11, 2025  
**Frontend Version:** 1.0.0  
**Status:** 🟢 Production Ready