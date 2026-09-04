import json
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from models import RiskAssessment, AuditLog
from schemas import AssessmentResponse, StatusUpdate

router = APIRouter()


def _build_timeline(assessment: RiskAssessment) -> list:
    """Generate a chronological timeline from assessment data."""
    events = []
    base_date = assessment.created_at or datetime.utcnow()

    # Account created
    account_created = base_date - timedelta(days=assessment.account_age_days)
    events.append({
        "time": account_created.strftime("%b %d, %Y"),
        "title": "Account Created",
        "description": f"Customer account opened ({assessment.account_age_days} days ago)",
        "type": "info",
    })

    # Previous activity
    events.append({
        "time": (base_date - timedelta(days=7)).strftime("%b %d, %Y"),
        "title": "Previous Activity",
        "description": f"Last activity from {assessment.previous_location}",
        "type": "normal",
    })

    # Login
    events.append({
        "time": f"{base_date.strftime('%b %d, %Y')} • {assessment.login_time}",
        "title": "Login Detected",
        "description": f"Login from {assessment.current_location} at {assessment.login_time}",
        "type": "info",
    })

    # New device
    if assessment.is_new_device:
        events.append({
            "time": f"{base_date.strftime('%b %d, %Y')} • {assessment.login_time}",
            "title": "New Device Detected",
            "description": f"Unrecognized {assessment.device_type} device used for access",
            "type": "warning",
        })

    # Location change
    if assessment.previous_location and assessment.current_location:
        if assessment.previous_location.lower() != assessment.current_location.lower():
            events.append({
                "time": f"{base_date.strftime('%b %d, %Y')} • {assessment.login_time}",
                "title": "Location Change",
                "description": f"Activity shifted from {assessment.previous_location} to {assessment.current_location}",
                "type": "warning",
            })

    # Transaction
    events.append({
        "time": f"{base_date.strftime('%b %d, %Y')} • {assessment.login_time}",
        "title": f"₹{assessment.transaction_amount:,.0f} {assessment.transaction_type}",
        "description": f"{assessment.transaction_type} of ₹{assessment.transaction_amount:,.0f} initiated",
        "type": "transaction",
    })

    if assessment.risk_score is not None:
        events.append({
            "time": f"{base_date.strftime('%b %d, %Y')} • {assessment.login_time}",
            "title": "Risk Engine Triggered",
            "description": "Automated risk analysis initiated by transaction monitoring system",
            "type": "alert",
        })

        events.append({
            "time": (assessment.analyzed_at or base_date).strftime("%b %d, %Y • %I:%M %p"),
            "title": f"{assessment.risk_level} Risk Assigned",
            "description": f"Risk score: {assessment.risk_score:.0f}/100 — {assessment.risk_level}",
            "type": "critical" if assessment.risk_level in ("CRITICAL", "HIGH") else "warning",
        })

    return events


@router.get("/investigations", response_model=list[AssessmentResponse])
def list_investigations(
    risk_level: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    transaction_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db),
):
    q = db.query(RiskAssessment).filter(RiskAssessment.risk_score.isnot(None))

    if risk_level:
        q = q.filter(RiskAssessment.risk_level == risk_level.upper())
    if status:
        q = q.filter(RiskAssessment.status == status)
    if location:
        q = q.filter(RiskAssessment.location.ilike(f"%{location}%"))
    if transaction_type:
        q = q.filter(RiskAssessment.transaction_type == transaction_type)
    if search:
        q = q.filter(
            (RiskAssessment.customer_name.ilike(f"%{search}%"))
            | (RiskAssessment.case_id.ilike(f"%{search}%"))
        )
    if date_from:
        try:
            df = datetime.fromisoformat(date_from)
            q = q.filter(RiskAssessment.created_at >= df)
        except ValueError:
            pass
    if date_to:
        try:
            dt = datetime.fromisoformat(date_to)
            q = q.filter(RiskAssessment.created_at <= dt)
        except ValueError:
            pass

    return q.order_by(RiskAssessment.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/investigations/{investigation_id}")
def get_investigation(investigation_id: int, db: Session = Depends(get_db)):
    assessment = db.query(RiskAssessment).filter(RiskAssessment.id == investigation_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Investigation not found")

    # Parse explanation JSON
    explanation_data = None
    if assessment.explanation:
        try:
            explanation_data = json.loads(assessment.explanation)
        except json.JSONDecodeError:
            explanation_data = {"summary": assessment.explanation, "why_risky": []}

    timeline = _build_timeline(assessment)

    factors = [
        {
            "id": f.id,
            "factor_name": f.factor_name,
            "impact": f.impact,
            "score_contribution": f.score_contribution,
            "explanation": f.explanation,
        }
        for f in assessment.risk_factors
    ]

    return {
        "id": assessment.id,
        "case_id": assessment.case_id,
        "customer_id": assessment.customer_id,
        "customer_name": assessment.customer_name,
        "transaction_amount": assessment.transaction_amount,
        "transaction_type": assessment.transaction_type,
        "location": assessment.location,
        "previous_average_amount": assessment.previous_average_amount,
        "device_type": assessment.device_type,
        "is_new_device": assessment.is_new_device,
        "login_time": assessment.login_time,
        "previous_location": assessment.previous_location,
        "current_location": assessment.current_location,
        "transaction_frequency": assessment.transaction_frequency,
        "account_age_days": assessment.account_age_days,
        "previous_risk_score": assessment.previous_risk_score,
        "risk_score": assessment.risk_score,
        "risk_level": assessment.risk_level,
        "explanation": explanation_data,
        "recommendation": assessment.recommendation,
        "status": assessment.status,
        "created_at": assessment.created_at.isoformat() if assessment.created_at else None,
        "analyzed_at": assessment.analyzed_at.isoformat() if assessment.analyzed_at else None,
        "risk_factors": factors,
        "timeline": timeline,
    }


@router.patch("/investigations/{investigation_id}/status")
def update_status(investigation_id: int, payload: StatusUpdate, db: Session = Depends(get_db)):
    assessment = db.query(RiskAssessment).filter(RiskAssessment.id == investigation_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Investigation not found")

    old_status = assessment.status
    assessment.status = payload.status
    db.commit()

    # Audit
    log = AuditLog(
        timestamp=datetime.utcnow(),
        user="Analyst",
        action=f"Status Changed to {payload.status}",
        case_id=assessment.case_id,
        description=f"Case status updated: {old_status} → {payload.status}",
    )
    db.add(log)
    db.commit()

    return {"id": assessment.id, "case_id": assessment.case_id, "status": assessment.status}
