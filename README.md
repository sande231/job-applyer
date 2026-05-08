# JobAssist AI

A full-stack job application assistant powered by Claude AI. Upload your resume, search for jobs, auto-fill application forms, and track every application — all in one place.

## Features

- **Resume Upload** — Drag-and-drop PDF/TXT parsing via Claude AI
- **Job Search** — Filter mock listings by role, location, portal, and type
- **Auto-Fill** — Copy pre-filled form fields generated from your resume
- **Application Tracker** — Track applications with statuses: Pending, Applied, Interview, Rejected

## Tech Stack

| Layer    | Tech                              |
|----------|-----------------------------------|
| Frontend | React 18, Vite 5, Tailwind CSS 3  |
| Backend  | Node.js, Express (ESM)            |
| Database | SQLite via `better-sqlite3`       |
| AI       | Anthropic SDK (`claude-opus-4-7`) |

---

## Setup

### 1. Clone & enter the repo

```bash
git clone <repo-url>
cd job-applyer
```

### 2. Configure environment

```bash
cp .env.example backend/.env
```

Edit `backend/.env` and set your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
```

### 3. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 4. Run the app

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

The app runs at **http://localhost:5173**.

---

## API Reference

| Method | Endpoint              | Description                          |
|--------|-----------------------|--------------------------------------|
| POST   | `/api/parse-resume`   | Parse resume with Claude AI          |
| GET    | `/api/jobs`           | Search mock job listings             |
| GET    | `/api/applications`   | Get all tracked applications         |
| POST   | `/api/applications`   | Create a new application             |
| PATCH  | `/api/applications/:id` | Update status or notes             |
| DELETE | `/api/applications/:id` | Delete an application              |

### GET /api/jobs query params

| Param    | Description                          |
|----------|--------------------------------------|
| `role`   | Job title / keyword search           |
| `location` | Location filter                   |
| `portal` | `LinkedIn`, `Indeed`, `Glassdoor`    |
| `type`   | `Full-time`, `Part-time`, `Contract` |

---

## Project Structure

```
job-applyer/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── resume.js        # POST /api/parse-resume
│   │   │   ├── jobs.js          # GET /api/jobs
│   │   │   └── applications.js  # CRUD /api/applications
│   │   ├── db/
│   │   │   └── init.js          # SQLite connection + schema
│   │   └── server.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── ResumeUpload.jsx
    │   │   ├── JobSearch.jsx
    │   │   ├── AutoFill.jsx
    │   │   └── ApplicationTracker.jsx
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── App.jsx
    │   └── main.jsx
    ├── vite.config.js
    └── package.json
```
