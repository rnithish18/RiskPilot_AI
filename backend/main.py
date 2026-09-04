from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db, SessionLocal
from routers import assessments, investigations, dashboard, analytics, reports, audit


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    init_db()
    # Seed demo data if empty
    db = SessionLocal()
    try:
        from seed_data import seed_if_empty
        seed_if_empty(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="RiskPilot AI API",
    description="AI-Powered Risk Management Platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for easy deployment (Vercel/Netlify)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])
app.include_router(assessments.router, prefix="/api", tags=["Assessments"])
app.include_router(investigations.router, prefix="/api", tags=["Investigations"])
app.include_router(analytics.router, prefix="/api", tags=["Analytics"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])
app.include_router(audit.router, prefix="/api", tags=["Audit"])


@app.get("/")
def root():
    return {"message": "RiskPilot AI API", "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}
