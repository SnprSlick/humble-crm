# backend/app/models/service_job.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.base import Base

import typing
if typing.TYPE_CHECKING:
    from .customer import Customer
    from .order import Order

class ServiceJob(Base):
    __tablename__ = "service_jobs"

    id = Column(Integer, primary_key=True, index=True)
    job_number = Column(String, unique=True, nullable=False)  # Auto-generated: SJ-2025-0001
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    
    # Job Details
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    vehicle_year = Column(String, nullable=True)
    vehicle_make = Column(String, nullable=True)
    vehicle_model = Column(String, nullable=True)
    vehicle_vin = Column(String, nullable=True)
    vehicle_mileage = Column(Integer, nullable=True)
    
    # Status and Timing
    status = Column(String, default="quoted")  # quoted, approved, in_progress, completed, delivered
    priority = Column(String, default="normal")  # low, normal, high, urgent
    estimated_hours = Column(Float, nullable=True)
    actual_hours = Column(Float, nullable=True)
    estimated_completion = Column(DateTime, nullable=True)
    
    # Financial
    quoted_total = Column(Float, nullable=True)
    final_total = Column(Float, nullable=True)
    deposit_required = Column(Float, nullable=True)
    deposit_paid = Column(Float, default=0.0)
    
    # External Integration
    wave_invoice_id = Column(String, nullable=True)  # Link to Wave invoice
    invoice_sent = Column(Boolean, default=False)
    
    # Metadata
    notes = Column(Text, nullable=True)
    internal_notes = Column(Text, nullable=True)  # Not visible to customer
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    customer = relationship("Customer", back_populates="service_jobs")
    updates = relationship("ServiceJobUpdate", back_populates="job", cascade="all, delete-orphan")
    parts = relationship("ServiceJobPart", back_populates="job", cascade="all, delete-orphan")
    photos = relationship("ServiceJobPhoto", back_populates="job", cascade="all, delete-orphan")

class ServiceJobUpdate(Base):
    __tablename__ = "service_job_updates"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("service_jobs.id"), nullable=False)
    
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    update_type = Column(String, default="progress")  # progress, issue, milestone, completion
    is_visible_to_customer = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String, nullable=True)  # Admin user who created update
    
    job = relationship("ServiceJob", back_populates="updates")

class ServiceJobPart(Base):
    __tablename__ = "service_job_parts"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("service_jobs.id"), nullable=False)
    
    name = Column(String, nullable=False)
    part_number = Column(String, nullable=True)
    quantity = Column(Integer, default=1)
    unit_cost = Column(Float, nullable=True)
    total_cost = Column(Float, nullable=True)
    supplier = Column(String, nullable=True)
    status = Column(String, default="needed")  # needed, ordered, received, installed
    tracking_number = Column(String, nullable=True)
    expected_delivery = Column(DateTime, nullable=True)
    
    job = relationship("ServiceJob", back_populates="parts")

class ServiceJobPhoto(Base):
    __tablename__ = "service_job_photos"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("service_jobs.id"), nullable=False)
    
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=True)
    file_path = Column(String, nullable=False)
    caption = Column(String, nullable=True)
    photo_type = Column(String, default="progress")  # progress, before, after, issue, dyno
    is_visible_to_customer = Column(Boolean, default=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    uploaded_by = Column(String, nullable=True)
    
    job = relationship("ServiceJob", back_populates="photos")

# Update Customer model to include service jobs relationship
# Add this to backend/app/models/customer.py:
# service_jobs = relationship("ServiceJob", back_populates="customer")


# backend/app/api/service_jobs.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, timedelta
import uuid

from app.core.database import get_db
from app.models.service_job import ServiceJob, ServiceJobUpdate, ServiceJobPart, ServiceJobPhoto
from app.models.customer import Customer
from app.pydantic_models import ServiceJobCreate, ServiceJobUpdate as ServiceJobUpdateModel, ServiceJobOut

router = APIRouter(prefix="/api/service-jobs", tags=["Service Jobs"])

def generate_job_number():
    """Generate unique job number like SJ-2025-0001"""
    year = datetime.now().year
    # In production, you'd want to query the database for the next sequential number
    # For now, using timestamp-based approach
    timestamp = datetime.now().strftime("%m%d")
    random_suffix = str(uuid.uuid4())[:4].upper()
    return f"SJ-{year}-{timestamp}{random_suffix}"

@router.get("/", response_model=List[ServiceJobOut])
def get_service_jobs(
    status: Optional[str] = None,
    customer_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all service jobs with optional filtering"""
    query = db.query(ServiceJob).options(
        joinedload(ServiceJob.customer),
        joinedload(ServiceJob.updates),
        joinedload(ServiceJob.parts),
        joinedload(ServiceJob.photos)
    )
    
    if status:
        query = query.filter(ServiceJob.status == status)
    if customer_id:
        query = query.filter(ServiceJob.customer_id == customer_id)
        
    return query.order_by(ServiceJob.created_at.desc()).all()

@router.get("/{job_id}", response_model=ServiceJobOut)
def get_service_job(job_id: int, db: Session = Depends(get_db)):
    """Get specific service job with all related data"""
    job = db.query(ServiceJob).options(
        joinedload(ServiceJob.customer),
        joinedload(ServiceJob.updates),
        joinedload(ServiceJob.parts),
        joinedload(ServiceJob.photos)
    ).filter(ServiceJob.id == job_id).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Service job not found")
    return job

@router.post("/", response_model=ServiceJobOut)
def create_service_job(job: ServiceJobCreate, db: Session = Depends(get_db)):
    """Create new service job"""
    # Verify customer exists
    customer = db.query(Customer).filter(Customer.id == job.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Create job with auto-generated job number
    db_job = ServiceJob(
        job_number=generate_job_number(),
        **job.dict()
    )
    
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    
    # Create initial update
    initial_update = ServiceJobUpdate(
        job_id=db_job.id,
        title="Job Created",
        description=f"Service job {db_job.job_number} has been created and is awaiting approval.",
        update_type="milestone",
        created_by="System"
    )
    db.add(initial_update)
    db.commit()
    
    return db_job

@router.patch("/{job_id}", response_model=ServiceJobOut)
def update_service_job(
    job_id: int, 
    updates: ServiceJobUpdateModel, 
    db: Session = Depends(get_db)
):
    """Update service job"""
    job = db.query(ServiceJob).filter(ServiceJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Service job not found")
    
    update_data = updates.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)
    
    job.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(job)
    return job

@router.post("/{job_id}/updates")
def add_job_update(
    job_id: int,
    title: str,
    description: str,
    update_type: str = "progress",
    is_visible_to_customer: bool = True,
    created_by: str = "Admin",
    db: Session = Depends(get_db)
):
    """Add update to service job"""
    job = db.query(ServiceJob).filter(ServiceJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Service job not found")
    
    update = ServiceJobUpdate(
        job_id=job_id,
        title=title,
        description=description,
        update_type=update_type,
        is_visible_to_customer=is_visible_to_customer,
        created_by=created_by
    )
    
    db.add(update)
    db.commit()
    db.refresh(update)
    return update

@router.post("/{job_id}/parts")
def add_job_part(
    job_id: int,
    name: str,
    quantity: int = 1,
    unit_cost: Optional[float] = None,
    supplier: Optional[str] = None,
    part_number: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Add part to service job"""
    job = db.query(ServiceJob).filter(ServiceJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Service job not found")
    
    total_cost = (unit_cost * quantity) if unit_cost else None
    
    part = ServiceJobPart(
        job_id=job_id,
        name=name,
        part_number=part_number,
        quantity=quantity,
        unit_cost=unit_cost,
        total_cost=total_cost,
        supplier=supplier
    )
    
    db.add(part)
    db.commit()
    db.refresh(part)
    return part

@router.get("/customer/{customer_id}")
def get_customer_jobs(customer_id: int, db: Session = Depends(get_db)):
    """Get all jobs for a specific customer (for customer portal)"""
    jobs = db.query(ServiceJob).options(
        joinedload(ServiceJob.updates.and_(ServiceJobUpdate.is_visible_to_customer == True)),
        joinedload(ServiceJob.parts),
        joinedload(ServiceJob.photos.and_(ServiceJobPhoto.is_visible_to_customer == True))
    ).filter(ServiceJob.customer_id == customer_id).order_by(ServiceJob.created_at.desc()).all()
    
    return jobs

@router.get("/{job_id}/customer-view")
def get_job_customer_view(job_id: int, customer_id: int, db: Session = Depends(get_db)):
    """Get service job from customer perspective (filtered content)"""
    job = db.query(ServiceJob).options(
        joinedload(ServiceJob.customer),
        joinedload(ServiceJob.updates.and_(ServiceJobUpdate.is_visible_to_customer == True)),
        joinedload(ServiceJob.parts),
        joinedload(ServiceJob.photos.and_(ServiceJobPhoto.is_visible_to_customer == True))
    ).filter(
        ServiceJob.id == job_id,
        ServiceJob.customer_id == customer_id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Service job not found")
    
    return job

@router.post("/{job_id}/generate-invoice")
async def generate_wave_invoice(job_id: int, db: Session = Depends(get_db)):
    """Generate Wave invoice for service job"""
    job = db.query(ServiceJob).options(joinedload(ServiceJob.customer), joinedload(ServiceJob.parts)).filter(ServiceJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Service job not found")
    
    if job.wave_invoice_id:
        raise HTTPException(status_code=400, detail="Invoice already exists for this job")
    
    # TODO: Integrate with Wave API to create invoice
    # For now, simulate the process
    
    # Calculate total from parts + labor
    parts_total = sum(part.total_cost or 0 for part in job.parts)
    labor_total = (job.estimated_hours or 0) * 100  # $100/hour rate
    total = parts_total + labor_total
    
    # Update job with totals
    job.quoted_total = total
    job.final_total = total
    job.wave_invoice_id = f"WAVE-{job.job_number}"  # Placeholder
    job.invoice_sent = True
    
    db.commit()
    
    return {
        "message": "Invoice generated successfully",
        "invoice_id": job.wave_invoice_id,
        "total": total
    }