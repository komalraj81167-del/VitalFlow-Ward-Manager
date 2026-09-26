from fastapi import FastAPI, HTTPException

from backend.algorithms.max_heap import MaxHeap
from backend.models.patient import Patient
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
def add_patient(patient: Patient):
    prioritized = prioritize_patient(patient)
    priority_queue.push(
        prioritized.model_dump(),
        prioritized.severity_score,
    )
    return {
        "event": "PATIENT_ADDED",
        "patient": prioritized.model_dump(),
        "queue_size": len(priority_queue),
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
