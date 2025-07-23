from fastapi import APIRouter

router = APIRouter()

@router.get("/api/orders")
def get_all_orders():
    return [
        {"id": "test-001", "source": "Wave", "date": "2025-07-10", "total": 100.00},
        {"id": "test-002", "source": "BigCommerce", "date": "2025-07-09", "total": 200.00}
    ]

@router.get("/api/orders/{order_id}")
@router.get("/api/orders/{order_id}")
def get_order_detail(order_id: str):
    return {
        "id": order_id,
        "customer": {
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "555-123-4567"
        },
        "shipping": {
            "address": "123 Test St, Tulsa, OK 74104",
            "carrier": "UPS",
            "tracking": "1Z12345E0291980793"
        },
        "items": [
            {"name": "ECU", "quantity": 1, "unit_price": 1000.00},
            {"name": "Boost Solenoid", "quantity": 2, "unit_price": 125.00}
        ],
        "subtotal": 1250.00,
        "tax": 106.25,
        "total": 1356.25
    }

