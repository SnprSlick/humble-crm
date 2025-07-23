from app.models.order import Order

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from app.core.database import get_db
from app.models.customer import Customer
from app.schemas.customer import CustomerOut
from sqlalchemy.orm import joinedload

router = APIRouter()

@router.get("/debug/orders")
def debug_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).all()
    return [
        {
            "id": o.id,
            "external_id": o.external_id,
            "customer_id": o.customer_id,
            "date": o.date,
            "total": o.total,
            "source": o.source,
        }
        for o in orders
    ]

@router.get("/customers", response_model=List[CustomerOut])
def get_customers(db: Session = Depends(get_db)):
    return db.query(Customer).options(joinedload(Customer.orders)).all()


class CustomerUpdate(BaseModel):
    notes: str | None = None
    vehicle_make: str | None = None
    vehicle_model: str | None = None


@router.patch("/customers/{customer_id}")
def update_customer(customer_id: int, payload: CustomerUpdate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    if payload.notes is not None:
        customer.notes = payload.notes
    if payload.vehicle_make is not None:
        customer.vehicle_make = payload.vehicle_make
    if payload.vehicle_model is not None:
        customer.vehicle_model = payload.vehicle_model

    db.commit()
    db.refresh(customer)
    return customer
