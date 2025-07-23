import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronRight, Mail, Phone } from "lucide-react";

export default function DropShipDashboard() {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
    axios
      .get(`${API_URL}/api/drop_ship_orders`)
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Error fetching drop ship orders:", err));
  }, []);

  const toggleExpand = (invoiceId) => {
    setExpanded((prev) => ({
      ...prev,
      [invoiceId]: !prev[invoiceId],
    }));
  };

  const renderStatusDots = (items) => {
    const maxVisible = 10;
    const dots = items.slice(0, maxVisible).map((item, idx) => {
      let color = "bg-success";
      if (item.status === "Pending Contact" || item.status === "Delayed") color = "bg-warning";
      if (item.status !== "Shipped" && item.drop_ship) color = "bg-error";
      return <div key={idx} className={`w-2 h-2 rounded-full ${color}`}></div>;
    });

    if (items.length > maxVisible) {
      dots.push(
        <div key="extra" className="text-xs text-white/60 ml-1">+{items.length - maxVisible}</div>
      );
    }

    return <div className="flex gap-1 items-center">{dots}</div>;
  };

  return (
    <div className="min-h-screen w-full text-text font-mono px-4 py-6">
      <h1 className="text-3xl font-header font-extrabold uppercase text-accent mb-6 tracking-wide">
        📦 Drop Ship Tracker
      </h1>

      <div className="w-full border border-border rounded-none overflow-hidden bg-[#0a0a0a]">
        {orders.map((order, idx) => {
          const isExpanded = expanded[order.invoice_id];

          return (
            <React.Fragment key={order.invoice_id}>
              {/* Collapsed Summary Row */}
              <div
                onClick={() => toggleExpand(order.invoice_id)}
                className={`grid grid-cols-3 px-4 py-1.5 text-sm border-t border-border cursor-pointer ${
                  idx % 2 === 0 ? "bg-background" : "bg-[#141414]"
                } hover:bg-surfaceActive/80 transition duration-100`}
              >
                <div className="flex items-center gap-2">
                  <ChevronRight
                    className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                  #{order.invoice_id}
                </div>
                <div>{order.customer}</div>
                <div className="flex justify-end">{renderStatusDots(order.items)}</div>
              </div>

              {/* Expanded Item Table */}
              {isExpanded && (
                <>
                  {/* Table Header (Desktop only) */}
                  <div className="hidden md:grid grid-cols-7 text-[10px] uppercase font-bold tracking-widest bg-highlight text-accent px-4 py-2 border-t border-border">
                    <div>Item</div>
                    <div>Brand</div>
                    <div>Shipping</div>
                    <div>Status</div>
                    <div>Tracking #</div>
                    <div>Last Contacted</div>
                    <div className="text-center">Contact</div>
                  </div>

                  {/* Item Rows (Responsive) */}
                    {order.items.map((item, itemIdx) => (
                      <div
                        key={item.item_id}
                        className={`flex flex-col md:grid md:grid-cols-7 gap-y-1 md:gap-0 
                          px-4 py-3 text-sm border-t border-border 
                          ${itemIdx % 2 === 0 ? "bg-background" : "bg-[#141414]"}
                          w-[100%] mx-auto md:w-full`}
                      >
                      {/* Item */}
                      <div className="font-semibold">{item.name}</div>

                      {/* Brand */}
                      <div className="text-xs md:text-left text-muted -mt-1 md:mt-0">
                        {item.brand || "—"}
                      </div>

                      {/* Shipping */}
                      <div className="text-xs">{item.drop_ship ? "Drop Ship" : "In-Shop"}</div>

                      {/* Status */}
                      <div>
                        <span
                          className={`text-xs font-bold uppercase px-2 py-1 rounded-sm inline-block ${
                            item.status === "Shipped"
                              ? "bg-success text-black"
                              : item.status === "Pending Contact"
                              ? "bg-warning text-black"
                              : item.status === "Delayed"
                              ? "bg-error text-white"
                              : "bg-blue-600 text-white"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      {/* Tracking # */}
                      <div className="text-xs">{item.tracking_number || "—"}</div>

                      {/* Last Contacted */}
                      <div className="text-xs">{item.last_contacted || "—"}</div>

                      {/* Contact Icons */}
                      <div className="flex gap-3 md:justify-center mt-1 md:mt-0">
                        <a
                          href={item.vendor_phone ? `tel:${item.vendor_phone}` : undefined}
                          className={`p-1.5 border border-border rounded-sm text-xs ${
                            item.vendor_phone
                              ? "bg-accent/30 hover:bg-accentLight/30 text-white"
                              : "bg-surface text-white/40 cursor-not-allowed"
                          }`}
                          onClick={(e) => !item.vendor_phone && e.preventDefault()}
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                        <a
                          href={item.vendor_email ? `mailto:${item.vendor_email}` : undefined}
                          className={`p-1.5 border border-border rounded-sm text-xs ${
                            item.vendor_email
                              ? "bg-accent/30 hover:bg-accentLight/30 text-white"
                              : "bg-surface text-white/40 cursor-not-allowed"
                          }`}
                          onClick={(e) => !item.vendor_email && e.preventDefault()}
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
