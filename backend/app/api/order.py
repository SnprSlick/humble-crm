from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.order import Order
from app.schemas.order import OrderOut
import logging

router = APIRouter()

@router.get("/orders", response_model=list[OrderOut])
def get_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).options(joinedload(Order.customer)).all()
    logging.info(f"Returning {len(orders)} orders from DB")
    return orders

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
