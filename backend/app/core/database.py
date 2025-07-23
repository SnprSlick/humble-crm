# backend/app/core/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import customer, order, appointment
Base = customer.Base

# Use relative or absolute path to your actual DB file here
SQLALCHEMY_DATABASE_URL = "sqlite:///./humble_crm.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    # This will create tables according to your models if they don't exist
    Base.metadata.create_all(bind=engine)

from app.core.database import init_db

if __name__ == "__main__":
    init_db()
    print("✅ Database schema created.")

# Dependency for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
