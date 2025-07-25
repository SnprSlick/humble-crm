from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Add these to backend/app/pydantic_models.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class ServiceJobCreate(BaseModel):
    customer_id: int
    title: str
    description: Optional[str] = None
    vehicle_year: Optional[str] = None
    vehicle_make: Optional[str] = None
    vehicle_model: Optional[str] = None
    vehicle_vin: Optional[str] = None
    vehicle_mileage: Optional[int] = None
    priority: str = "normal"
    estimated_hours: Optional[float] = None
    estimated_completion: Optional[datetime] = None
    quoted_total: Optional[float] = None
    deposit_required: Optional[float] = None
    notes: Optional[str] = None

class ServiceJobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    estimated_completion: Optional[datetime] = None
    quoted_total: Optional[float] = None
    final_total: Optional[float] = None
    deposit_paid: Optional[float] = None
    notes: Optional[str] = None
    internal_notes: Optional[str] = None

class ServiceJobUpdateOut(BaseModel):
    id: int
    job_id: int
    title: str
    description: str
    update_type: str
    is_visible_to_customer: bool
    created_at: datetime
    created_by: Optional[str]

    class Config:
        orm_mode = True

class ServiceJobPartOut(BaseModel):
    id: int
    job_id: int
    name: str
    part_number: Optional[str]
    quantity: int
    unit_cost: Optional[float]
    total_cost: Optional[float]
    supplier: Optional[str]
    status: str
    tracking_number: Optional[str]
    expected_delivery: Optional[datetime]

    class Config:
        orm_mode = True

class ServiceJobPhotoOut(BaseModel):
    id: int
    job_id: int
    filename: str
    original_filename: Optional[str]
    file_path: str
    caption: Optional[str]
    photo_type: str
    is_visible_to_customer: bool
    uploaded_at: datetime
    uploaded_by: Optional[str]

    class Config:
        orm_mode = True

class CustomerBasic(BaseModel):
    id: int
    name: str
    email: Optional[str]
    phone: Optional[str]

    class Config:
        orm_mode = True

class ServiceJobOut(BaseModel):
    id: int
    job_number: str
    customer_id: int
    title: str
    description: Optional[str]
    vehicle_year: Optional[str]
    vehicle_make: Optional[str]
    vehicle_model: Optional[str]
    vehicle_vin: Optional[str]
    vehicle_mileage: Optional[int]
    status: str
    priority: str
    estimated_hours: Optional[float]
    actual_hours: Optional[float]
    estimated_completion: Optional[datetime]
    quoted_total: Optional[float]
    final_total: Optional[float]
    deposit_required: Optional[float]
    deposit_paid: float
    wave_invoice_id: Optional[str]
    invoice_sent: bool
    notes: Optional[str]
    internal_notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    
    # Related data
    customer: Optional[CustomerBasic]
    updates: List[ServiceJobUpdateOut] = []
    parts: List[ServiceJobPartOut] = []
    photos: List[ServiceJobPhotoOut] = []

    class Config:
        orm_mode = True

class AppointmentCreate(BaseModel):
    title: str
    start_time: datetime
    end_time: Optional[datetime] = None
    pickup_date: Optional[datetime] = None
    notes: Optional[str] = None
    customer_id: Optional[int] = None
    invoice_id: Optional[int] = None
    service_id: Optional[int] = None

class AppointmentUpdate(AppointmentCreate):
    pass

class AppointmentOut(BaseModel):
    id: int
    title: str
    start_time: datetime
    end_time: Optional[datetime]
    pickup_date: Optional[datetime]
    notes: Optional[str]
    customer_id: Optional[int]
    invoice_id: Optional[int]
    service_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
