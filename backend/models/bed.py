from pydantic import BaseModel


class Bed(BaseModel):
    bed_id: str
    ward_type: str
    status: str
    ventilator_available: bool = False
    oxygen_available: bool = False
    isolation_available: bool = False