from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.models.appointment import Appointment
from app.pydantic_models import AppointmentCreate, AppointmentUpdate, AppointmentOut
from app.google.calendar_service import create_event

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.get("/", response_model=List[AppointmentOut])
def get_appointments(db: Session = Depends(get_db)):
    return db.query(Appointment).all()

@router.get("/calendar-events")
def get_appointment_calendar_events(db: Session = Depends(get_db)):
    """
    Returns appointment data formatted like calendar events.
    """
    appointments = db.query(Appointment).all()
    return [
        {
            "id": f"appt-{appt.id}",
            "title": appt.title,
            "start": appt.start_time.isoformat(),
            "end": (appt.end_time or appt.start_time).isoformat(),
            "tooltip": appt.notes or "",
            "description": appt.notes or "",
            "source": "crm",
        }
        for appt in appointments
    ]

@router.post("/", response_model=AppointmentOut)
def create_appointment(appt: AppointmentCreate, db: Session = Depends(get_db)):
    appointment = Appointment(**appt.dict())
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    # Send to Google Calendar
    try:
        create_event(
            title=appointment.title,
            description=appointment.notes or "",
            start=appointment.start_time,
            end=appointment.end_time or appointment.start_time,
        )
    except Exception as e:
        print(f"⚠️ Google Calendar sync failed: {e}")

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
