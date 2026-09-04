from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, List, Any
from datetime import datetime


class RiskFactorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    factor_name: str
    impact: str
    score_contribution: float
    explanation: str


class AssessmentCreate(BaseModel):
    customer_name: str
    customer_id: str
    transaction_amount: float
    transaction_type: str
    location: str
    previous_average_amount: float
    device_type: str
    is_new_device: bool = False
    login_time: str = "12:00"
    previous_location: str
    current_location: str
    transaction_frequency: int = 1
    account_age_days: int = 365
    previous_risk_score: float = 0.0

    @field_validator("transaction_amount", "previous_average_amount")
    @classmethod
    def must_be_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Amount must be positive")
        return v

    @field_validator("previous_risk_score")
    @classmethod
    def score_range(cls, v: float) -> float:
        if not 0 <= v <= 100:
            raise ValueError("Risk score must be between 0 and 100")
        return v

    @field_validator("transaction_frequency")
    @classmethod
    def freq_positive(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Transaction frequency must be non-negative")
        return v


class AssessmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    case_id: str
    customer_id: str
    customer_name: str
    transaction_amount: float
    transaction_type: str
    location: str
    previous_average_amount: float
    device_type: str
    is_new_device: bool
    login_time: str
    previous_location: str
    current_location: str
    transaction_frequency: int
    account_age_days: int
    previous_risk_score: float
    risk_score: Optional[float] = None
    risk_level: Optional[str] = None
    explanation: Optional[Any] = None
    recommendation: Optional[str] = None
    status: str
    created_at: datetime
    analyzed_at: Optional[datetime] = None
    risk_factors: List[RiskFactorResponse] = []


class StatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def valid_status(cls, v: str) -> str:
        allowed = ["Open", "Under Review", "Approved", "Escalated", "Resolved"]
        if v not in allowed:
            raise ValueError(f"Status must be one of: {allowed}")
        return v


class DashboardRecentEvent(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    case_id: str
    customer_name: str
    transaction_amount: float
    location: str
    risk_score: Optional[float]
    risk_level: Optional[str]
    status: str
    created_at: datetime
    transaction_type: str


class DashboardResponse(BaseModel):
    total_assessments: int
    low_count: int
    medium_count: int
    high_count: int
    critical_count: int
    recent_events: List[DashboardRecentEvent]
    risk_trend: List[dict]
    risk_by_category: List[dict]


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    timestamp: datetime
    user: str
    action: str
    case_id: Optional[str] = None
    description: str


class AnalyticsResponse(BaseModel):
    risk_distribution: List[dict]
    risk_by_location: List[dict]
    risk_by_type: List[dict]
    risk_trend: List[dict]
    avg_risk_score: float
    critical_over_time: List[dict]
