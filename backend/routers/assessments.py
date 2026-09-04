import json
import random
import string
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from models import RiskAssessment, RiskFactor, Customer, AuditLog
from schemas import AssessmentCreate, AssessmentResponse
from engine.risk_engine import RiskEngine
from engine.explanation_engine import ExplanationEngine
from engine.recommendation_engine import RecommendationEngine
from engine.anomaly_engine import AnomalyEngine

router = APIRouter()
risk_engine = RiskEngine()
explanation_engine = ExplanationEngine()
recommendation_engine = RecommendationEngine()
anomaly_engine = AnomalyEngine()


def generate_case_id() -> str:
    date_str = datetime.utcnow().strftime("%Y%m%d")
    suffix = "".join(random.choices(string.digits, k=4))
    return f"CASE-{date_str}-{suffix}"


def write_audit(db: Session, action: str, case_id: str, description: str, user: str = "System"):
    log = AuditLog(
        timestamp=datetime.utcnow(),
        user=user,
        action=action,
        case_id=case_id,
        description=description,
    )
    db.add(log)
    db.commit()


@router.get("/assessments", response_model=list[AssessmentResponse])
def list_assessments(
    risk_level: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db),
):
    q = db.query(RiskAssessment)
    if risk_level:
        q = q.filter(RiskAssessment.risk_level == risk_level.upper())
    if status:
        q = q.filter(RiskAssessment.status == status)
    if search:
        q = q.filter(
            (RiskAssessment.customer_name.ilike(f"%{search}%"))
            | (RiskAssessment.case_id.ilike(f"%{search}%"))
        )
    return q.order_by(RiskAssessment.created_at.desc()).offset(skip).limit(limit).all()


@router.post("/assessments", response_model=AssessmentResponse, status_code=201)
def create_assessment(payload: AssessmentCreate, db: Session = Depends(get_db)):
    # Upsert customer
    customer = db.query(Customer).filter(Customer.customer_id == payload.customer_id).first()
    if not customer:
        customer = Customer(
            customer_id=payload.customer_id,
            name=payload.customer_name,
            account_age_days=payload.account_age_days,
        )
        db.add(customer)
        db.flush()

    case_id = generate_case_id()
    assessment = RiskAssessment(
        case_id=case_id,
        customer_id=payload.customer_id,
        customer_name=payload.customer_name,
        transaction_amount=payload.transaction_amount,
        transaction_type=payload.transaction_type,
        location=payload.location,
        previous_average_amount=payload.previous_average_amount,
        device_type=payload.device_type,
        is_new_device=payload.is_new_device,
        login_time=payload.login_time,
        previous_location=payload.previous_location,
        current_location=payload.current_location,
        transaction_frequency=payload.transaction_frequency,
        account_age_days=payload.account_age_days,
        previous_risk_score=payload.previous_risk_score,
        status="Open",
        created_at=datetime.utcnow(),
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    write_audit(db, "Assessment Created", case_id, f"New risk assessment created for {payload.customer_name}")
    return assessment


@router.get("/assessments/{assessment_id}", response_model=AssessmentResponse)
def get_assessment(assessment_id: int, db: Session = Depends(get_db)):
    assessment = db.query(RiskAssessment).filter(RiskAssessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment


@router.post("/assessments/{assessment_id}/analyze", response_model=AssessmentResponse)
def analyze_assessment(assessment_id: int, db: Session = Depends(get_db)):
    assessment = db.query(RiskAssessment).filter(RiskAssessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # Build data dict for engine
    data = {
        "transaction_amount": assessment.transaction_amount,
        "previous_average_amount": assessment.previous_average_amount,
        "is_new_device": assessment.is_new_device,
        "previous_location": assessment.previous_location,
        "current_location": assessment.current_location,
        "login_time": assessment.login_time,
        "transaction_frequency": assessment.transaction_frequency,
        "account_age_days": assessment.account_age_days,
        "previous_risk_score": assessment.previous_risk_score,
        "device_type": assessment.device_type,
    }

    # Run engines
    risk_result = risk_engine.calculate_score(data)
    explanation = explanation_engine.generate(
        risk_result["risk_level"], risk_result["total_score"], risk_result["factors"]
    )
    recommendation = recommendation_engine.get_recommendation(
        risk_result["risk_level"], risk_result["factors"]
    )
    anomaly = anomaly_engine.analyze(
        assessment.transaction_amount, assessment.previous_average_amount, assessment.transaction_frequency
    )

    # Delete old factors
    db.query(RiskFactor).filter(RiskFactor.assessment_id == assessment.id).delete()

    # Save new factors
    for f in risk_result["factors"]:
        factor = RiskFactor(
            assessment_id=assessment.id,
            factor_name=f["factor_name"],
            impact=f["impact"],
            score_contribution=f["score_contribution"],
            explanation=f["explanation"],
        )
        db.add(factor)

    # Store explanation as JSON
    full_explanation = {
        **explanation,
        "recommendation": recommendation,
        "anomaly": anomaly,
    }

    assessment.risk_score = risk_result["total_score"]
    assessment.risk_level = risk_result["risk_level"]
    assessment.explanation = json.dumps(full_explanation)
    assessment.recommendation = recommendation["description"]
    assessment.analyzed_at = datetime.utcnow()
    db.commit()
    db.refresh(assessment)

    write_audit(
        db, "Risk Analysis Executed", assessment.case_id,
        f"Risk analysis completed: Score={risk_result['total_score']}, Level={risk_result['risk_level']}"
    )
    return assessment
