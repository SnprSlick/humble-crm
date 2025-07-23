@echo off
cd /d "C:\Humble CRM\backend"
echo Wiping existing customers and orders...

py -c "from app.core.database import SessionLocal; from app.models.customer import Customer; from app.models.order import Order; db = SessionLocal(); db.query(Order).delete(); db.query(Customer).delete(); db.commit(); db.close(); print('✅ Wiped all customers and orders.')"

echo Running sync...
py -m app.sync.sync_customers

pause
