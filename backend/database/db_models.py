from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from backend.database.connection import Base


class PatientDB(Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    patient_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)

    age: Mapped[int] = mapped_column(Integer, nullable=False)
    heart_rate: Mapped[float] = mapped_column(Float, nullable=False)
    systolic_bp: Mapped[float] = mapped_column(Float, nullable=False)
    spo2: Mapped[float] = mapped_column(Float, nullable=False)
    clinical_severity: Mapped[float] = mapped_column(Float, nullable=False)

    required_ward: Mapped[str] = mapped_column(String(50), nullable=False)

    needs_ventilator: Mapped[bool] = mapped_column(Boolean, default=False)
    needs_oxygen: Mapped[bool] = mapped_column(Boolean, default=False)
    needs_isolation: Mapped[bool] = mapped_column(Boolean, default=False)

    severity_score: Mapped[float] = mapped_column(Float, nullable=False)
    priority: Mapped[str] = mapped_column(String(20), nullable=False)

    assigned_bed_id: Mapped[str] = mapped_column(String(50), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )


class BedDB(Base):
    __tablename__ = "beds"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    bed_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)

    ward_type: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)

    ventilator_available: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    oxygen_available: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    isolation_available: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )