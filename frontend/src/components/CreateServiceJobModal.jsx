// frontend/src/components/CreateServiceJobModal.jsx
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { X } from "lucide-react";

Modal.setAppElement("#root");

export default function CreateServiceJobModal({ isOpen, onClose, onJobCreated }) {
  const [customers, setCustomers] = useState([]);
  const [customerInput, setCustomerInput] = useState("");
  const [confirmedCustomer, setConfirmedCustomer] = useState(null);
  const [showCustomerInput, setShowCustomerInput] = useState(true);
  const [formData, setFormData] = useState({
    customer_id: "",
    title: "",
    description: "",
    vehicle_year: "",
    vehicle_make: "",
    vehicle_model: "",
    vehicle_vin: "",
    vehicle_mileage: "",
    priority: "normal",
    estimated_hours: "",
    estimated_completion: "",
    quoted_total: "",
    deposit_required: "",
    notes: "",
    email: "",
    phone: "",
  });

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      resetForm();
    }
  }, [isOpen]);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/customers`);
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    }
  };

  const resetForm = () => {
    setCustomerInput("");
    setConfirmedCustomer(null);
    setShowCustomerInput(true);
    setFormData({
      customer_id: "",
      title: "",
      description: "",
      vehicle_year: "",
      vehicle_make: "",
      vehicle_model: "",
      vehicle_vin: "",
      vehicle_mileage: "",
      priority: "normal",
      estimated_hours: "",
      estimated_completion: "",
      quoted_total: "",
      deposit_required: "",
      notes: "",
      email: "",
      phone: "",
    });
  };

  const handleCreateCustomer = async () => {
    const existing = customers.find(
      (c) => c.name.toLowerCase() === customerInput.toLowerCase()
    );
    if (existing) {
      setConfirmedCustomer(existing);
      setFormData({ ...formData, customer_id: existing.id });
      setShowCustomerInput(false);
    } else {
      const res = await fetch(`${API_URL}/api/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customerInput,
          email: formData.email,
          phone: formData.phone,
        }),
      });
      if (res.ok) {
        const newCustomer = await res.json();
        setConfirmedCustomer(newCustomer);
        setFormData({ ...formData, customer_id: newCustomer.id });
        setCustomers((prev) => [...prev, newCustomer]);
        setShowCustomerInput(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      customer_id: parseInt(formData.customer_id),
      estimated_hours: formData.estimated_hours
        ? parseFloat(formData.estimated_hours)
        : null,
      quoted_total: formData.quoted_total
        ? parseFloat(formData.quoted_total)
        : null,
      deposit_required: formData.deposit_required
        ? parseFloat(formData.deposit_required)
        : null,
      vehicle_mileage: formData.vehicle_mileage
        ? parseInt(formData.vehicle_mileage)
        : null,
      estimated_completion: formData.estimated_completion
        ? new Date(formData.estimated_completion).toISOString()
        : null,
    };

    const res = await fetch(`${API_URL}/api/service-jobs/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      // Post make/model to customer
      if (formData.customer_id && (formData.vehicle_make || formData.vehicle_model)) {
        await fetch(`${API_URL}/api/customers/${formData.customer_id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vehicle_make: formData.vehicle_make,
            vehicle_model: formData.vehicle_model,
          }),
        });
      }

      onJobCreated();
    } else {
      console.error("Failed to create service job");
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-surface text-white rounded-lg p-6 max-w-2xl w-full mx-auto mt-20 shadow-xl max-h-[90vh] overflow-y-auto"
      overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-start z-50 pt-10"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Create Service Job</h2>
        <button onClick={onClose} className="text-muted hover:text-white">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {showCustomerInput ? (
          <div>
            <label className="block text-sm font-medium mb-1">Customer Name *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customerInput}
                onChange={(e) => setCustomerInput(e.target.value)}
                required
                className="w-full px-3 py-2 bg-background border border-border rounded text-text"
              />
              <button
                type="button"
                onClick={handleCreateCustomer}
                className="bg-accent hover:bg-red-700 text-white px-4 rounded"
              >
                OK
              </button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <input
                type="text"
                name="phone"
                placeholder="Phone (optional)"
                value={formData.phone}
                onChange={handleChange}
                className="px-3 py-2 bg-background border border-border rounded text-text"
              />
              <input
                type="email"
                name="email"
                placeholder="Email (optional)"
                value={formData.email}
                onChange={handleChange}
                className="px-3 py-2 bg-background border border-border rounded text-text"
              />
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center bg-background px-3 py-2 border border-border rounded">
            <span className="font-medium text-text">{confirmedCustomer?.name}</span>
            <button
              type="button"
              onClick={() => {
                setShowCustomerInput(true);
                setConfirmedCustomer(null);
              }}
              className="text-sm text-muted hover:text-white"
            >
              Change
            </button>
          </div>
        )}

        {/* --- Rest of fields --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Job Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-background border border-border rounded text-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-background border border-border rounded text-text"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 bg-background border border-border rounded text-text"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <input
            type="text"
            name="vehicle_year"
            value={formData.vehicle_year}
            onChange={handleChange}
            placeholder="Year"
            className="px-3 py-2 bg-background border border-border rounded text-text"
          />
          <input
            type="text"
            name="vehicle_make"
            value={formData.vehicle_make}
            onChange={handleChange}
            placeholder="Make"
            className="px-3 py-2 bg-background border border-border rounded text-text"
          />
          <input
            type="text"
            name="vehicle_model"
            value={formData.vehicle_model}
            onChange={handleChange}
            placeholder="Model"
            className="px-3 py-2 bg-background border border-border rounded text-text"
          />
          <input
            type="number"
            name="vehicle_mileage"
            value={formData.vehicle_mileage}
            onChange={handleChange}
            placeholder="Mileage"
            className="px-3 py-2 bg-background border border-border rounded text-text"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="number"
            name="estimated_hours"
            value={formData.estimated_hours}
            onChange={handleChange}
            placeholder="Est. Hours"
            className="px-3 py-2 bg-background border border-border rounded text-text"
          />
          <input
            type="number"
            name="quoted_total"
            value={formData.quoted_total}
            onChange={handleChange}
            placeholder="Quoted Total"
            className="px-3 py-2 bg-background border border-border rounded text-text"
          />
          <input
            type="number"
            name="deposit_required"
            value={formData.deposit_required}
            onChange={handleChange}
            placeholder="Deposit Required"
            className="px-3 py-2 bg-background border border-border rounded text-text"
          />
        </div>

        <input
          type="datetime-local"
          name="estimated_completion"
          value={formData.estimated_completion}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-background border border-border rounded text-text"
        />

        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Additional notes..."
          rows={3}
          className="w-full px-3 py-2 bg-background border border-border rounded text-text"
        />

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-500 px-4 py-2 text-white rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-accent hover:bg-red-700 px-4 py-2 text-white rounded"
          >
            Create Service Job
          </button>
        </div>
      </form>
    </Modal>
  );
}
