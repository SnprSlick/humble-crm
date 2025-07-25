import React, { useEffect, useState } from "react";

function SourceIcon({ source }) {
  if (source.toLowerCase() === "wave") {
    return <svg className="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h3l3-9 4 18 3-9h3" /></svg>;
  } else if (source.toLowerCase() === "bigc") {
    return <svg className="inline-block w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l9 5v10l-9 5-9-5V7l9-5z" /></svg>;
  }
  return null;
}

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState("");
  const [formCache, setFormCache] = useState({});
  const [edited, setEdited] = useState({});
  const [saved, setSaved] = useState({});
  const [showWithOrdersOnly, setShowWithOrdersOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetch(`${API_URL}/api/customers`)
      .then((res) => res.json())
      .then((data) => {
        data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setCustomers(data);
        const cache = {};
        data.forEach((c) => {
          cache[c.id] = {
            notes: c.notes || "",
            vehicles: c.vehicles || [
              {
                make: c.vehicle_make || "",
                model: c.vehicle_model || "",
                year: c.vehicle_year || ""
              }
            ],
            newYear: "",
            newMake: "",
            newModel: "",
            showVehicleForm: false
          };
        });
        setFormCache(cache);
      })
      .catch((err) => console.error("Error fetching customers:", err));
  }, []);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleVehicleChange = (id, field, value) => {
    setFormCache((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const removeVehicle = (id, index) => {
    const updated = [...(formCache[id]?.vehicles || [])];
    updated.splice(index, 1);
    setFormCache((prev) => ({
      ...prev,
      [id]: { ...prev[id], vehicles: updated }
    }));
    setEdited((prev) => ({ ...prev, [id]: true }));
    setSaved((prev) => ({ ...prev, [id]: false }));
  };

  const addVehicle = (id) => {
    const { newYear, newMake, newModel } = formCache[id];
    if (!newYear && !newMake && !newModel) return;
    const updated = [...(formCache[id]?.vehicles || []), { year: newYear, make: newMake, model: newModel }];
    setFormCache((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        vehicles: updated,
        newYear: "",
        newMake: "",
        newModel: "",
        showVehicleForm: false
      }
    }));
    setEdited((prev) => ({ ...prev, [id]: true }));
    setSaved((prev) => ({ ...prev, [id]: false }));
  };

  const cancelAddVehicle = (id) => {
    setFormCache((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        newYear: "",
        newMake: "",
        newModel: "",
        showVehicleForm: false
      }
    }));
  };

  const handleChange = (id, field, value) => {
    setFormCache((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
    setEdited((prev) => ({ ...prev, [id]: true }));
    setSaved((prev) => ({ ...prev, [id]: false }));
  };

  const saveChanges = (id) => {
    fetch(`${API_URL}/api/customers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formCache[id]),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save");
        return res.json();
      })
      .then(() => {
        setSaved((prev) => ({ ...prev, [id]: true }));
        setEdited((prev) => ({ ...prev, [id]: false }));
      })
      .catch((err) => console.error("❌ Failed to save", err));
  };

  const deleteCustomer = async (id) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      const res = await fetch(`${API_URL}/api/customers/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCustomers((prev) => prev.filter((c) => c.id !== id));
      }
    }
  };

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q);
    const hasOrders = !showWithOrdersOnly || (c.orders && c.orders.length > 0);
    return matchesSearch && hasOrders;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const visible = filtered.slice((page - 1) * perPage, page * perPage);

  const renderPagination = () => {
    const buttons = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      buttons.push(1);
      if (page > 4) buttons.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        buttons.push(i);
      }
      if (page < totalPages - 3) buttons.push("...");
      buttons.push(totalPages);
    }

    return buttons.map((pg, idx) => (
      <button
        key={idx}
        disabled={pg === "..."}
        onClick={() => typeof pg === "number" && setPage(pg)}
        className={`px-2 py-1 rounded ${pg === page ? "bg-accent text-white" : ""}`}
      >
        {pg}
      </button>
    ));
  };

  return (
    <div className="px-4 py-3">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 px-3 py-2 bg-surface border border-border rounded text-sm text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <div className="flex gap-4 items-center">
          <label className="text-xs text-muted">Rows:</label>
          <select
            value={perPage}
            onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
            className="bg-background border border-border rounded px-2 py-1 text-xs"
          >
            {[20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <button onClick={() => setShowWithOrdersOnly(p => !p)} className="text-xs text-accent underline hover:text-accentLight">
            {showWithOrdersOnly ? "Show All Customers" : "Show Only With Orders"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-border rounded">
        <table className="min-w-full text-sm text-left text-text bg-surface">
          <thead className="uppercase text-[10px] font-header text-muted bg-highlight border-b border-border">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Source</th>
              <th className="px-3 py-2">Actions</th>
              <th className="px-3 py-2">Orders?</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((cust) => (
              <React.Fragment key={cust.id}>
                <tr className="border-b border-border hover:bg-surfaceActive">
                  <td className="px-3 py-2 font-normal">{cust.name}</td>
                  <td className="px-3 py-2">{cust.email || "—"}</td>
                  <td className="px-3 py-2">{cust.phone || "—"}</td>
                  <td className="px-3 py-2 uppercase text-xs font-normal">{cust.source}</td>
                  <td className="px-3 py-2 space-x-2">
                    <button onClick={() => toggleExpand(cust.id)} className="text-accent text-xs underline">Details</button>
                    {(cust.source === "manual" || cust.source === "web") && (
                      <button onClick={() => deleteCustomer(cust.id)} className="text-red-500 text-xs underline">Delete</button>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-muted">
                    {Array.isArray(cust.orders) ? cust.orders.length : "—"}
                  </td>
                </tr>

                {expanded[cust.id] && (
                  <tr className="bg-[#101010] border-b border-border">
                    <td colSpan={6} className="p-4 space-y-4 text-sm">
                      <div className="uppercase text-[11px] font-bold text-muted mb-1">Orders</div>
                      {cust.orders?.length > 0 ? (
                        <ul className="list-disc ml-5 text-text">
                          {cust.orders.map((o) => (
                            <li key={o.id}>
                              <a href={`/orders/${o.id}`} className="text-accent underline">
                                <SourceIcon source={o.source} />
                                [{o.source.toUpperCase()}] #{o.invoice_number || o.external_id || o.id}
                              </a>{" "}
                              — {new Date(o.date).toLocaleDateString()}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted italic">No records found</p>
                      )}

                      <div className="space-y-2">
                        {(formCache[cust.id]?.vehicles || []).map((v, idx) => {
                          const label = [v.year, v.make, v.model].filter(Boolean).join(" ");
                          return (
                            <div key={idx} className="flex items-center justify-between border-b border-border py-1">
                              <span>{label}</span>
                              <button onClick={() => removeVehicle(cust.id, idx)} className="text-xs text-red-500">Remove</button>
                            </div>
                          );
                        })}

                        {!formCache[cust.id]?.showVehicleForm ? (
                          <button
                            onClick={() => setFormCache(prev => ({
                              ...prev,
                              [cust.id]: { ...prev[cust.id], showVehicleForm: true }
                            }))}
                            className="text-xs text-accent underline mt-2"
                          >
                            + Add Vehicle
                          </button>
                        ) : (
                          <div className="flex flex-col sm:flex-row gap-2 mt-2 items-end">
                            <input
                              placeholder="Year"
                              value={formCache[cust.id]?.newYear || ""}
                              onChange={(e) => handleVehicleChange(cust.id, "newYear", e.target.value)}
                              className="bg-surface border border-border rounded px-2 py-1 w-full sm:w-1/4"
                            />
                            <input
                              placeholder="Make"
                              value={formCache[cust.id]?.newMake || ""}
                              onChange={(e) => handleVehicleChange(cust.id, "newMake", e.target.value)}
                              className="bg-surface border border-border rounded px-2 py-1 w-full sm:w-1/4"
                            />
                            <input
                              placeholder="Model"
                              value={formCache[cust.id]?.newModel || ""}
                              onChange={(e) => handleVehicleChange(cust.id, "newModel", e.target.value)}
                              className="bg-surface border border-border rounded px-2 py-1 w-full sm:w-1/4"
                            />
                            <button onClick={() => addVehicle(cust.id)} className="text-xs bg-accent text-white px-3 py-1 rounded">Confirm</button>
                            <button onClick={() => cancelAddVehicle(cust.id)} className="text-xs text-muted underline">Cancel</button>
                          </div>
                        )}
                      </div>

                      <textarea value={formCache[cust.id]?.notes || ""} onChange={(e) => handleChange(cust.id, "notes", e.target.value)} rows={3} className="w-full bg-surface border border-border rounded p-2 text-sm" placeholder="Notes..." />

                      {edited[cust.id] ? (
                        <div className="flex justify-end">
                          <button onClick={() => saveChanges(cust.id)} className="px-4 py-1 text-xs bg-accent text-white rounded">Save</button>
                        </div>
                      ) : saved[cust.id] ? (
                        <div className="flex justify-end"><span className="text-xs text-green-500">Saved</span></div>
                      ) : null}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center items-center mt-6 gap-2 text-sm text-muted">
        <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>&lt;</button>
        {renderPagination()}
        <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>&gt;</button>
      </div>
    </div>
  );
}
