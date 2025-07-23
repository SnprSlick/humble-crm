import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { OrderFieldChecklist } from "../components/OrderFieldChecklist";

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/orders/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch order ${id}: ${res.status}`);
        return res.json();
      })
      .then((data) => setOrder(data))
      .catch((err) => {
        console.error("Order fetch error:", err);
        setError(err.message);
      });
  }, [id]);

  if (error) return <div className="text-red-500 p-6">Error: {error}</div>;
  if (!order) return <div className="p-6">Loading...</div>;

  const formatAddress = (addr) => {
    if (!addr || typeof addr !== 'object') return "—";
    return (
      <>
        <p>{addr.line1 || addr.address1}</p>
        {addr.line2 && <p>{addr.line2}</p>}
        <p>{addr.city}, {addr.province || addr.state} {addr.postal_code || addr.zip}</p>
      </>
    );
  };

  return (
    <div className="p-8 max-w-5xl mx-auto text-sm text-text font-mono">
      <Link to="/orders" className="text-accent underline mb-4 inline-block">
        ← Back to Orders
      </Link>

      <h1 className="text-2xl font-bold mb-6 text-accent">Invoice #{order.invoice_number || order.external_id}</h1>

      {/* CUSTOMER INFO */}
      <div className="mb-6 border border-border rounded bg-[#1a1a1a] p-4">
        <h2 className="font-semibold mb-2 text-accentLight">Customer</h2>
        <p><strong>Name:</strong> {order.customer?.name || "—"}</p>
        <p><strong>Email:</strong> {order.customer?.email || "—"}</p>
        <p><strong>Phone:</strong> {order.customer?.phone || "—"}</p>
        <p><strong>Status:</strong> {order.status || "—"}</p>
        <p><strong>Tracking:</strong> {order.shipping_tracking || "—"}</p>
      </div>

      {/* ADDRESSES */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border border-border rounded bg-[#1a1a1a] p-4">
          <h2 className="font-semibold mb-2 text-accentLight">Billing Address</h2>
          {formatAddress(order.billing_address)}
        </div>
        <div className="border border-border rounded bg-[#1a1a1a] p-4">
          <h2 className="font-semibold mb-2 text-accentLight">Shipping Address</h2>
          {formatAddress(order.shipping_address)}
        </div>
      </div>

      {/* LINE ITEMS */}
      <div className="mb-6 border border-border rounded overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-rowAccent text-accent text-xs uppercase tracking-wider">
            <tr>
              <th className="p-2">Item</th>
              <th className="p-2">Quantity</th>
              <th className="p-2">Unit Price</th>
              <th className="p-2">Tax</th>
              <th className="p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.line_items?.map((item, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? "bg-background" : "bg-surfaceActive"}>
                <td className="p-2">{item.name}</td>
                <td className="p-2">{item.quantity}</td>
                <td className="p-2">${item.unit_price?.toFixed(2) || "0.00"}</td>
                <td className="p-2">${item.tax?.toFixed(2) || "0.00"}</td>
                <td className="p-2">${item.total?.toFixed(2) || "0.00"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TOTALS */}
      <div className="mb-6 border border-border rounded bg-[#1a1a1a] p-4">
        <h2 className="font-semibold mb-2 text-accentLight">Totals</h2>
        <p><strong>Subtotal:</strong> ${order.subtotal?.toFixed(2) || "0.00"}</p>
        <p><strong>Tax:</strong> ${order.tax_total?.toFixed(2) || "0.00"}</p>
        <p><strong>Shipping:</strong> ${order.shipping_total?.toFixed(2) || "0.00"}</p>
        <p className="font-bold"><strong>Grand Total:</strong> ${order.total?.toFixed(2) || "0.00"}</p>
      </div>

      {/* FIELD CHECKLIST */}
      <OrderFieldChecklist order={order} />
    </div>
  );
}
