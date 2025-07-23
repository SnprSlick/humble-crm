from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db

from app.models.drop_ship_status import DropShipStatus
from app.models.invoice_item import InvoiceItem
from app.models.invoice import Invoice

router = APIRouter()


@router.get("/test-drop-ship")
def test_drop_ship_route():
    return {"message": "✅ Route is working"}


@router.get("/drop_ship_orders")
def get_drop_ship_orders(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    print("🔥 Executing drop_ship_orders")

    joined = (
        db.query(Invoice, InvoiceItem, DropShipStatus)
        .join(InvoiceItem, InvoiceItem.invoice_id == Invoice.id)
        .outerjoin(DropShipStatus, DropShipStatus.item_id == InvoiceItem.id)
        .order_by(Invoice.date.desc(), Invoice.id.desc())
        .all()
    )

    result: Dict[int, Dict[str, Any]] = {}

    for invoice, item, ds in joined:
        inv_id = invoice.id
        if inv_id not in result:
            result[inv_id] = {
                "invoice_id": inv_id,
                "date": invoice.date.strftime("%Y-%m-%d"),
                "customer": invoice.customer_name,
                "items": []
            }

        result[inv_id]["items"].append({
            "item_id": item.id,
            "name": item.name,
            "drop_ship": bool(item.drop_ship),
            "status": ds.status if ds else "In-Shop",
            "vendor": ds.vendor if ds else None,
            "notes": ds.notes if ds else None
        })

    return list(result.values())
