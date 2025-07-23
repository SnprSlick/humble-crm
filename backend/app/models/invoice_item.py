from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.models.customer import Base

class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"))
    name = Column(String)
    drop_ship = Column(Boolean, default=False)

    # ✅ Relationship to DropShipStatus
    drop_ship_status = relationship("DropShipStatus", uselist=False, back_populates="item")
