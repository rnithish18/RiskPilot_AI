from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from database import get_db
from models import RiskAssessment
from schemas import DashboardResponse

router = APIRouter()


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    all_assessed = db.query(RiskAssessment).filter(RiskAssessment.risk_score.isnot(None))

    total = all_assessed.count()
    low = all_assessed.filter(RiskAssessment.risk_level == "LOW").count()
    medium = all_assessed.filter(RiskAssessment.risk_level == "MEDIUM").count()
    high = all_assessed.filter(RiskAssessment.risk_level == "HIGH").count()
    critical = all_assessed.filter(RiskAssessment.risk_level == "CRITICAL").count()

    recent = (
        db.query(RiskAssessment)
        .filter(RiskAssessment.risk_score.isnot(None))
        .order_by(RiskAssessment.created_at.desc())
        .limit(10)
        .all()
    )

    # Risk trend: last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    trend_raw = (
        db.query(
            func.date(RiskAssessment.created_at).label("date"),
            RiskAssessment.risk_level,
            func.count(RiskAssessment.id).label("count"),
        )
        .filter(
            RiskAssessment.created_at >= thirty_days_ago,
            RiskAssessment.risk_score.isnot(None),
        )
        .group_by(func.date(RiskAssessment.created_at), RiskAssessment.risk_level)
        .all()
    )

    trend_map: dict = {}
    for row in trend_raw:
        d = str(row.date)
        if d not in trend_map:
            trend_map[d] = {"date": d, "low": 0, "medium": 0, "high": 0, "critical": 0}
        level_key = row.risk_level.lower() if row.risk_level else "low"
        trend_map[d][level_key] = row.count

    risk_trend = sorted(trend_map.values(), key=lambda x: x["date"])

    # Risk by category (transaction type)
    cat_raw = (
        db.query(
            RiskAssessment.transaction_type,
            func.count(RiskAssessment.id).label("count"),
        )
        .filter(RiskAssessment.risk_score.isnot(None))
        .group_by(RiskAssessment.transaction_type)
        .all()
    )
    risk_by_category = [{"name": r.transaction_type, "value": r.count} for r in cat_raw]

    return DashboardResponse(
        total_assessments=total,
        low_count=low,
        medium_count=medium,
        high_count=high,
        critical_count=critical,
        recent_events=recent,
        risk_trend=risk_trend,
        risk_by_category=risk_by_category,
    )
