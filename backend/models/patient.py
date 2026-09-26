from pydantic import BaseModel, Field


class Patient(BaseModel):
    patient_id: str
    age: int = Field(ge=0, le=120)
    heart_rate: float = Field(gt=0)
    systolic_bp: float = Field(gt=0)
    spo2: float = Field(gt=0, le=100)
    clinical_severity: float = Field(ge=0, le=10)


class PrioritizedPatient(Patient):
    severity_score: float
    priority: str
