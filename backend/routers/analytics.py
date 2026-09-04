from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import RiskAssessment

router = APIRouter()

RANGE_MAP = {
    "today": 1,
    "7d": 7,
    "30d": 30,
    "90d": 90,
}

RISK_COLORS = {
    "LOW": "#22c55e",
    "MEDIUM": "#f59e0b",
    "HIGH": "#f97316",
    "CRITICAL": "#ef4444",
}


@router.get("/analytics")
def get_analytics(range: Optional[str] = Query("30d"), db: Session = Depends(get_db)):
    days = RANGE_MAP.get(range, 30)
    since = datetime.utcnow() - timedelta(days=days)

    base_q = db.query(RiskAssessment).filter(
        RiskAssessment.risk_score.isnot(None),
        RiskAssessment.created_at >= since,
    )

    # Risk distribution
    dist_raw = (
        db.query(RiskAssessment.risk_level, func.count(RiskAssessment.id).label("count"))
        .filter(RiskAssessment.risk_score.isnot(None), RiskAssessment.created_at >= since)
        .group_by(RiskAssessment.risk_level)
        .all()
    )
    risk_distribution = [
        {"name": r.risk_level, "value": r.count, "color": RISK_COLORS.get(r.risk_level, "#6b7280")}
        for r in dist_raw if r.risk_level
    ]

    # By location
    loc_raw = (
        db.query(
            RiskAssessment.current_location,
            func.count(RiskAssessment.id).label("count"),
            func.avg(RiskAssessment.risk_score).label("avg_score"),
        )
        .filter(RiskAssessment.risk_score.isnot(None), RiskAssessment.created_at >= since)
        .group_by(RiskAssessment.current_location)
        .order_by(func.count(RiskAssessment.id).desc())
        .limit(10)
        .all()
    )
    risk_by_location = [
        {"location": r.current_location or "Unknown", "count": r.count, "avg_score": round(r.avg_score or 0, 1)}
        for r in loc_raw
    ]

    # By transaction type
    type_raw = (
        db.query(
            RiskAssessment.transaction_type,
            func.count(RiskAssessment.id).label("count"),
            func.avg(RiskAssessment.risk_score).label("avg_score"),
        )
        .filter(RiskAssessment.risk_score.isnot(None), RiskAssessment.created_at >= since)
        .group_by(RiskAssessment.transaction_type)
        .all()
    )
    risk_by_type = [
        {"type": r.transaction_type, "count": r.count, "avg_score": round(r.avg_score or 0, 1)}
        for r in type_raw
    ]

    # Risk trend
    trend_raw = (
        db.query(
            func.date(RiskAssessment.created_at).label("date"),
            func.avg(RiskAssessment.risk_score).label("avg_score"),
            func.count(RiskAssessment.id).label("count"),
        )
        .filter(RiskAssessment.risk_score.isnot(None), RiskAssessment.created_at >= since)
        .group_by(func.date(RiskAssessment.created_at))
        .order_by(func.date(RiskAssessment.created_at))
        .all()
    )
    risk_trend = [
        {"date": str(r.date), "avg_score": round(r.avg_score or 0, 1), "count": r.count}
        for r in trend_raw
    ]

    # Average risk score
    avg_result = db.query(func.avg(RiskAssessment.risk_score)).filter(
        RiskAssessment.risk_score.isnot(None), RiskAssessment.created_at >= since
    ).scalar()
    avg_risk_score = round(avg_result or 0, 1)

    # Critical over time
    crit_raw = (
        db.query(
            func.date(RiskAssessment.created_at).label("date"),
            func.count(RiskAssessment.id).label("count"),
        )
        .filter(
            RiskAssessment.risk_level == "CRITICAL",
            RiskAssessment.created_at >= since,
        )
        .group_by(func.date(RiskAssessment.created_at))
        .order_by(func.date(RiskAssessment.created_at))
        .all()
    )
    critical_over_time = [{"date": str(r.date), "count": r.count} for r in crit_raw]

    return {
        "risk_distribution": risk_distribution,
        "risk_by_location": risk_by_location,
        "risk_by_type": risk_by_type,
        "risk_trend": risk_trend,
        "avg_risk_score": avg_risk_score,
        "critical_over_time": critical_over_time,
    }
