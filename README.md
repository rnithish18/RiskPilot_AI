# RiskPilot AI

**Detect Risk. Explain Decisions. Act Faster.**

A complete production-quality AI Risk Management Platform built for the AI Risk Manager competition.

---

## Quick Start

### 1. Start the Backend
Double-click `start-backend.bat`  
**or** run in terminal:
```bat
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
The backend auto-seeds 31 demo assessments on first run.

### 2. Start the Frontend
Double-click `start-frontend.bat`  
**or** run in terminal:
```bat
cd frontend
node node_modules/vite/bin/vite.js --port 5173 --host
```

### 3. Open the App
| URL | Page |
|-----|------|
| http://localhost:5173/ | Landing Page |
| http://localhost:5173/dashboard | Dashboard |
| http://localhost:5173/assess | New Assessment |
| http://localhost:5173/investigations | Investigations |
| http://localhost:5173/analytics | Analytics |
| http://localhost:5173/reports | Reports |
| http://localhost:5173/audit | Audit Log |

Backend API docs: http://localhost:8000/docs

---

## Project Structure

```
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   ├── database.py                # SQLite + SQLAlchemy setup
│   ├── models.py                  # ORM models
│   ├── schemas.py                 # Pydantic request/response schemas
│   ├── seed_data.py               # 31 demo assessments
│   ├── requirements.txt
│   ├── engine/
│   │   ├── risk_engine.py         # Deterministic risk scoring
│   │   ├── explanation_engine.py  # Dynamic AI explanations
│   │   ├── recommendation_engine.py
│   │   └── anomaly_engine.py      # Statistical deviation analysis
│   └── routers/
│       ├── dashboard.py
│       ├── assessments.py
│       ├── investigations.py
│       ├── analytics.py
│       ├── reports.py             # PDF generation (ReportLab)
│       └── audit.py
│
├── frontend/
│   └── src/
│       ├── App.tsx                # Router
│       ├── components/
│       │   ├── layout/            # Sidebar, TopNav, Layout
│       │   └── ui/                # All reusable components
│       ├── pages/                 # All 8 pages
│       ├── services/api.ts        # Axios API client
│       └── types/index.ts         # TypeScript interfaces
│
├── start-backend.bat
├── start-frontend.bat
└── README.md
```

---

## AI Risk Scoring System

The risk engine is **fully deterministic** — no external API required.

| Factor | Condition | Score |
|--------|-----------|-------|
| Amount Anomaly | > 5× historical avg | +30 |
| Amount Anomaly | > 3× historical avg | +20 |
| Amount Anomaly | > 2× historical avg | +10 |
| New Device | Unknown device used | +20 |
| Location Change | Current ≠ Previous location | +15 |
| Unusual Time | 12:00 AM – 5:59 AM | +10 |
| High Frequency | > 10 transactions/day | +10 |
| New Account (< 30 days) | | +10 |
| Very New Account (< 7 days) | | +15 |
| Prior Risk History > 70 | | +15 |
| Prior Risk History > 50 | | +8 |

**Max score: 100** (capped if factors exceed 100)

| Score | Level |
|-------|-------|
| 0–30 | LOW |
| 31–60 | MEDIUM |
| 61–80 | HIGH |
| 81–100 | CRITICAL |

### Modular AI Architecture

The engine is split into 4 swappable modules:
- `RiskEngine` — scoring (deterministic, keep as-is)
- `ExplanationEngine` — replace with LLM for richer text
- `RecommendationEngine` — replace with LLM for contextual steps
- `AnomalyEngine` — statistical baseline comparison

---

## Demo Case

Load the **Arun Kumar** demo case from the "New Assessment" form.

| Field | Value |
|-------|-------|
| Customer | Arun Kumar |
| Amount | ₹85,000 |
| Historical Avg | ₹5,000 |
| Location | Mumbai (was: Chennai) |
| Device | New Mobile Device |
| Time | 02:47 AM |
| Frequency | 15 txn/day |
| Prior Score | 72/100 |

**Expected Result:** Score ≥ 90, Level: CRITICAL, 6 risk factors detected.

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env`:
```
DATABASE_URL=sqlite:///./riskpilot.db
APP_SECRET_KEY=change-this-in-production
DEBUG=true
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard` | Stats, charts, recent events |
| GET | `/api/assessments` | List all assessments |
| POST | `/api/assessments` | Create new assessment |
| GET | `/api/assessments/{id}` | Single assessment |
| POST | `/api/assessments/{id}/analyze` | Run risk analysis |
| GET | `/api/investigations` | Filtered investigations |
| GET | `/api/investigations/{id}` | Detail + timeline |
| PATCH | `/api/investigations/{id}/status` | Update case status |
| GET | `/api/analytics?range=30d` | Analytics data |
| GET | `/api/audit` | Audit log |
| POST | `/api/reports/{id}` | Generate + download PDF |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + Glassmorphism |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Python 3 + FastAPI |
| Database | SQLite + SQLAlchemy |
| PDF | ReportLab |
| API Client | Axios |
