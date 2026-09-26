from backend.models.patient import Patient, PrioritizedPatient


def calculate_severity_score(patient: Patient) -> float:
    """Return a simulated educational severity score from 0 to 10.

    This is NOT a clinically validated triage algorithm.
    """
    score = 0.0

    # Demo-only rules.
    if patient.spo2 < 90:
        score += 3.0
    elif patient.spo2 < 94:
        score += 1.5

    if patient.systolic_bp < 90:
        score += 2.5
    elif patient.systolic_bp < 100:
        score += 1.0

    if patient.heart_rate > 130:
        score += 2.0
    elif patient.heart_rate > 110:
        score += 1.0

    if patient.age >= 65:
        score += 0.5

    score += min(patient.clinical_severity, 10) * 0.2

    return round(min(score, 10.0), 2)


def classify_priority(score: float) -> str:
    if score >= 8:
        return "CRITICAL"
    if score >= 6:
        return "HIGH"
    if score >= 4:
        return "MODERATE"
    return "LOW"


def prioritize_patient(patient: Patient) -> PrioritizedPatient:
    score = calculate_severity_score(patient)
    return PrioritizedPatient(
        **patient.model_dump(),
        severity_score=score,
        priority=classify_priority(score),
    )
