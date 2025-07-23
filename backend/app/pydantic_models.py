from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AppointmentCreate(BaseModel):
    title: str
    start_time: datetime
    end_time: Optional[datetime] = None
    pickup_date: Optional[datetime] = None
    notes: Optional[str] = None
    customer_id: Optional[int] = None
    invoice_id: Optional[int] = None
    service_id: Optional[int] = None

class AppointmentUpdate(AppointmentCreate):
    pass

class AppointmentOut(BaseModel):
    id: int
    title: str
    start_time: datetime
    end_time: Optional[datetime]
    pickup_date: Optional[datetime]
    notes: Optional[str]
    customer_id: Optional[int]
    invoice_id: Optional[int]
    service_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
