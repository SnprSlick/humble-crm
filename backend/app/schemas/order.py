from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class CustomerOut(BaseModel):
    id: int
    name: str
    email: Optional[str]
    phone: Optional[str]

    class Config:
        orm_mode = True

class OrderOut(BaseModel):
    id: int
    external_id: str
    invoice_number: Optional[str]
    source: str
    date: datetime
    total: float
    status: Optional[str] = None  # ✅ ADD THIS LINE
    customer: Optional[CustomerOut] = None
    shipping_address: Optional[str] = None
    shipping_carrier: Optional[str] = None
    shipping_tracking: Optional[str] = None

    class Config:
        orm_mode = True


