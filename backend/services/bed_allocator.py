from backend.models.bed import Bed
from backend.models.patient import Patient


def is_bed_compatible(patient: Patient, bed: Bed) -> bool:
    """
    Check whether an available bed satisfies the patient's
    simulated resource requirements.
    """

    # Bed must be available.
    if bed.status != "AVAILABLE":
        return False

    # Ward type must match the patient's requirement.
    if bed.ward_type != patient.required_ward:
        return False

    # Patient needs a ventilator.
    if patient.needs_ventilator and not bed.ventilator_available:
        return False

    # Patient needs oxygen.
    if patient.needs_oxygen and not bed.oxygen_available:
        return False

    # Patient needs isolation.
    if patient.needs_isolation and not bed.isolation_available:
        return False

    return True


def allocate_bed(patient: Patient, beds: list[Bed]) -> Bed | None:
    """
    Find the first compatible available bed.

    Returns:
        Bed object if a compatible bed exists.
        None if no compatible bed is available.
    """

    for bed in beds:
        if is_bed_compatible(patient, bed):
            return bed

    return None
def assign_bed(patient: Patient, beds: list[Bed]) -> Bed | None:
    """
    Find a compatible bed and mark it as OCCUPIED.
    Returns the allocated bed, or None if no compatible bed exists.
    """
    bed = allocate_bed(patient, beds)

    if bed is None:
        return None

    bed.status = "OCCUPIED"
    return bed