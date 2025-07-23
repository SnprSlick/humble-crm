import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

Modal.setAppElement("#root");

const APPOINTMENT_TYPES = [
  "Tune", "Service", "Project Drop Off", "Completion Date",
  "Personal", "Business", "Other"
];

export default function CreateAppointmentModal({ isOpen, onClose, prefillDate }) {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [customerInput, setCustomerInput] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState(prefillDate || new Date());
  const [endTime, setEndTime] = useState(null);
  const [notes, setNotes] = useState("");
  const [type, setType] = useState("Service");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/customers`)
      .then(res => res.json())
      .then(data => setCustomers(data));
  }, []);

  useEffect(() => {
    setStartTime(prefillDate || new Date());
  }, [prefillDate]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setCustomerInput(val);
    const matches = customers.filter(c =>
      c.name.toLowerCase().includes(val.toLowerCase())
    );
    setFiltered(matches);
    setSelectedCustomerId(null);
  };

  const handleCustomerSelect = (name, id) => {
    setCustomerInput(name);
    setSelectedCustomerId(id);
    setFiltered([]);
  };

  const handleSubmit = async () => {
    if (!selectedCustomerId) {
      alert("Please select a valid customer before saving.");
      return;
    }

    const payload = {
      title: `${type} - ${title}`,
      customer_id: selectedCustomerId,
      start_time: startTime.toISOString(),
      end_time: endTime ? endTime.toISOString() : null,
      notes,
      appointment_type: type,
    };

    console.log("📤 Submitting appointment:", payload);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      onClose();
    } else {
      alert("Failed to create appointment");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-zinc-800 text-white rounded-lg p-6 max-w-lg mx-auto mt-24 shadow-xl"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50"
    >
      <h2 className="text-xl font-bold mb-4">Create Appointment</h2>

      <label className="block mb-1 text-sm">Customer</label>
      <input
        className="w-full p-2 rounded bg-zinc-700 text-white"
        value={customerInput}
        onChange={handleInputChange}
        placeholder="Search or type to create"
      />
      {filtered.length > 0 && (
        <ul className="bg-zinc-700 rounded mt-1 max-h-32 overflow-y-auto">
          {filtered.map(c => (
            <li
              key={c.id}
              onClick={() => handleCustomerSelect(c.name, c.id)}
              className="p-2 hover:bg-zinc-600 cursor-pointer"
            >
              {c.name}
            </li>
          ))}
        </ul>
      )}

      <label className="block mt-4 text-sm">Date & Time</label>
      <DatePicker
        selected={startTime}
        onChange={(date) => setStartTime(date)}
        showTimeSelect
        dateFormat="Pp"
        className="w-full p-2 rounded bg-zinc-700 text-white"
      />

      <label className="block mt-4 text-sm">Type</label>
      <select
        className="w-full p-2 rounded bg-zinc-700 text-white"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        {APPOINTMENT_TYPES.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>

      <label className="block mt-4 text-sm">Title</label>
      <input
        className="w-full p-2 rounded bg-zinc-700 text-white"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Optional short title"
      />

      <label className="block mt-4 text-sm">Notes</label>
      <textarea
        className="w-full p-2 rounded bg-zinc-700 text-white"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
      />

      <div className="flex justify-end gap-4 mt-6">
        <button onClick={onClose} className="px-4 py-2 bg-zinc-600 rounded hover:bg-zinc-500">Cancel</button>
        <button onClick={handleSubmit} className="px-4 py-2 bg-red-600 rounded hover:bg-red-500">Save</button>
      </div>
    </Modal>
  );
}
