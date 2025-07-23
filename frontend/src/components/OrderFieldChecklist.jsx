import React from "react";

export function OrderFieldChecklist({ order }) {
  const checklist = [
    { label: "Customer Name", filled: !!order.customer?.name },
    { label: "Customer Email", filled: !!order.customer?.email },
    { label: "Billing Address", filled: !!order.billing_address?.line1 },
    { label: "Shipping Address", filled: !!order.shipping_address?.line1 },
    { label: "Line Items", filled: order.items?.length > 0 },
    { label: "Total", filled: !!order.total },
    { label: "Shipping", filled: !!order.shipping_total },
    { label: "Tax", filled: !!order.tax_total },
  ];

  return (
    <div className="border rounded-md p-4 bg-cardBackground mb-8">
      <h2 className="font-semibold mb-2">Field Checklist</h2>
      <ul className="grid grid-cols-2 gap-2 text-sm">
        {checklist.map((item, idx) => (
          <li key={idx} className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${item.filled ? "bg-green-500" : "bg-gray-400"}`} />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
