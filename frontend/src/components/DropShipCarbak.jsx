import React, { useRef, useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

export default function DropShipCard({ order, isOpen, toggle }) {
  const contentRef = useRef(null);
  const [height, setHeight] = useState("0px");

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setHeight(`${contentRef.current.scrollHeight}px`);
    } else {
      setHeight("0px");
    }
  }, [isOpen]);

  return (
    <div className="card-container">
      <div className="custom-card border border-border rounded-lg overflow-hidden shadow transition-all w-full hover:bg-highlight">
        {/* Clickable Header */}
        <div className="card-content cursor-pointer" onClick={toggle}>
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-base">{order.customer}</div>
              <div className="text-xs text-muted">
                Invoice #{order.invoice_id} • {order.date}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {order.items.some((i) => i.drop_ship && i.status !== "Shipped") && (
                <span className="bg-warning text-black px-2 py-1 rounded text-xs font-semibold">
                  Needs Attention
                </span>
              )}
              <ChevronRight
                className={`w-4 h-4 text-muted transition-transform duration-300 ${
                  isOpen ? "rotate-90" : ""
                }`}
              />
            </div>
          </div>
        </div>

        {/* Expandable Section */}
        <div
          ref={contentRef}
          className="transition-all duration-500 ease-in-out overflow-hidden w-full"
          style={{ maxHeight: height }}
        >
          <div className="card-content py-4">
            {order.items.map((item, idx) => (
              <div
                key={item.item_id}
                className="flex justify-between items-start py-3 px-2 rounded"
                style={{
                  backgroundColor:
                    idx % 2 === 0
                      ? "var(--color-surface)"
                      : "var(--color-highlight)",
                }}
              >
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted">
                    {item.drop_ship ? "Drop Ship" : "In-Shop"}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-xs font-semibold px-2 py-1 rounded inline-block ${
                      item.status === "Shipped"
                        ? "bg-success text-white"
                        : item.status === "Pending Contact"
                        ? "bg-warning text-black"
                        : item.status === "Delayed"
                        ? "bg-error text-white"
                        : "bg-accent text-white"
                    }`}
                  >
                    {item.status}
                  </div>
                  {item.vendor && (
                    <div className="text-xs text-muted mt-1">{item.vendor}</div>
                  )}
                  {item.notes && (
                    <div className="text-xs text-muted mt-1 italic">{item.notes}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
