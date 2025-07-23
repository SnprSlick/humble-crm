from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.customer import Base

class DropShipStatus(Base):
    __tablename__ = "drop_ship_status"

    item_id = Column(Integer, ForeignKey("invoice_items.id"), primary_key=True)
    status = Column(String, default="Pending Contact")
    vendor = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

    # ✅ Relationship to InvoiceItem
    item = relationship("InvoiceItem", back_populates="drop_ship_status")
