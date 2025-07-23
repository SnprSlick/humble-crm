from datetime import date
from app.core.database import SessionLocal, init_db
from app.models.invoice import Invoice
from app.models.invoice_item import InvoiceItem
from app.models.drop_ship_status import DropShipStatus

# Initialize DB (create tables if needed)
init_db()
db = SessionLocal()

# Clear existing data (optional, for testing)
db.query(DropShipStatus).delete()
db.query(InvoiceItem).delete()
db.query(Invoice).delete()
db.commit()

# Create invoices
invoice1 = Invoice(date=date(2025, 7, 10), customer_name="John Smith")
invoice2 = Invoice(date=date(2025, 7, 11), customer_name="Emily Johnson")

db.add_all([invoice1, invoice2])
db.commit()

# Create invoice items
item1 = InvoiceItem(invoice_id=invoice1.id, name="Haltech Elite 1500", drop_ship=True)
item2 = InvoiceItem(invoice_id=invoice1.id, name="Boost Solenoid", drop_ship=False)

item3 = InvoiceItem(invoice_id=invoice2.id, name="Fuel Pressure Regulator", drop_ship=True)
item4 = InvoiceItem(invoice_id=invoice2.id, name="Wideband O2 Sensor", drop_ship=False)

db.add_all([item1, item2, item3, item4])
db.commit()

# Create drop ship statuses for drop-shipped items only
status1 = DropShipStatus(item_id=item1.id, status="Pending Contact", vendor="Haltech", notes="Need to email vendor.")
status2 = DropShipStatus(item_id=item3.id, status="Shipped", vendor="Radium", notes="Tracking #: 123456")

db.add_all([status1, status2])
db.commit()

db.close()
print("[✔] Seeded test drop ship data.")
