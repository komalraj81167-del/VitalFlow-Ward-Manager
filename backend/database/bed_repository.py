from sqlalchemy.orm import Session

from backend.database.db_models import BedDB


def get_all_beds(db: Session) -> list[BedDB]:
    """Return all beds from the database."""
    return db.query(BedDB).all()


def get_bed_by_id(db: Session, bed_id: str) -> BedDB | None:
    """Find a bed by its bed ID."""
    return (
        db.query(BedDB)
        .filter(BedDB.bed_id == bed_id)
        .first()
    )


def create_bed(
    db: Session,
    bed_id: str,
    ward_type: str,
    status: str = "AVAILABLE",
    ventilator_available: bool = False,
    oxygen_available: bool = False,
    isolation_available: bool = False,
) -> BedDB:
    """Create and save a new bed."""
    bed = BedDB(
        bed_id=bed_id,
        ward_type=ward_type,
        status=status,
        ventilator_available=ventilator_available,
        oxygen_available=oxygen_available,
        isolation_available=isolation_available,
    )

    db.add(bed)
    db.commit()
    db.refresh(bed)

    return bed