from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.appointment import Appointment
from app.models.customer import Customer
from app.models.order import Order
from app.models.line_item import LineItem

router = APIRouter()


@router.get("/dashboard/reminders")
def get_reminders(db: Session = Depends(get_db)):
    today = datetime.now().date()
    appointments = db.query(Appointment).filter(Appointment.start_time >= today).all()
    return [f"{a.start_time.strftime('%I:%M %p')} — {a.title or a.notes}" for a in appointments]


@router.get("/dashboard/inactive-customers")
def get_inactive_customers(days: int = 14, db: Session = Depends(get_db)):
    cutoff = datetime.now() - timedelta(days=days)
    customers = db.query(Customer).filter(
        (Customer.last_contacted == None) | (Customer.last_contacted < cutoff)
    ).all()
    return [
        {
            "name": c.name,
            "days_since_contact": (datetime.now() - (c.last_contacted or datetime(2000, 1, 1))).days
        }
        for c in customers
    ]


@router.get("/appointments/today")
def get_todays_appointments(db: Session = Depends(get_db)):
    today = datetime.now().date()
    tomorrow = today + timedelta(days=1)
    appointments = db.query(Appointment).filter(
        Appointment.start_time >= today,
        Appointment.start_time < tomorrow,
    ).all()
    return [
        {
            "id": a.id,
            "customer": a.customer.name if a.customer else "Unassigned",
            "type": a.appointment_type,
            "time": a.start_time.strftime("%I:%M %p")
        }
        for a in appointments
    ]


@router.get("/drop_ship_orders/summary")
def drop_ship_summary(db: Session = Depends(get_db)):
    line_items = db.query(LineItem).filter(LineItem.shipping_method == "drop-ship").all()
    return [
        {
            "customer": item.order.customer.name if item.order and item.order.customer else "Unknown",
            "item": item.name,
            "status": item.shipping_method or "Pending"
        }
        for item in line_items
    ]


@router.get("/orders/latest")
def latest_orders(limit: int = 5, db: Session = Depends(get_db)):
    orders = db.query(Order).order_by(Order.date.desc()).limit(limit).all()
    return [
        {
            "invoice_number": o.invoice_number,
            "customer_name": o.customer.name if o.customer else "Unknown",
            "total": o.total
        }
        for o in orders
    ]
