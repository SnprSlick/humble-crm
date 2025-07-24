import os
import os
db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "humble_crm.db"))
print(f"[DEBUG] Writing to DB: {db_path}")
print(f"[DEBUG] Exists? {os.path.exists(db_path)}")
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.order import Order, parse_datetime
from app.models.customer import Customer
from app.models.line_item import LineItem
from app.models.customer import Base

# Load env vars
env_path = os.path.join(os.path.dirname(__file__), "../key.env")
load_dotenv(env_path)

# Setup DB connection
db_path = os.path.join(os.path.dirname(__file__), "../humble_crm.db")
DATABASE_URL = f"sqlite:///{db_path}"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Ensure schema exists
Base.metadata.create_all(bind=engine)

# Simulate BigCommerce raw order data
sample_raw_date = "Tue, 04 Dec 2018 03:01:32 +0000"  # RFC 2822
parsed_date = parse_datetime(sample_raw_date)
print(f"\n[TEST] Raw: {sample_raw_date}")
print(f"[TEST] Parsed datetime: {parsed_date} ({type(parsed_date)})")

# Insert test customer and order
db = SessionLocal()

# Create a test customer
customer = Customer(
    name="Date Tester",
    email="test@example.com",
    phone="1234567890",
    source="Test",
    external_id="test-date-001"
)
db.add(customer)
db.flush()  # Get ID before insert

# Insert test order
order = Order(
    external_id="test-order-001",
    invoice_number="TST123",
    source="Test",
    date=parsed_date,
    created_at=parsed_date,
    customer_id=customer.id,
    total=123.45,
)
db.add(order)
db.commit()

# Read back
retrieved = db.query(Order).filter_by(external_id="test-order-001").first()
print(f"\n[VERIFY] Retrieved Order Date: {retrieved.date}")
print(f"[VERIFY] Retrieved Created At: {retrieved.created_at}")

db.close()
