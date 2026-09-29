from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

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


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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



@app.get("/patients")
def get_patients(db: Session = Depends(get_db)):
    patients = (
        db.query(PatientDB)
        .order_by(PatientDB.severity_score.desc())
        .all()
    )

    critical_patients = sum(
        1
        for patient in patients
        if patient.priority == "CRITICAL"
    )

    return {
        "event": "PATIENT_STATUS",
        "total_patients": len(patients),
        "critical_patients": critical_patients,
        "patients": [
            {
                "patient_id": patient.patient_id,
                "age": patient.age,
                "heart_rate": patient.heart_rate,
                "systolic_bp": patient.systolic_bp,
                "spo2": patient.spo2,
                "clinical_severity": patient.clinical_severity,
                "required_ward": patient.required_ward,
                "needs_ventilator": patient.needs_ventilator,
                "needs_oxygen": patient.needs_oxygen,
                "needs_isolation": patient.needs_isolation,
                "severity_score": patient.severity_score,
                "priority": patient.priority,
                "assigned_bed_id": patient.assigned_bed_id,
            }
            for patient in patients
        ],
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

    bed_list = []

    for bed in beds:
        assigned_patient = (
            db.query(PatientDB)
            .filter(
                PatientDB.assigned_bed_id == bed.bed_id
            )
            .first()
        )

        bed_list.append({
            "bed_id": bed.bed_id,
            "ward_type": bed.ward_type,
            "status": bed.status,
            "ventilator_available": bed.ventilator_available,
            "oxygen_available": bed.oxygen_available,
            "isolation_available": bed.isolation_available,
            "assigned_patient_id": (
                assigned_patient.patient_id
                if assigned_patient
                else None
            ),
        })

    return {
        "event": "BED_STATUS",
        "total_beds": len(beds),
        "available_beds": sum(
            1 for bed in beds
            if bed.status == "AVAILABLE"
        ),
        "occupied_beds": sum(
            1 for bed in beds
            if bed.status == "OCCUPIED"
        ),
        "beds": bed_list,
    }


@app.post("/beds/release/{bed_id}")
def release_bed(
    bed_id: str,
    db: Session = Depends(get_db),
):
    # Find the bed in PostgreSQL.
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

    # Check whether the bed is currently occupied.
    if bed.status != "OCCUPIED":
        raise HTTPException(
            status_code=409,
            detail="Bed is not currently occupied",
        )

    # Find the patient assigned to this bed.
    patient = (
        db.query(PatientDB)
        .filter(PatientDB.assigned_bed_id == bed_id)
        .first()
    )

    # Release the bed.
    bed.status = "AVAILABLE"

    # Remove the patient's bed assignment.
    if patient:
        patient.assigned_bed_id = None

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
        "released_patient_id": (
            patient.patient_id if patient else None
        ),
    }

@app.post("/beds/allocate/{patient_id}")
def allocate_patient_bed(
    patient_id: str,
    db: Session = Depends(get_db),
):
    # Find patient in PostgreSQL.
    patient_db = (
        db.query(PatientDB)
        .filter(PatientDB.patient_id == patient_id)
        .first()
    )

    if patient_db is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    # Check if patient already has a bed.
    if patient_db.assigned_bed_id is not None:
        raise HTTPException(
            status_code=409,
            detail=f"Patient already has bed {patient_db.assigned_bed_id}",
        )

    # Convert database patient to Patient model.
    patient = Patient(
        patient_id=patient_db.patient_id,
        age=patient_db.age,
        heart_rate=patient_db.heart_rate,
        systolic_bp=patient_db.systolic_bp,
        spo2=patient_db.spo2,
        clinical_severity=patient_db.clinical_severity,
        required_ward=patient_db.required_ward,
        needs_ventilator=patient_db.needs_ventilator,
        needs_oxygen=patient_db.needs_oxygen,
        needs_isolation=patient_db.needs_isolation,
    )

    # Get available beds from PostgreSQL.
    available_beds = (
        db.query(BedDB)
        .filter(BedDB.status == "AVAILABLE")
        .all()
    )

    # Find the first compatible bed.
    selected_bed = None

    for bed_db in available_beds:
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

    # Update bed status.
    selected_bed.status = "OCCUPIED"

    # Store allocation in patient record.
    patient_db.assigned_bed_id = selected_bed.bed_id

    # Save both changes.
    db.commit()

    db.refresh(selected_bed)
    db.refresh(patient_db)

    return {
        "event": "BED_ALLOCATED",
        "patient_id": patient_id,
        "allocated_bed": selected_bed.bed_id,
        "bed": {
            "bed_id": selected_bed.bed_id,
            "ward_type": selected_bed.ward_type,
            "status": selected_bed.status,
            "ventilator_available": selected_bed.ventilator_available,
            "oxygen_available": selected_bed.oxygen_available,
            "isolation_available": selected_bed.isolation_available,
        },
    }