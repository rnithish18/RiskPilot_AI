from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String, unique=True, index=True)
    name = Column(String)
    email = Column(String, nullable=True)
    account_age_days = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    assessments = relationship("RiskAssessment", back_populates="customer_rel")


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String, unique=True, index=True)
    customer_id = Column(String, ForeignKey("customers.customer_id"), index=True)
    customer_name = Column(String)
    transaction_amount = Column(Float)
    transaction_type = Column(String)
    location = Column(String)
    previous_average_amount = Column(Float)
    device_type = Column(String)
    is_new_device = Column(Boolean, default=False)
    login_time = Column(String)
    previous_location = Column(String)
    current_location = Column(String)
    transaction_frequency = Column(Integer, default=1)
    account_age_days = Column(Integer, default=365)
    previous_risk_score = Column(Float, default=0.0)
    risk_score = Column(Float, nullable=True)
    risk_level = Column(String, nullable=True)
    explanation = Column(Text, nullable=True)  # JSON string
    recommendation = Column(Text, nullable=True)
    status = Column(String, default="Open")
    created_at = Column(DateTime, default=datetime.utcnow)
    analyzed_at = Column(DateTime, nullable=True)

    customer_rel = relationship("Customer", back_populates="assessments")
    risk_factors = relationship("RiskFactor", back_populates="assessment", cascade="all, delete-orphan")


class RiskFactor(Base):
    __tablename__ = "risk_factors"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("risk_assessments.id"))
    factor_name = Column(String)
    impact = Column(String)
    score_contribution = Column(Float)
    explanation = Column(Text)

    assessment = relationship("RiskAssessment", back_populates="risk_factors")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user = Column(String, default="System")
    action = Column(String)
    case_id = Column(String, nullable=True)
    description = Column(Text)
