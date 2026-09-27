from backend.database.connection import SessionLocal
from backend.database.db_models import BedDB


beds = [
    BedDB(
        bed_id="ICU-01",
        ward_type="ICU",
        status="AVAILABLE",
        ventilator_available=True,
        oxygen_available=True,
        isolation_available=True,
    ),
    BedDB(
        bed_id="ICU-02",
        ward_type="ICU",
        status="AVAILABLE",
        ventilator_available=False,
        oxygen_available=True,
        isolation_available=False,
    ),
    BedDB(
        bed_id="GENERAL-01",
        ward_type="GENERAL",
        status="AVAILABLE",
        ventilator_available=False,
        oxygen_available=True,
        isolation_available=False,
    ),
]


db = SessionLocal()

try:
    for bed in beds:
        existing_bed = (
            db.query(BedDB)
            .filter(BedDB.bed_id == bed.bed_id)
            .first()
        )

        if existing_bed is None:
            db.add(bed)

    db.commit()

    print("Beds seeded successfully!")

finally:
    db.close()