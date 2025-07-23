from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.models.appointment import Appointment
from app.pydantic_models import AppointmentCreate, AppointmentUpdate, AppointmentOut
from app.google.calendar_service import create_event, delete_event

router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.get("/", response_model=List[AppointmentOut])
def get_appointments(db: Session = Depends(get_db)):
    return db.query(Appointment).all()


@router.get("/calendar-events")
def get_appointment_calendar_events(db: Session = Depends(get_db)):
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
    print("📥 Received POST /appointments/")
    print("🧾 Incoming payload:", appt.dict())

    appointment = Appointment(**appt.dict())

    try:
        google_id = create_event(
            title=appointment.title,
            description=appointment.notes or "",
            start=appointment.start_time,
            end=appointment.end_time or appointment.start_time,
        )
        appointment.google_event_id = google_id
        print(f"✅ Google event created and linked to appointment: {google_id}")
    except Exception as e:
        print(f"⚠️ Google Calendar sync failed: {e}")

    try:
        db.add(appointment)
        db.commit()
        db.refresh(appointment)
        print(f"✅ Appointment saved: ID {appointment.id}")
    except Exception as db_error:
        print(f"❌ DB commit failed: {db_error}")
        raise HTTPException(status_code=500, detail="Failed to save appointment")

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

    print(f"🗑️ Deleting appointment ID {appointment.id} (Google event: {appointment.google_event_id})")

    try:
        if appointment.google_event_id:
            delete_event(appointment.google_event_id)
            print(f"✅ Google Calendar event {appointment.google_event_id} deleted")
        else:
            print("ℹ️ No Google Calendar event ID found to delete.")
    except Exception as e:
        print(f"❌ Failed to delete from Google Calendar: {e}")

    db.delete(appointment)
    db.commit()
    return {"success": True}
