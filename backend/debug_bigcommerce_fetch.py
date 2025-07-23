import os
import requests
from dotenv import load_dotenv
import json

# Load .env from this script folder's ../key.env
env_path = os.path.join(os.path.dirname(__file__), "app", "key.env")

if os.path.exists(env_path):
    print("✅ Loaded .env from:", env_path)
    load_dotenv(env_path)
else:
    print("⚠️ key.env not found at:", env_path)

BIGC_STORE_HASH = os.getenv("BIGC_STORE_HASH")
BIGC_ACCESS_TOKEN = os.getenv("BIGC_API_TOKEN")
BIGC_CLIENT_ID = os.getenv("BIGC_CLIENT_ID")

HEADERS_CUSTOMERS = {
    "X-Auth-Token": BIGC_ACCESS_TOKEN,
    "X-Auth-Client": BIGC_CLIENT_ID,
    "Accept": "application/json",
    "Content-Type": "application/json"
}

HEADERS_ORDERS = {
    "X-Auth-Token": BIGC_ACCESS_TOKEN,
    "Accept": "application/json"
}

def fetch_bigcommerce_customers_and_orders():
    customer_url = f"https://api.bigcommerce.com/stores/{BIGC_STORE_HASH}/v3/customers"
    order_url = f"https://api.bigcommerce.com/stores/{BIGC_STORE_HASH}/v2/orders"

    try:
        print("[DEBUG] Fetching customers from:", customer_url)
        cust_res = requests.get(customer_url, headers=HEADERS_CUSTOMERS)
        cust_res.raise_for_status()
        customers = cust_res.json().get("data", [])
        print(f"[DEBUG] Retrieved {len(customers)} customers")
        print("[DEBUG] Customers raw JSON:")
        print(json.dumps(customers[:2], indent=2))  # print first 2 customers for brevity

        print("[DEBUG] Fetching orders from:", order_url)
        order_res = requests.get(order_url, headers=HEADERS_ORDERS)
        order_res.raise_for_status()
        orders = order_res.json()
        print(f"[DEBUG] Retrieved {len(orders)} orders")
        print("[DEBUG] Orders raw JSON:")
        print(json.dumps(orders[:2], indent=2))  # print first 2 orders for brevity

    except Exception as e:
        print("❌ BigCommerce API request failed:", e)
        return [], {}

    orders_by_customer = {cust.get("id"): [] for cust in customers}

    for order in orders:
        cust_id = order.get("customer_id")
        if cust_id in orders_by_customer:
            orders_by_customer[cust_id].append({
                "external_id": str(order["id"]),
                "date": order.get("date_created") or order.get("created_at"),
                "total": float(order.get("total_inc_tax") or 0),
                "shipping_address": order.get("shipping_address", {}).get("formatted_address"),
                "shipping_carrier": order.get("shipping_provider"),
                "shipping_tracking": order.get("tracking_number"),
            })

    return customers, orders_by_customer


if __name__ == "__main__":
    customers, orders = fetch_bigcommerce_customers_and_orders()
    print(f"Total customers: {len(customers)}")
    total_orders = sum(len(v) for v in orders.values())
    print(f"Total orders: {total_orders}")
    for cid, cust_orders in orders.items():
        print(f"Customer {cid} has {len(cust_orders)} orders")
