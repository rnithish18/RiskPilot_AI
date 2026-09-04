from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import AuditLog
from schemas import AuditLogResponse

router = APIRouter()


@router.get("/audit", response_model=list[AuditLogResponse])
def get_audit_log(limit: int = 200, db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return logs
