// frontend/src/components/ServiceJobDetailModal.jsx
import React, { useState } from "react";
import Modal from "react-modal";
import { 
  X, Calendar, User, Car, DollarSign, Clock, 
  AlertTriangle, Edit, Save, Plus, Package,
  Camera, MessageSquare, FileText, Trash, Upload
} from "lucide-react";

Modal.setAppElement("#root");

const STATUS_OPTIONS = ["quoted", "approved", "in_progress", "completed", "delivered"];
const PRIORITY_OPTIONS = ["low", "normal", "high", "urgent"];

export default function ServiceJobDetailModal({ isOpen, onClose, job, onJobUpdated }) {
  const [activeTab, setActiveTab] = useState("details");
  const [isEditing, setIsEditing] = useState(false);
  const [editedJob, setEditedJob] = useState(job);
  const [newUpdate, setNewUpdate] = useState("");
  const [newPart, setNewPart] = useState({ name: "", quantity: 1, unit_cost: "", supplier: "" });
  const [photoFile, setPhotoFile] = useState(null);
  const [caption, setCaption] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_URL}/api/service-jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editedJob.status,
          priority: editedJob.priority,
          estimated_hours: parseFloat(editedJob.estimated_hours) || null,
          actual_hours: parseFloat(editedJob.actual_hours) || null,
          quoted_total: parseFloat(editedJob.quoted_total) || null,
          final_total: parseFloat(editedJob.final_total) || null,
          deposit_paid: parseFloat(editedJob.deposit_paid) || null,
          notes: editedJob.notes,
          internal_notes: editedJob.internal_notes
        }),
      });
      if (response.ok) {
        setIsEditing(false);
        onJobUpdated();
      }
    } catch (error) {
      console.error("Error updating job:", error);
    }
  };

  const handleAddUpdate = async () => {
    if (!newUpdate.trim()) return;
    try {
      await fetch(`${API_URL}/api/service-jobs/${job.id}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Progress Update",
          description: newUpdate,
          update_type: "progress",
          is_visible_to_customer: true,
          created_by: "Admin"
        }),
      });
      setNewUpdate("");
      onJobUpdated();
    } catch (err) {
      console.error("Add update failed", err);
    }
  };

  const handleAddPart = async () => {
    if (!newPart.name) return;
    try {
      await fetch(`${API_URL}/api/service-jobs/${job.id}/parts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPart,
          quantity: parseInt(newPart.quantity),
          unit_cost: parseFloat(newPart.unit_cost) || null,
        }),
      });
      setNewPart({ name: "", quantity: 1, unit_cost: "", supplier: "" });
      onJobUpdated();
    } catch (err) {
      console.error("Add part failed", err);
    }
  };

  const handleDeletePart = async (id) => {
    await fetch(`${API_URL}/api/service-jobs/parts/${id}`, { method: "DELETE" });
    onJobUpdated();
  };

  const handleDeleteUpdate = async (id) => {
    await fetch(`${API_URL}/api/service-jobs/updates/${id}`, { method: "DELETE" });
    onJobUpdated();
  };

  const handleUploadPhoto = async () => {
    if (!photoFile) return;
    const formData = new FormData();
    formData.append("file", photoFile);
    formData.append("caption", caption);
    formData.append("photo_type", "progress");
    formData.append("uploaded_by", "Admin");
    try {
      await fetch(`${API_URL}/api/service-jobs/${job.id}/photos`, {
        method: "POST",
        body: formData,
      });
      setCaption("");
      setPhotoFile(null);
      onJobUpdated();
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  const handleGenerateInvoice = async () => {
    const res = await fetch(`${API_URL}/api/service-jobs/${job.id}/generate-invoice`, { method: "POST" });
    if (res.ok) onJobUpdated();
  };

  const tabs = [
    { id: "details", label: "Details", icon: FileText },
    { id: "updates", label: "Updates", icon: MessageSquare },
    { id: "parts", label: "Parts", icon: Package },
    { id: "photos", label: "Photos", icon: Camera }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-surface text-white rounded-lg p-0 max-w-4xl w-full mx-auto mt-10 shadow-xl max-h-[90vh] overflow-hidden"
      overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-start z-50 pt-10"
    >
      <div className="bg-highlight p-6 border-b border-border flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">{job.job_number}</h2>
          <p className="text-lg text-muted">{job.title}</p>
        </div>
        <button onClick={onClose} className="text-muted hover:text-text">
          <X size={24} />
        </button>
      </div>

      <div className="flex border-b border-border bg-surface">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === tab.id ? "text-accent border-b-2 border-accent" : "text-muted hover:text-text"
            }`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 200px)" }}>
        {activeTab === "details" && (
          <div className="space-y-6">
            <div className="bg-background rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <User size={20} /> Customer Information
              </h3>
              <p className="text-sm">{job.customer?.name} | {job.customer?.email}</p>
            </div>

            <button onClick={handleGenerateInvoice} className="mt-4 px-4 py-2 bg-accent text-white rounded">
              Generate Invoice
            </button>
          </div>
        )}

        {activeTab === "updates" && (
          <div>
            <div className="space-y-2">
              {job.updates.map((u) => (
                <div key={u.id} className="bg-background p-3 rounded flex justify-between">
                  <div>
                    <p className="font-medium text-sm">{u.title}</p>
                    <p className="text-muted text-xs">{u.description}</p>
                  </div>
                  <button onClick={() => handleDeleteUpdate(u.id)}><Trash size={16} /></button>
                </div>
              ))}
            </div>
            <textarea
              value={newUpdate}
              onChange={(e) => setNewUpdate(e.target.value)}
              className="w-full mt-4 p-2 bg-background border rounded"
              placeholder="New progress update..."
            />
            <button onClick={handleAddUpdate} className="mt-2 px-4 py-2 bg-accent text-white rounded">Add Update</button>
          </div>
        )}

        {activeTab === "parts" && (
          <div>
            <div className="space-y-2">
              {job.parts.map((p) => (
                <div key={p.id} className="bg-background p-3 rounded flex justify-between">
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-muted text-xs">Qty: {p.quantity} | ${p.unit_cost}</p>
                  </div>
                  <button onClick={() => handleDeletePart(p.id)}><Trash size={16} /></button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <input placeholder="Part Name" value={newPart.name} onChange={(e) => setNewPart({ ...newPart, name: e.target.value })} className="p-2 bg-background border rounded" />
              <input type="number" placeholder="Qty" value={newPart.quantity} onChange={(e) => setNewPart({ ...newPart, quantity: e.target.value })} className="p-2 bg-background border rounded" />
              <input type="number" placeholder="Unit Cost" value={newPart.unit_cost} onChange={(e) => setNewPart({ ...newPart, unit_cost: e.target.value })} className="p-2 bg-background border rounded" />
              <input placeholder="Supplier" value={newPart.supplier} onChange={(e) => setNewPart({ ...newPart, supplier: e.target.value })} className="p-2 bg-background border rounded" />
            </div>
            <button onClick={handleAddPart} className="mt-2 px-4 py-2 bg-accent text-white rounded">Add Part</button>
          </div>
        )}

        {activeTab === "photos" && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {job.photos.map((photo) => (
                <img key={photo.id} src={`/${photo.file_path}`} alt={photo.caption} className="w-full rounded" />
              ))}
            </div>
            <input type="file" onChange={(e) => setPhotoFile(e.target.files[0])} className="mb-2" />
            <input type="text" placeholder="Caption" value={caption} onChange={(e) => setCaption(e.target.value)} className="w-full mb-2 p-2 bg-background border rounded" />
            <button onClick={handleUploadPhoto} className="px-4 py-2 bg-accent text-white rounded">Upload Photo</button>
          </div>
        )}
      </div>
    </Modal>
  );
}