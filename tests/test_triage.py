from backend.models.patient import Patient
from backend.services.triage import prioritize_patient


def test_high_risk_demo_patient_gets_high_score():
    patient = Patient(
        patient_id="PAT-5012",
        age=70,
        heart_rate=140,
        systolic_bp=80,
        spo2=85,
        clinical_severity=10,
        required_ward="ICU",
    )

    result = prioritize_patient(patient)

    assert result.severity_score >= 8
    assert result.priority == "CRITICAL"


def test_lower_risk_demo_patient():
    patient = Patient(
        patient_id="PAT-5001",
        age=30,
        heart_rate=80,
        systolic_bp=120,
        spo2=98,
        clinical_severity=2,
        required_ward="ICU",
    )

    result = prioritize_patient(patient)

    assert result.priority == "LOW"
