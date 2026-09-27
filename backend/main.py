from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

from backend.algorithms.max_heap import MaxHeap
from backend.database.db_models import BedDB, PatientDB
from backend.database.dependencies import get_db
from backend.models.patient import Patient
from backend.services.bed_allocator import is_bed_compatible
from backend.services.triage import prioritize_patient


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
        raise HTTPException(
            status_code=404,
            detail="Priority queue is empty",
        )

    return {
        "event": "NEXT_PRIORITY_PATIENT",
        "patient": next_patient.item,
        "severity_score": next_patient.priority,
    }


@app.post("/queue/pop")
def pop_next_patient():
    next_patient = priority_queue.pop()

    if next_patient is None:
        raise HTTPException(
            status_code=404,
            detail="Priority queue is empty",
        )

    return {
        "event": "PATIENT_RETRIEVED",
        "patient": next_patient.item,
        "severity_score": next_patient.priority,
    }


@app.get("/beds")
def get_beds(db: Session = Depends(get_db)):
    beds = db.query(BedDB).all()

    return {
        "event": "BED_STATUS",
        "total_beds": len(beds),
        "available_beds": sum(
            1 for bed in beds if bed.status == "AVAILABLE"
        ),
        "occupied_beds": sum(
            1 for bed in beds if bed.status == "OCCUPIED"
        ),
        "beds": [
            {
                "bed_id": bed.bed_id,
                "ward_type": bed.ward_type,
                "status": bed.status,
                "ventilator_available": bed.ventilator_available,
                "oxygen_available": bed.oxygen_available,
                "isolation_available": bed.isolation_available,
            }
            for bed in beds
        ],
    }


@app.post("/beds/release/{bed_id}")
def release_bed(
    bed_id: str,
    db: Session = Depends(get_db),
):
    bed = (
        db.query(BedDB)
        .filter(BedDB.bed_id == bed_id)
        .first()
    )

    if bed is None:
        raise HTTPException(
            status_code=404,
            detail="Bed not found",
        )

    if bed.status == "AVAILABLE":
        raise HTTPException(
            status_code=409,
            detail="Bed is already available",
        )

    bed.status = "AVAILABLE"

    db.commit()
    db.refresh(bed)

    return {
        "event": "BED_RELEASED",
        "bed": {
            "bed_id": bed.bed_id,
            "ward_type": bed.ward_type,
            "status": bed.status,
            "ventilator_available": bed.ventilator_available,
            "oxygen_available": bed.oxygen_available,
            "isolation_available": bed.isolation_available,
        },
    }


@app.post("/beds/allocate/{patient_id}")
def allocate_patient_bed(
    patient_id: str,
    db: Session = Depends(get_db),
):
    # Find the patient in the priority queue.
    patient_data = None

    for item in priority_queue._heap:
        if item.item["patient_id"] == patient_id:
            patient_data = item.item
            break

    if patient_data is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found in priority queue",
        )

    patient = Patient(**patient_data)

    # Get available beds from PostgreSQL.
    available_beds = (
        db.query(BedDB)
        .filter(BedDB.status == "AVAILABLE")
        .all()
    )

    # Find the first compatible bed.
    selected_bed = None

    for bed_db in available_beds:
        # Convert database bed to the model expected by the allocator.
        from backend.models.bed import Bed

        bed = Bed(
            bed_id=bed_db.bed_id,
            ward_type=bed_db.ward_type,
            status=bed_db.status,
            ventilator_available=bed_db.ventilator_available,
            oxygen_available=bed_db.oxygen_available,
            isolation_available=bed_db.isolation_available,
        )

        if is_bed_compatible(patient, bed):
            selected_bed = bed_db
            break

    if selected_bed is None:
        raise HTTPException(
            status_code=409,
            detail="No compatible bed available",
        )

    # Update PostgreSQL.
    selected_bed.status = "OCCUPIED"

    db.commit()
    db.refresh(selected_bed)

    return {
        "event": "BED_ALLOCATED",
        "patient_id": patient_id,
        "bed": {
            "bed_id": selected_bed.bed_id,
            "ward_type": selected_bed.ward_type,
            "status": selected_bed.status,
            "ventilator_available": selected_bed.ventilator_available,
            "oxygen_available": selected_bed.oxygen_available,
            "isolation_available": selected_bed.isolation_available,
        },
    }