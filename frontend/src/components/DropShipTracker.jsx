import React, { useEffect, useState } from "react";
import axios from "axios";
import DropShipCard from "./DropShipCard";

export default function DropShipDashboard() {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/drop_ship_orders`)
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Error fetching drop ship orders:", err));
  }, []);

  const toggleExpand = (invoiceId) => {
    setExpanded((prev) => ({
      ...prev,
      [invoiceId]: !prev[invoiceId],
    }));
  };

  return (
    <div className="flex flex-col items-center py-8 px-4 text-text w-full">
      <h1 className="text-3xl font-bold mb-8">📦 Drop Ship Tracker</h1>
      <div className="w-full max-w-screen-lg flex flex-col items-center gap-4">
        {orders.map((order) => (
          <DropShipCard
            key={order.invoice_id}
            order={order}
            isOpen={expanded[order.invoice_id]}
            toggle={() => toggleExpand(order.invoice_id)}
          />
        ))}
      </div>
    </div>
  );
}
