from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.base import Base

import typing
if typing.TYPE_CHECKING:
    from .order import Order
    from .customer import Customer

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)
    pickup_date = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    google_event_id = Column(String, nullable=True)

    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    invoice_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    service_id = Column(Integer, nullable=True)

    # ✅ Safe relationships using string references
    customer = relationship("Customer", back_populates="appointments")
    invoice = relationship("Order", back_populates="appointment")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
