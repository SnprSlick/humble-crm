import os
import requests
from app.models.customer import Customer
from app.models.order import Order
from app.models.line_item import LineItem

WAVE_API_TOKEN = os.getenv("WAVE_API_TOKEN")
BUSINESS_ID = os.getenv("BUSINESS_ID")

def fetch_wave_invoices_and_customers():
    if not WAVE_API_TOKEN or not BUSINESS_ID:
        raise Exception("Missing WAVE_API_TOKEN or BUSINESS_ID")

    graphql_url = "https://gql.waveapps.com/graphql/public"
    headers = {
        "Authorization": f"Bearer {WAVE_API_TOKEN}",
        "Content-Type": "application/json"
    }

    query = """
    query FetchInvoices($businessId: ID!, $page: Int!, $pageSize: Int!) {
      business(id: $businessId) {
        customers {
          edges {
            node {
              id
              name
              email
              phone
            }
          }
        }
        invoices(page: $page, pageSize: $pageSize) {
          edges {
            node {
              id
              invoiceNumber
              status
              currency {
                code
              }
              createdAt
              dueDate
              customer {
                id
                name
              }
              amountDue {
                value
              }
              total {
                value
              }
              taxTotal {
                value
              }
              items {
                product {
                  name
                }
                quantity
                price
                total {
                  value
                }
              }
            }
          }
        }
      }
    }
    """

    variables = {
        "businessId": BUSINESS_ID,
        "page": 1,
        "pageSize": 100
    }

    response = requests.post(graphql_url, json={"query": query, "variables": variables}, headers=headers)

    try:
        response.raise_for_status()
        data = response.json()
        if "errors" in data:
            print("⚠️ Full raw response:", data)
            raise Exception("Wave API returned GraphQL errors")
    except Exception:
        print("⚠️ Full raw response:", response.text)
        raise Exception("Wave API request failed")

    business = data["data"]["business"]

    customers = []
    for edge in business["customers"]["edges"]:
        node = edge["node"]
        customers.append({
            "external_id": node["id"],
            "name": node["name"],
            "email": node.get("email"),
            "phone": node.get("phone"),
            "source": "Wave",
        })

    invoices = []
    for edge in business["invoices"]["edges"]:
        inv = edge["node"]
        invoices.append({
            "external_id": inv["id"],
            "invoice_number": inv["invoiceNumber"],
            "status": inv["status"],
            "currency": inv["currency"]["code"],
            "created_at": inv["createdAt"],
            "due_date": inv["dueDate"],
            "customer_external_id": inv["customer"]["id"] if inv.get("customer") else None,
            "customer_name": inv["customer"]["name"] if inv.get("customer") else "Unknown",
            "amount_due": float(inv["amountDue"]["value"].replace(",", "")),
            "total": float(inv["total"]["value"].replace(",", "")),
            "tax_total": float(inv["taxTotal"]["value"].replace(",", "")) if inv.get("taxTotal") else 0.0,
            "line_items": [
                {
                    "item_name": item["product"]["name"] if item["product"] else "Unknown",
                    "quantity": item["quantity"],
                    "unit_price": float(item["price"].replace(",", "")),
                    "total_price": float(item["total"]["value"].replace(",", ""))
                } for item in inv.get("items", [])
            ],
            "source": "Wave"
        })

    return customers, invoices
