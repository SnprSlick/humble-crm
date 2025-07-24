from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from passlib.hash import bcrypt
from pydantic import BaseModel
from app.core.database import get_db
from app.models.user_customer import UserCustomer

router = APIRouter(prefix="/portal")

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    token: str
    customer_id: int

@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(UserCustomer).filter(UserCustomer.email == data.email).first()
    if not user or not bcrypt.verify(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Temporary token (stubbed) — replace with JWT later
    return {"token": f"stub-token-{user.id}", "customer_id": user.customer_id}
