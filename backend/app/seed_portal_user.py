import os
from sqlalchemy.orm import Session
from passlib.hash import bcrypt
from app.core.database import SessionLocal
from app.models.customer import Customer
from app.models.user_customer import UserCustomer

def seed_test_user():
    db: Session = SessionLocal()

    # Create a test customer
    customer = Customer(
        name="Test Customer",
        email="test@example.com",
        phone="555-1234",
        notes="Test account for portal login",
        vehicle_make="Honda",
        vehicle_model="Civic"
    )
    db.add(customer)
    db.flush()  # So we get customer.id before commit

    # Create a user login for that customer
    user = UserCustomer(
        email="test@example.com",
        password_hash=bcrypt.hash("password123"),
        customer_id=customer.id
    )
    db.add(user)
    db.commit()
    db.close()
    print("✅ Seeded test user: test@example.com / password123")

if __name__ == "__main__":
    seed_test_user()
