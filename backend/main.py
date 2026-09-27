from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

from backend.database.db_models import PatientDB
from backend.database.dependencies import get_db

from backend.database.db_models import PatientDB
from backend.database.dependencies import get_db


from backend.algorithms.max_heap import MaxHeap
from backend.models.patient import Patient
from backend.services.triage import prioritize_patient
from backend.models.bed import Bed
from backend.services.bed_allocator import assign_bed


priority_queue = MaxHeap[dict]()
beds = [
    Bed(
        bed_id="ICU-01",
        ward_type="ICU",
        status="AVAILABLE",
        ventilator_available=True,
        oxygen_available=True,
        isolation_available=True,
    ),
    Bed(
        bed_id="ICU-02",
        ward_type="ICU",
        status="AVAILABLE",
        ventilator_available=False,
        oxygen_available=True,
        isolation_available=False,
    ),
    Bed(
        bed_id="GENERAL-01",
        ward_type="GENERAL",
        status="AVAILABLE",
        oxygen_available=True,
    ),
]


app = FastAPI(
    title="VitalFlow Ward Manager",
    description="Educational MVP for dynamic emergency priority management.",
    version="0.1.0",
)

priority_queue = MaxHeap[dict]()


@app.get("/")
def root():
    return {
        "project": "VitalFlow Ward Manager",
        "status": "MVP running",
        "warning": "Simulation only - not for clinical decision-making",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/patients")
def add_patient(
    patient: Patient,
    db: Session = Depends(get_db),
):
    prioritized = prioritize_patient(patient)

    priority_queue.push(
        prioritized.model_dump(),
        prioritized.severity_score,
    )

    patient_db = PatientDB(
        patient_id=prioritized.patient_id,
        age=prioritized.age,
        heart_rate=prioritized.heart_rate,
        systolic_bp=prioritized.systolic_bp,
        spo2=prioritized.spo2,
        clinical_severity=prioritized.clinical_severity,
        required_ward=prioritized.required_ward,
        needs_ventilator=prioritized.needs_ventilator,
        needs_oxygen=prioritized.needs_oxygen,
        needs_isolation=prioritized.needs_isolation,
        severity_score=prioritized.severity_score,
        priority=prioritized.priority,
    )

    db.add(patient_db)
    db.commit()
    db.refresh(patient_db)

    return {
        "event": "PATIENT_ADDED",
        "patient": prioritized.model_dump(),
        "queue_size": len(priority_queue),
        "database_id": patient_db.id,
    }


@app.get("/queue/next")
def get_next_patient():
    next_patient = priority_queue.peek()

    if next_patient is None:
        raise HTTPException(status_code=404, detail="Priority queue is empty")

    return {
        "event": "NEXT_PRIORITY_PATIENT",
        "patient": next_patient.item,
        "severity_score": next_patient.priority,
    }


@app.post("/queue/pop")
def pop_next_patient():
    next_patient = priority_queue.pop()

    if next_patient is None:
        raise HTTPException(status_code=404, detail="Priority queue is empty")

    return {
        "event": "PATIENT_RETRIEVED",
        "patient": next_patient.item,
        "severity_score": next_patient.priority,
    }


@app.post("/beds/allocate/{patient_id}")
def allocate_patient_bed(patient_id: str):
    for item in priority_queue._heap:
        patient = item.item

        if patient["patient_id"] == patient_id:
            patient_model = Patient(**patient)

            allocated_bed = assign_bed(patient_model, beds)

            if allocated_bed is None:
                raise HTTPException(
                    status_code=409,
                    detail="No compatible bed available",
                )

            return {
                "event": "BED_ALLOCATED",
                "patient_id": patient_id,
                "bed": allocated_bed.model_dump(),
            }

    raise HTTPException(
        status_code=404,
        detail="Patient not found in priority queue",
    )
@app.get("/beds")
def get_beds():
    return {
        "event": "BED_STATUS",
        "total_beds": len(beds),
        "available_beds": sum(
            1 for bed in beds if bed.status == "AVAILABLE"
        ),
        "occupied_beds": sum(
            1 for bed in beds if bed.status == "OCCUPIED"
        ),
        "beds": [bed.model_dump() for bed in beds],
    }

@app.post("/beds/release/{bed_id}")
def release_bed(bed_id: str):
    for bed in beds:
        if bed.bed_id == bed_id:

            if bed.status == "AVAILABLE":
                raise HTTPException(
                    status_code=409,
                    detail="Bed is already available",
                )

            bed.status = "AVAILABLE"

            return {
                "event": "BED_RELEASED",
                "bed": bed.model_dump(),
            }

    raise HTTPException(
        status_code=404,
        detail="Bed not found",
    )