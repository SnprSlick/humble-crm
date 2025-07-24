from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from email.utils import parsedate_to_datetime

from app.models.customer import Base
from app.models.line_item import LineItem

import typing
if typing.TYPE_CHECKING:
    from .appointment import Appointment  # only for linting/autocomplete

def parse_datetime(dt_str):
    if not dt_str:
        return None
    try:
        # Try RFC 2822 (BigCommerce format)
        return parsedate_to_datetime(dt_str)
    except Exception:
        try:
            # Try ISO 8601 (Wave format)
            return datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
        except Exception as e:
            print(f"[PARSE ERROR] Could not parse datetime: {dt_str} | {e}")
            return None

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    source = Column(String)
    external_id = Column(String, nullable=True)
    invoice_number = Column(String, nullable=True)

    date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, nullable=True)
    due_date = Column(DateTime, nullable=True)

    subtotal = Column(Float, nullable=True)
    tax_total = Column(Float, nullable=True)
    shipping_total = Column(Float, nullable=True)
    discount_total = Column(Float, nullable=True)
    total = Column(Float, nullable=True)
    amount_due = Column(Float, nullable=True)
    currency = Column(String, nullable=True)

    status = Column(String, nullable=True)
    shipping_carrier = Column(String, nullable=True)
    shipping_tracking = Column(String, nullable=True)

    billing_address = Column(JSON, nullable=True)
    shipping_address = Column(JSON, nullable=True)

    raw_data = Column(JSON, nullable=True)

    customer = relationship("Customer", back_populates="orders")
    line_items = relationship("LineItem", back_populates="order", cascade="all, delete-orphan")

    # Optional: re-enable when Appointment model is ready
    appointment = relationship("Appointment", back_populates="invoice", uselist=False)
