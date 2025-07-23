from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, index=True, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    source = Column(String)
<<<<<<< HEAD
    external_id = Column(JSON, default=[])
=======
    external_id = Column(JSON, default=[])  # Changed from {} to [] to store list of external IDs
>>>>>>> efebc3ffef6acf89fff72479c2547168be75158d
    synced_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(String, nullable=True)
    vehicle_make = Column(String, nullable=True)
    vehicle_model = Column(String, nullable=True)

<<<<<<< HEAD
    orders = relationship("Order", back_populates="customer")
    appointments = relationship("Appointment", back_populates="customer")
=======
    orders = relationship("Order", back_populates="customer")  # This relationship links to orders
    appointments = relationship("Appointment", back_populates="customer")


>>>>>>> efebc3ffef6acf89fff72479c2547168be75158d
