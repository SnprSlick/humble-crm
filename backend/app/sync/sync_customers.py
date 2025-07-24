import os
from dotenv import load_dotenv
from app.sync.sync_wave import fetch_wave_invoices_and_customers
from app.sync.sync_bigcommerce import fetch_bigcommerce_orders_and_customers
from app.core.database import SessionLocal 
from app.models.customer import Customer
from app.models.order import Order, parse_datetime
from app.models.line_item import LineItem

env_path = os.path.join(os.path.dirname(__file__), "../key.env")
load_dotenv(env_path)

def merge_and_sync_customers(wave_customers, wave_invoices, bigc_customers, bigc_orders):
    db = SessionLocal()

    db.query(LineItem).delete()
    db.query(Order).delete()
    db.query(Customer).delete()

    combined_customers = wave_customers + bigc_customers
    unique_customers = {}
    for customer in combined_customers:
        key = (
            (customer["name"] or "").strip().lower(),
            (customer.get("email") or "").strip().lower()
        )
        if key not in unique_customers:
            unique_customers[key] = customer

    print(f"[MERGE] Unique customers: {len(unique_customers)}")

    id_map = {}
    contact_tracker = {}  # external_id -> latest_contacted
    for cust in unique_customers.values():
        db_cust = Customer(
            external_id=cust["external_id"],
            name=cust["name"],
            email=cust.get("email"),
            phone=cust.get("phone"),
            source=cust.get("source"),
        )
        db.add(db_cust)
        db.flush()
        id_map[cust["external_id"]] = db_cust.id
        contact_tracker[cust["external_id"]] = None

    db.commit()

    def insert_orders(orders, source):
        print(f"[INSERT DEBUG] Processing {len(orders)} orders for {source}")
        for i, order in enumerate(orders):
            cust_ext_id = order.get("customer_external_id")
            cust_id = id_map.get(cust_ext_id)
            if not cust_id:
                if source == "Wave":
                    print(f"[SKIP] Order #{i} skipped — no matching customer ID for external_id: {cust_ext_id}")
                continue

            created_at = order.get("created_at")
            if isinstance(created_at, str):
                created_at = parse_datetime(created_at)

            due_date = order.get("due_date")
            if isinstance(due_date, str):
                due_date = parse_datetime(due_date)

            if source == "Wave":
                print(f"[DEBUG] Wave Invoice #{order.get('invoice_number')} | "
                      f"created_at: {order.get('created_at')} | parsed: {created_at}")
                print(f"[ADD] Adding order #{i}: Invoice #{order.get('invoice_number')} for customer_id {cust_id}")

            if created_at:
                if contact_tracker[cust_ext_id] is None or created_at > contact_tracker[cust_ext_id]:
                    contact_tracker[cust_ext_id] = created_at

            db_order = Order(
                external_id=order["external_id"],
                invoice_number=order.get("invoice_number"),
                status=order.get("status"),
                currency=order.get("currency"),
                date=created_at,
                created_at=created_at,
                due_date=due_date,
                customer_id=cust_id,
                amount_due=order.get("amount_due"),
                total=order.get("total"),
                tax_total=order.get("tax_total"),
                source=source
            )

            db.add(db_order)
            db.flush()

            for item in order.get("line_items", []):
                db_item = LineItem(
                    order_id=db_order.id,
                    name=item.get("item_name"),
                    quantity=item.get("quantity"),
                    unit_price=item.get("unit_price"),
                    total=item.get("total_price"),
                    tax=item.get("tax"),
                    sku=item.get("sku"),
                    vendor=item.get("vendor"),
                    shipping_method=item.get("shipping_method"),
                )
                db.add(db_item)

    insert_orders(wave_invoices, "Wave")
    insert_orders(bigc_orders, "BigCommerce")

    for external_id, date in contact_tracker.items():
        cid = id_map[external_id]
        db.query(Customer).filter(Customer.id == cid).update({"last_contacted": date})

    db.commit()
    db.close()

def run_all_syncs():
    print("[DEBUG] Starting Wave fetch...")
    wave_customers, raw_wave_invoices = fetch_wave_invoices_and_customers()
    print(f"✅ [SYNC] Wave: {len(wave_customers)} customers, {len(raw_wave_invoices)} invoices")

    print("[DEBUG] Starting BigCommerce fetch...")
    bigc_customers, bigc_orders = fetch_bigcommerce_orders_and_customers()
    print(f"✅ [SYNC] BigCommerce: {len(bigc_customers)} customers, {len(bigc_orders)} orders")

    print("[DEBUG] Merging and syncing to database...")
    merge_and_sync_customers(wave_customers, raw_wave_invoices, bigc_customers, bigc_orders)
    print("✅ [SYNC COMPLETE]")

if __name__ == "__main__":
    run_all_syncs()
