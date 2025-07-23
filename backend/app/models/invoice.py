from sqlalchemy import Column, Integer, String, Date
from app.models.customer import Base

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date)
    customer_name = Column(String)
