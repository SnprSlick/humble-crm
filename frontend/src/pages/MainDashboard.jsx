import React from "react";
import { useNavigate } from "react-router-dom";

const tiles = [
  { label: "Customers", path: "/customers" },
  { label: "Orders", path: "/orders" },
  { label: "To-Do", path: "/todo" },
  { label: "Calendar", path: "/calendar" },
  { label: "Service", path: "/service" },
];

export default function MainDashboard() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full text-text font-sans tracking-wide px-6 py-8">
      <h1 className="text-3xl font-header font-bold uppercase text-accent mb-8 tracking-widest select-none">
        Humble CRM Dashboard
      </h1>

      <div className="flex flex-row flex-wrap gap-3 justify-start">
        {tiles.map((tile, idx) => (
          <div
            key={idx}
            onClick={() => navigate(tile.path)}
            className="cursor-pointer rounded-lg bg-accent border border-border shadow-panel hover:bg-red-700 transition-colors duration-300 select-none flex items-center justify-center px-4 py-2 min-w-[100px]"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate(tile.path);
            }}
            aria-label={`Go to ${tile.label} page`}
          >
            <span className="text-sm font-header font-semibold uppercase tracking-wider text-white whitespace-nowrap">
              {tile.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
