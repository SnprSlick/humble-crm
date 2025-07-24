import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateAppointmentModal from "../components/CreateAppointmentModal";

const tiles = [
  { label: "Customers", path: "/customers" },
  { label: "Orders", path: "/orders" },
  { label: "To-Do", path: "/todo" },
  { label: "Calendar", path: "/calendar" },
  { label: "Service", path: "/service" },
];

export default function MainDashboard() {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [appointmentsToday, setAppointmentsToday] = useState([]);
  const [inactiveCustomers, setInactiveCustomers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [dropShipPreview, setDropShipPreview] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/api/dashboard/reminders`)
      .then((res) => res.json())
      .then(setReminders)
      .catch(() => setReminders([]));

    fetch(`${API_URL}/api/dashboard/inactive-customers`)
      .then((res) => res.json())
      .then(setInactiveCustomers)
      .catch(() => setInactiveCustomers([]));

    fetch(`${API_URL}/api/appointments/today`)
      .then((res) => res.json())
      .then(setAppointmentsToday)
      .catch(() => setAppointmentsToday([]));

    fetch(`${API_URL}/api/drop_ship_orders/summary`)
      .then((res) => res.json())
      .then(setDropShipPreview)
      .catch(() => setDropShipPreview([]));
  }, []);

  return (
    <div className="w-full h-full text-text font-sans tracking-wide px-6 py-8 space-y-8">
      <h1 className="text-3xl font-header font-bold uppercase text-accent tracking-widest select-none">
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

      <div className="bg-cardBackground rounded-xl shadow p-4 border border-border space-y-2">
        <h2 className="font-bold text-lg text-accent">📅 Daily Reminders</h2>
        {reminders.map((r, i) => (
          <div key={i} className="text-sm">
            • {r}
          </div>
        ))}
        {inactiveCustomers.length > 0 && (
          <div className="mt-2">
            <h3 className="font-semibold text-sm mt-2">👥 Customers Not Contacted:</h3>
            <ul className="list-disc ml-4 text-sm">
              {inactiveCustomers.map((c, i) => (
                <li key={i}>{c.name} — last contacted {c.days_since_contact} days ago</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="bg-cardBackground rounded-xl shadow p-4 border border-border">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold text-lg text-accent">📆 Today's Appointments</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-accent hover:bg-red-700 text-white text-xs px-3 py-1 rounded"
          >
            + Create
          </button>
        </div>
        {Array.isArray(appointmentsToday) && appointmentsToday.length > 0 ? (
          <ul className="text-sm space-y-1">
            {appointmentsToday.map((appt, i) => (
              <li key={i}>
                {appt.time} - {appt.customer} ({appt.type})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm italic">No appointments today.</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-cardBackground rounded-xl shadow p-4 border border-border">
          <h2 className="font-bold text-lg text-accent">🚚 Drop Ship Summary</h2>
          {dropShipPreview.length === 0 ? (
            <p className="text-sm italic">No active drop ships.</p>
          ) : (
            <ul className="text-sm space-y-1">
              {dropShipPreview.map((entry, i) => (
                <li key={i}>
                  {entry.customer} — {entry.item} ({entry.status})
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <CreateAppointmentModal
        isOpen={showCreateModal}
        setIsOpen={setShowCreateModal}
        prefillDate={new Date()}
      />
    </div>
  );
}
