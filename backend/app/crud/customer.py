from app.models.customer import Customer
from app.core.database import SessionLocal

def get_all_customers():
    db = SessionLocal()
    return db.query(Customer).all()

def find_customer_to_merge(db, new_customer):
    if new_customer.get("email"):
        by_email = db.query(Customer).filter_by(email=new_customer['email']).first()
        if by_email:
            return by_email

    name_matches = db.query(Customer).filter_by(name=new_customer['name']).all()
    for match in name_matches:
        if (match.phone == new_customer.get('phone')) or (match.address == new_customer.get('address')):
            return match

    return None

def merge_or_create_customer(source, customer_data):
    db = SessionLocal()
    existing = find_customer_to_merge(db, customer_data)

    if existing:
        for field in ['email', 'phone', 'address']:
            if not getattr(existing, field) and customer_data.get(field):
                setattr(existing, field, customer_data[field])

        existing.source = "both" if existing.source != source else source
        existing.external_ids[source] = customer_data['external_id']
    else:
        existing = Customer(
            name=customer_data['name'],
            email=customer_data.get('email'),
            phone=customer_data.get('phone'),
            address=customer_data.get('address'),
            source=source,
            external_ids={source: customer_data['external_id']}
        )
        db.add(existing)

    db.commit()
    db.refresh(existing)
    db.close()
