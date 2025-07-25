from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.orm import relationship
from app.core.base import Base
from datetime import datetime

import typing
if typing.TYPE_CHECKING:
    from .appointment import Appointment
    from .order import Order
    from .user_customer import UserCustomer

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, index=True, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    source = Column(String)
    external_id = Column(JSON, default=[])
    synced_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(String, nullable=True)
    vehicle_make = Column(String, nullable=True)
    vehicle_model = Column(String, nullable=True)
    last_contacted = Column(DateTime, nullable=True)

    # ✅ Use string references
    orders = relationship("Order", back_populates="customer")
    appointments = relationship("Appointment", back_populates="customer")
    user_account = relationship("UserCustomer", back_populates="customer", uselist=False)
    service_jobs = relationship("ServiceJob", back_populates="customer")

