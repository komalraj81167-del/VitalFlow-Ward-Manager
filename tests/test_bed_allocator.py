from backend.models.bed import Bed
from backend.models.patient import Patient
from backend.services.bed_allocator import allocate_bed
from backend.services.bed_allocator import assign_bed


def test_allocate_compatible_icu_bed():
    patient = Patient(
        patient_id="PAT-5012",
        age=70,
        heart_rate=140,
        systolic_bp=80,
        spo2=85,
        clinical_severity=10,
        required_ward="ICU",
        needs_ventilator=True,
        needs_oxygen=True,
    )

    beds = [
        Bed(
            bed_id="ICU-01",
            ward_type="ICU",
            status="OCCUPIED",
            ventilator_available=True,
            oxygen_available=True,
        ),
        Bed(
            bed_id="ICU-02",
            ward_type="ICU",
            status="AVAILABLE",
            ventilator_available=True,
            oxygen_available=True,
        ),
    ]

    allocated_bed = allocate_bed(patient, beds)

    assert allocated_bed is not None
    assert allocated_bed.bed_id == "ICU-02"


def test_no_compatible_bed():
    patient = Patient(
        patient_id="PAT-5018",
        age=60,
        heart_rate=125,
        systolic_bp=95,
        spo2=91,
        clinical_severity=8,
        required_ward="ICU",
        needs_ventilator=True,
    )

    beds = [
        Bed(
            bed_id="ICU-01",
            ward_type="ICU",
            status="AVAILABLE",
            ventilator_available=False,
        )
    ]

    allocated_bed = allocate_bed(patient, beds)

    assert allocated_bed is None
def test_assign_bed_changes_status_to_occupied():
    patient = Patient(
        patient_id="PAT-5020",
        age=65,
        heart_rate=120,
        systolic_bp=90,
        spo2=89,
        clinical_severity=9,
        required_ward="ICU",
        needs_oxygen=True,
    )

    beds = [
        Bed(
            bed_id="ICU-03",
            ward_type="ICU",
            status="AVAILABLE",
            oxygen_available=True,
        )
    ]

    allocated_bed = assign_bed(patient, beds)

    assert allocated_bed is not None
    assert allocated_bed.bed_id == "ICU-03"
    assert allocated_bed.status == "OCCUPIED"