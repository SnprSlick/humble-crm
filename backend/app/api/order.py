from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.order import Order
from app.schemas.order import OrderOut
import logging

router = APIRouter()

@router.get("/orders")  # No response_model here to allow custom override
def get_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).options(joinedload(Order.customer)).all()
    logging.info(f"Returning {len(orders)} orders from DB")

    return [
        {
            "id": o.id,
            "external_id": None if o.source == "wave" else o.external_id,
            "invoice_number": o.invoice_number,
            "source": o.source,
            "date": o.date,
            "total": o.total,
            "status": o.status,
            "customer": {
                "id": o.customer.id,
                "name": o.customer.name,
                "email": o.customer.email,
                "phone": o.customer.phone,
            } if o.customer else None,
            "shipping_address": o.shipping_address,
            "shipping_carrier": o.shipping_carrier,
            "shipping_tracking": o.shipping_tracking,
        }
        for o in orders
    ]

@router.get("/orders/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = (
        db.query(Order)
        .options(joinedload(Order.customer))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.get("/orders/latest")
def latest_orders(limit: int = Query(default=5, ge=1, le=50), db: Session = Depends(get_db)):
    orders = db.query(Order).order_by(Order.date.desc()).limit(limit).all()
    return [
        {
            "invoice_number": o.invoice_number,
            "customer_name": o.customer.name if o.customer else "Unknown"
        }
        for o in orders
    ]
