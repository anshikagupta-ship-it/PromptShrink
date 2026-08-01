# ContextZero — Intelligent LLM Context Compression Engine

ContextZero is an Ultra-Low Resource LLM Context Compression Engine that sits between user applications and LLMs. It algorithmically reduces prompt context token size by 70%+ while preserving exact user intent, instructions, facts, and constraints.

---

## ⚡ Core Value Proposition
> **"Less context. Same intent."**

ContextZero removes redundant tokens, boilerplate logs, and conversational filler before sending prompts to target LLMs—reducing API costs and accelerating inference speed.

---

## 🌟 Key Features

1. **Public Product-Focused SaaS Landing Page (`/`)**:
   - Navbar, Hero (*Less context. Same intent.*), Interactive Live Prompt Compressor (Main Attraction with live token measurements), What ContextZero Does, How It Works, Real Before vs After Results, YOUR RESULT statistics table, What Was Removed/Preserved breakdown, Why Tokens Matter, and Footer.

2. **Google Identity Services Authentication (`/login`)**:
   - Server-side Google ID Token signature & issuer verification using official `google-auth-library` (`OAuth2Client.verifyIdToken`).
   - SQLite user persistence (`users` table with unique `google_sub` constraint).
   - Server-managed opaque session ID stored in SQLite (`sessions` table) and issued via `HttpOnly`, `SameSite: Lax` secure cookies.

3. **ContextZero App Workspace (`/app/*`)**:
   - ChatGPT-inspired dark obsidian workspace with Model selector (`GPT-4o`, `Claude 3.5 Sonnet`, `Llama 3 70B`), Segmented mode control (`Conservative 50%`, `Balanced 70%`, `Aggressive 85%`), Target 70% badge, and sliding **Compression Inspector Drawer** (Prompt Diff, Protected Information, Engine Pipeline Checklist).
   - Claude-style AI thinking animation (`✦ Optimizing context & thinking...`).

4. **Benchmarks & Evaluation Suite (`/app` -> Benchmarks)**:
   - Reproducible evaluation dataset test suite for Server Logs, Support History, and API Specs.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, React Router DOM v7
- **Backend**: Node.js, Express, `google-auth-library`, `cookie-parser`, `cors`
- **Database**: SQLite3 (`backend/data/contextzero.db`)
- **Port Setup**: Frontend (`http://localhost:5173`), Backend (`http://localhost:8080`)

---

## 🚀 Getting Started

### 1. Environment Configuration

#### Backend (`backend/.env`):
```env
PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
SESSION_SECRET=super_secret_opaque_session_key_contextzero_2026
```

#### Frontend (`frontend/.env`):
```env
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
VITE_API_BASE_URL=http://localhost:8080
```

### 2. Running Locally

#### Terminal 1 — Backend Server:
```bash
cd backend
npm install
npm run dev
```

#### Terminal 2 — Frontend Client:
```bash
cd frontend
npm install
npm run dev
```

---

## 📄 Documentation Directory (`md files/`)
- `01_PROBLEM_STATEMENT.md` — Problem analysis of LLM context bloating.
- `02_SOLUTION.md` — ContextZero algorithmic compression solution.
- `03_USER_WORKFLOW.md` — User journey & interactive workflow.
- `04_COMPRESSION_ALGORITHM.md` — Token analysis, deduplication & constraint preservation.
- `05_SYSTEM_ARCHITECTURE.md` — System architecture & data flow diagram.
- `08_DATABASE_SCHEMA.md` — SQLite `users` and `sessions` database schema.
- `09_FRONTEND_SPEC.md` — Comprehensive frontend design system & routing spec.
- `10_BACKEND_API_ENDPOINTS.md` — REST API endpoint specification (`/api/auth/google`, `/api/auth/me`, `/api/v1/compress`).
- `10_BACKEND_SPEC.md` — Backend pipeline architecture & middleware specs.
