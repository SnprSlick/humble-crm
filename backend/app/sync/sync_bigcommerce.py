import os
import requests
from dotenv import load_dotenv
from app.core.database import SessionLocal
from app.models.customer import Customer
from app.models.order import Order, parse_datetime
from app.models.line_item import LineItem

env_path = os.path.join(os.path.dirname(__file__), "../key.env")
load_dotenv(env_path)
print(f"✅ [bigc] Loaded .env from: {env_path}")

BIGC_API_TOKEN = os.getenv("BIGC_API_TOKEN")
BIGC_STORE_HASH = os.getenv("BIGC_STORE_HASH")
BIGC_CLIENT_ID = os.getenv("BIGC_CLIENT_ID")

def fetch_bigcommerce_orders_and_customers():
    print("[DEBUG] Starting BigCommerce fetch...")
    headers = {
        "X-Auth-Token": BIGC_API_TOKEN,
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    base_url = f"https://api.bigcommerce.com/stores/{BIGC_STORE_HASH}/v2/orders"
    print(f"[DEBUG] Using token: {BIGC_API_TOKEN[:5]}... (truncated)")
    print(f"[DEBUG] Store hash: {BIGC_STORE_HASH}")

    customers = []
    orders = []

    page = 1
    per_page = 250  # limit for now
    while True:
        print(f"[DEBUG] Fetching page {page} from {base_url}...")
        response = requests.get(base_url, headers=headers, params={"page": page, "limit": per_page})
        if response.status_code != 200:
            raise Exception(f"❌ Failed to fetch BigCommerce orders: {response.status_code} {response.text}")

        page_orders = response.json()
        print(f"[DEBUG] Retrieved {len(page_orders)} orders")

        if not page_orders:
            break

        for order in page_orders:
            billing = order.get("billing_address", {})
            shipping_addresses = order.get("shipping_addresses") or []
            shipping = shipping_addresses[0] if isinstance(shipping_addresses, list) and shipping_addresses else {}

            customer_name = f"{billing.get('first_name', '')} {billing.get('last_name', '')}".strip()
            customer_email = billing.get("email", "")
            customer_phone = billing.get("phone", "")

            external_id = str(order.get("customer_id") or order.get("id"))
            created_at_raw = order.get("date_created")
            created_at = parse_datetime(created_at_raw)

            # ✅ Debug log
            #print(f"[DEBUG] Order ID {order.get('id')} | Raw created_at: {created_at_raw} | Parsed: {created_at}")

            customers.append({
                "external_id": external_id,
                "name": customer_name or "Guest",
                "email": customer_email,
                "phone": customer_phone,
                "source": "BigCommerce",
            })

            orders.append({
                "external_id": str(order.get("id")),
                "invoice_number": order.get("id"),
                "status": order.get("status"),
                "currency": order.get("currency"),
                "created_at": created_at,  # ✅ Parsed datetime
                "customer_external_id": external_id,
                "customer_name": customer_name or "Guest",
                "amount_due": float(order.get("total_inc_tax", 0)),
                "total": float(order.get("total_inc_tax", 0)),
                "tax_total": float(order.get("total_tax", 0)),
                "shipping_tracking": order.get("shipping_tracking", ""),
                "shipping_address": shipping,
                "billing_address": billing,
                "line_items": [],  # Placeholder for now
                "source": "BigCommerce",
            })

        if len(page_orders) < per_page:
            break
        page += 1

    return customers, orders
