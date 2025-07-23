from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.customer import Customer
from app.models.order import Order
from app.models.appointment import Appointment  # ✅ ← this fixes the error
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


router = APIRouter(prefix="/appointments", tags=["Appointments"])



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

    class Config:
        orm_mode = True


@router.get("/", response_model=list[AppointmentOut])
def get_appointments(db: Session = Depends(get_db)):
    return db.query(Appointment).all()


@router.post("/", response_model=AppointmentOut)
def create_appointment(appt: AppointmentCreate, db: Session = Depends(get_db)):
    appointment = Appointment(**appt.dict())
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


@router.patch("/{appointment_id}", response_model=AppointmentOut)
def update_appointment(appointment_id: int, appt: AppointmentUpdate, db: Session = Depends(get_db)):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    for key, value in appt.dict(exclude_unset=True).items():
        setattr(appointment, key, value)

    db.commit()
    db.refresh(appointment)
    return appointment


@router.delete("/{appointment_id}")
def delete_appointment(appointment_id: int, db: Session = Depends(get_db)):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    db.delete(appointment)
    db.commit()
    return {"success": True}
