from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class OrderOut(BaseModel):
    id: int
    external_id: Optional[str]
    date: datetime
    total: Optional[float]
    source: str

    class Config:
        orm_mode = True

class CustomerOut(BaseModel):
    id: int
    name: str
    email: Optional[str]
    phone: Optional[str]
    source: str
    notes: Optional[str]
    vehicle_make: Optional[str]
    vehicle_model: Optional[str]
    orders: List[OrderOut] = []  # ✅ Include related orders here

    class Config:
        orm_mode = True
