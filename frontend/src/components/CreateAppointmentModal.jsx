import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

Modal.setAppElement("#root");

const APPOINTMENT_TYPES = [
  "Tune", "Service", "Project Drop Off", "Completion Date",
  "Personal", "Business", "Other"
];

const makeOptions = ["Honda", "Acura", "Other"];
const modelOptions = {
  Honda: ["Civic", "Accord", "CR-V", "Pilot", "CRX", "Prelude", "S2000", "Other"],
  Acura: ["Integra", "RSX", "TSX", "NSX", "Other"],
};

export default function CreateAppointmentModal({ isOpen, onClose, prefillDate, setSubmitting }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [customerInput, setCustomerInput] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerLocked, setCustomerLocked] = useState(false);
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState(prefillDate || new Date());
  const [endTime, setEndTime] = useState(null);
  const [notes, setNotes] = useState("");
  const [type, setType] = useState("Service");

  const [make, setMake] = useState("Honda");
  const [model, setModel] = useState("Civic");
  const [customMake, setCustomMake] = useState("");
  const [customModel, setCustomModel] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/customers`)
      .then(res => res.json())
      .then(data => setCustomers(data));
  }, []);

  useEffect(() => {
    setStartTime(prefillDate || new Date());
  }, [prefillDate]);

  useEffect(() => {
    if (make === "Honda") setModel("Civic");
    else if (make === "Acura") setModel("Integra");
    else setModel("Other");
  }, [make]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setCustomerInput(val);
    const matches = customers.filter(c =>
      c.name.toLowerCase().includes(val.toLowerCase())
    );
    setFiltered(matches);
    setSelectedCustomerId(null);
    setPhone("");
    setCustomerLocked(false);
  };

  const handleCustomerSelect = (name, id) => {
    setCustomerInput(name);
    setSelectedCustomerId(id);
    setFiltered([]);
    const match = customers.find(c => c.id === id);
    if (match?.phone) setPhone(match.phone);
  };

  const confirmCustomer = () => {
    const match = customers.find(c =>
      c.name.toLowerCase() === customerInput.toLowerCase()
    );
    if (match) {
      setSelectedCustomerId(match.id);
      setPhone(match.phone || "");
    }
    setCustomerLocked(true);
    setFiltered([]);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    let customerId = selectedCustomerId;

    // If customer is typed in but not matched, skip creation (optional mode)
    if (!customerId && customerInput.trim() !== "") {
      const existing = customers.find(c =>
        c.name.toLowerCase() === customerInput.toLowerCase()
      );
      if (existing) {
        customerId = existing.id;
      }
    }

    const finalMake = make === "Other" ? customMake : make;
    const finalModel = (model === "Other" || make === "Other") ? customModel : model;

    const metaNote = `Name: ${customerInput}
Phone: ${phone || "N/A"}
Vehicle: ${finalMake} ${finalModel}
Type: ${type}
Title: ${title}
Start: ${startTime.toLocaleString()}
${endTime ? "End: " + endTime.toLocaleString() : ""}

----------------------------

`;

    const payload = {
      title: `${type} - ${customerInput} - ${finalModel}`.trim(),
      customer_id: customerId,
      start_time: startTime.toISOString(),
      end_time: endTime ? endTime.toISOString() : null,
      appointment_type: type,
      vehicle_make: finalMake || undefined,
      vehicle_model: finalModel || undefined,
      notes: metaNote + notes,
    };

    const res = await fetch(`${API_URL}/api/appointments/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      onClose();
    } else {
      alert("Failed to create appointment");
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-zinc-800 text-white rounded-lg p-6 max-w-md w-full mx-auto mt-24 shadow-xl z-[9999]"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-[999]"
    >
      <h2 className="text-xl font-bold mb-4">Create Appointment</h2>

      <label className="block mb-1 text-sm">Customer</label>
      <div className="flex gap-2 items-center">
        <input
          className="flex-1 p-2 rounded bg-zinc-700 text-white disabled:opacity-60"
          value={customerInput}
          onChange={handleInputChange}
          disabled={false}
          onClick={() => setCustomerLocked(false)}
          placeholder="Search or type to create"
        />
        {!customerLocked && (
          <button
            onClick={confirmCustomer}
            className="px-3 py-2 bg-zinc-600 rounded hover:bg-zinc-500 text-sm"
          >
            Confirm
          </button>
        )}
      </div>

      {!customerLocked && filtered.length > 0 && (
        <ul className="mt-1 rounded-md shadow bg-zinc-800 border border-zinc-600 text-sm text-white max-h-40 overflow-y-auto transition-all duration-150">
          {filtered.map(c => (
            <li
              key={c.id}
              onClick={() => handleCustomerSelect(c.name, c.id)}
              className="px-3 py-2 hover:bg-zinc-700 transition-colors duration-150 cursor-pointer"
            >
              {c.name}
            </li>
          ))}
        </ul>
      )}

      <label className="block mt-4 text-sm">Phone</label>
      <input
        className="w-full p-2 rounded bg-zinc-700 text-white"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Optional phone"
      />

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

      <label className="block mt-4 text-sm">Vehicle Make</label>
      <select
        className="w-full p-2 rounded bg-zinc-700 text-white"
        value={make}
        onChange={(e) => setMake(e.target.value)}
      >
        {makeOptions.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {make === "Other" && (
        <input
          className="w-full p-2 rounded bg-zinc-700 text-white mt-2"
          placeholder="Enter custom make"
          value={customMake}
          onChange={(e) => setCustomMake(e.target.value)}
        />
      )}

      <label className="block mt-4 text-sm">Vehicle Model</label>
      {make === "Other" ? (
        <input
          className="w-full p-2 rounded bg-zinc-700 text-white"
          placeholder="Enter model"
          value={customModel}
          onChange={(e) => setCustomModel(e.target.value)}
        />
      ) : (
        <>
          <select
            className="w-full p-2 rounded bg-zinc-700 text-white"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            {modelOptions[make].map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {model === "Other" && (
            <input
              className="w-full p-2 rounded bg-zinc-700 text-white mt-2"
              placeholder="Enter custom model"
              value={customModel}
              onChange={(e) => setCustomModel(e.target.value)}
            />
          )}
        </>
      )}

      <label className="block mt-4 text-sm">Additional Notes</label>
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
