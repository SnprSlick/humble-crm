# backend/app/api/service_jobs.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime
import uuid, shutil, os

from sqlalchemy import func

from app.core.database import get_db
from app.models.service_job import ServiceJob, ServiceJobUpdate, ServiceJobPart, ServiceJobPhoto
from app.models.customer import Customer
from app.pydantic_models import ServiceJobCreate, ServiceJobUpdate as ServiceJobUpdateModel, ServiceJobOut

router = APIRouter(prefix="/api/service-jobs", tags=["Service Jobs"])

def generate_job_number():
    year = datetime.now().year
    timestamp = datetime.now().strftime("%m%d")
    random_suffix = str(uuid.uuid4())[:4].upper()
    return f"SJ-{year}-{timestamp}{random_suffix}"

@router.get("/", response_model=List[ServiceJobOut])
def get_service_jobs(status: Optional[str] = None, customer_id: Optional[int] = None, db: Session = Depends(get_db)):
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

@router.get("/active-and-quoted", response_model=List[ServiceJobOut])
def get_active_and_quoted_jobs(db: Session = Depends(get_db)):
    return db.query(ServiceJob).options(
        joinedload(ServiceJob.customer),
        joinedload(ServiceJob.updates),
        joinedload(ServiceJob.parts),
        joinedload(ServiceJob.photos)
    ).filter(func.lower(ServiceJob.status).in_(["quoted", "in_progress"])).order_by(ServiceJob.created_at.desc()).all()


@router.get("/{job_id}", response_model=ServiceJobOut)
def get_service_job(job_id: int, db: Session = Depends(get_db)):
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
    customer = db.query(Customer).filter(Customer.id == job.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    db_job = ServiceJob(job_number=generate_job_number(), **job.dict())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    db.add(ServiceJobUpdate(
        job_id=db_job.id,
        title="Job Created",
        description=f"Service job {db_job.job_number} has been created and is awaiting approval.",
        update_type="milestone",
        created_by="System"
    ))
    db.commit()
    return db_job

@router.patch("/{job_id}", response_model=ServiceJobOut)
def update_service_job(job_id: int, updates: ServiceJobUpdateModel, db: Session = Depends(get_db)):
    job = db.query(ServiceJob).filter(ServiceJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Service job not found")
    for field, value in updates.dict(exclude_unset=True).items():
        setattr(job, field, value)
    job.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(job)
    return job

@router.post("/{job_id}/updates")
def add_job_update(job_id: int, title: str, description: str, update_type: str = "progress", is_visible_to_customer: bool = True, created_by: str = "Admin", db: Session = Depends(get_db)):
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
def add_job_part(job_id: int, name: str, quantity: int = 1, unit_cost: Optional[float] = None, supplier: Optional[str] = None, part_number: Optional[str] = None, db: Session = Depends(get_db)):
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

@router.delete("/{job_id}")
def delete_service_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(ServiceJob).filter(ServiceJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return {"message": "Job deleted"}

@router.delete("/updates/{update_id}")
def delete_update(update_id: int, db: Session = Depends(get_db)):
    update = db.query(ServiceJobUpdate).filter(ServiceJobUpdate.id == update_id).first()
    if not update:
        raise HTTPException(status_code=404, detail="Update not found")
    db.delete(update)
    db.commit()
    return {"message": "Update deleted"}

@router.delete("/parts/{part_id}")
def delete_part(part_id: int, db: Session = Depends(get_db)):
    part = db.query(ServiceJobPart).filter(ServiceJobPart.id == part_id).first()
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    db.delete(part)
    db.commit()
    return {"message": "Part deleted"}

@router.post("/{job_id}/photos")
def upload_photo(job_id: int, caption: str = "", photo_type: str = "progress", is_visible_to_customer: bool = True, uploaded_by: str = "Admin", file: UploadFile = File(...), db: Session = Depends(get_db)):
    job = db.query(ServiceJob).filter(ServiceJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    save_path = f"uploaded_photos/{job.job_number}_{file.filename}"
    os.makedirs("uploaded_photos", exist_ok=True)
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    photo = ServiceJobPhoto(
        job_id=job.id,
        filename=file.filename,
        original_filename=file.filename,
        file_path=save_path,
        caption=caption,
        photo_type=photo_type,
        is_visible_to_customer=is_visible_to_customer,
        uploaded_by=uploaded_by
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo

@router.post("/{job_id}/generate-invoice")
def generate_wave_invoice(job_id: int, db: Session = Depends(get_db)):
    job = db.query(ServiceJob).options(joinedload(ServiceJob.customer), joinedload(ServiceJob.parts)).filter(ServiceJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.wave_invoice_id:
        raise HTTPException(status_code=400, detail="Invoice already exists")
    parts_total = sum(part.total_cost or 0 for part in job.parts)
    labor_total = (job.estimated_hours or 0) * 100
    total = parts_total + labor_total
    job.quoted_total = total
    job.final_total = total
    job.wave_invoice_id = f"WAVE-{job.job_number}"
    job.invoice_sent = True
    db.commit()
    return {"message": "Invoice generated", "invoice_id": job.wave_invoice_id, "total": total}

