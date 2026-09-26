# VitalFlow Ward Manager

AI-driven dynamic hospital resource optimization using priority intelligence.

> **Project status:** MVP foundation  
> **Important:** The triage scoring in this repository is a simulated educational rule set. It is not a clinical decision-making tool and must not be used for real patient care.

## MVP Architecture

Patient data → Severity scoring → Max-Heap priority queue → FastAPI → Bed allocation (next phase) → Dashboard (later)

## Tech Stack

- Python
- FastAPI
- Pydantic
- PostgreSQL (planned)
- WebSockets (planned)
- Redis (planned)
- ML/TensorFlow (planned)
- HL7/FHIR integration (planned)

## Current MVP

- Custom Max-Heap implementation
- Patient priority model
- Simulated severity scoring
- FastAPI health endpoint
- Basic priority-queue endpoint
- Unit tests

## Project Structure

```text
VitalFlow-Ward-Manager/
├── backend/
│   ├── __init__.py
│   ├── main.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── patient.py
│   ├── algorithms/
│   │   ├── __init__.py
│   │   └── max_heap.py
│   └── services/
│       ├── __init__.py
│       └── triage.py
├── tests/
│   ├── __init__.py
│   ├── test_max_heap.py
│   └── test_triage.py
├── .gitignore
├── requirements.txt
└── README.md
```

## Run Locally

### 1. Create a virtual environment

Windows:

```powershell
python -m venv .venv
.venv\Scripts\activate
```

macOS/Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Start FastAPI

```bash
uvicorn backend.main:app --reload
```

Open:

- API: http://127.0.0.1:8000
- Swagger docs: http://127.0.0.1:8000/docs

### 4. Run tests

```bash
pytest
```

## GitHub

After creating a GitHub repository:

```bash
git init
git add .
git commit -m "Initial MVP: max heap and triage engine"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

## Roadmap

- [x] Max-Heap priority queue
- [x] Simulated triage scoring
- [x] FastAPI foundation
- [ ] PostgreSQL integration
- [ ] Bed allocation engine
- [ ] Concurrency-safe allocation
- [ ] WebSocket live updates
- [ ] Hospital dashboard
- [ ] Predictive discharge model
- [ ] HL7/FHIR integration
- [ ] Redis optimization
- [ ] Deployment and monitoring
