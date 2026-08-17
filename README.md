# 🚀 AI Resume Analyzer (MERN Stack)

An intelligent, full-stack AI Resume Analyzer powered by the **MERN Stack** (MongoDB, Express.js, React/Next.js, Node.js) with **Google Gemini AI**.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (React 19), Tailwind CSS, Framer Motion, Lucide Icons, jsPDF
- **Backend**: Node.js v24, Express.js, Mongoose, Multer, `unpdf`, `mammoth`
- **Database**: MongoDB (Atlas / Local)
- **AI Engine**: Google Gemini API (`@google/generative-ai` with multi-model fallback & heuristic engine)
- **Authentication**: JWT & Google OAuth

---

## 📁 Project Structure

```
ai-resume-analyzer/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connection (Mongoose)
│   │   ├── controllers/     # Route controllers (Auth, Analysis, Roadmap, Interview, JobMatch)
│   │   ├── middleware/      # JWT authentication middleware
│   │   ├── models/          # Mongoose schemas (User, ResumeAnalysis, SkillRoadmap)
│   │   ├── routes/          # Express API router
│   │   └── services/        # AI & Document parsing services (Gemini, unpdf, mammoth)
│   ├── server.js            # Express server entry point
│   └── package.json         # Backend dependencies & scripts
├── frontend/                # Next.js 16 + React 19 web application
├── start.bat                # One-click dual server launcher
└── .env.example             # Environment variables reference
```

---

## ⚙️ Quick Start

### 1. Configure Environment Variables

Create `.env` in `backend/`:
```env
PORT=8000
GOOGLE_API_KEY=your_gemini_api_key_here
JWT_SECRET_KEY=your_jwt_secret_key_here
DATABASE_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net
MONGODB_DB_NAME=ai_resume_analyzer
```

### 2. Start Backend & Frontend

#### Windows Quick Start:
Double-click `start.bat` or run:
```cmd
start.bat
```

#### Manual Start:
```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000) and backend at [http://localhost:8000](http://localhost:8000).
