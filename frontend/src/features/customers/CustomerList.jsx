import React, { useEffect, useState } from "react";

function SourceIcon({ source }) {
  if (source.toLowerCase() === "wave") {
    return (
      <svg
        className="inline-block w-4 h-4 mr-1"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Wave"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h3l3-9 4 18 3-9h3"></path>
      </svg>
    );
  } else if (source.toLowerCase() === "bigc") {
    return (
      <svg
        className="inline-block w-4 h-4 mr-1"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="BigCommerce"
      >
        <path d="M12 2l9 5v10l-9 5-9-5V7l9-5z" />
      </svg>
    );
  } else {
    return null;
  }
}

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState("");
  const [formCache, setFormCache] = useState({});
  const [edited, setEdited] = useState({});
  const [saved, setSaved] = useState({});
  const [showWithOrdersOnly, setShowWithOrdersOnly] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetch(`${API_URL}/api/customers`)
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data);
        const cache = {};
        data.forEach((c) => {
          cache[c.id] = {
            notes: c.notes || "",
            vehicle_make: c.vehicle_make || "",
            vehicle_model: c.vehicle_model || ""
          };
        });
        setFormCache(cache);
      })
      .catch((err) => console.error("Error fetching customers:", err));
  }, []);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
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

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q);
    const hasOrders = !showWithOrdersOnly || (c.orders && c.orders.length > 0);
    return matchesSearch && hasOrders;
  });

  return (
    <div className="px-4 py-3">
      <h2 className="text-lg font-header font-bold uppercase text-accent mb-4">Customers</h2>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 px-3 py-2 bg-surface border border-border rounded text-sm text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          onClick={() => setShowWithOrdersOnly((prev) => !prev)}
          className="text-xs text-accent underline hover:text-accentLight"
        >
          {showWithOrdersOnly ? "Show All Customers" : "Show Only With Orders"}
        </button>
      </div>

      <div className="overflow-x-auto border border-border rounded">
        <table className="min-w-full text-sm text-left text-text bg-surface">
          <thead className="uppercase text-[10px] font-header text-muted bg-highlight border-b border-border">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Vehicle</th>
              <th className="px-3 py-2">Source</th>
              <th className="px-3 py-2">Actions</th>
              <th className="px-3 py-2">Orders?</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((cust) => (
              <React.Fragment key={cust.id}>
                <tr className="border-b border-border hover:bg-surfaceActive">
                  <td className="px-3 py-2 font-normal">{cust.name}</td>
                  <td className="px-3 py-2 font-normal">{cust.email || "—"}</td>
                  <td className="px-3 py-2 font-normal">{cust.phone || "—"}</td>
                  <td className="px-3 py-2 font-normal">
                    {cust.vehicle_make || cust.vehicle_model
                      ? `${cust.vehicle_make || ""} ${cust.vehicle_model || ""}`.trim()
                      : "—"}
                  </td>
                  <td className="px-3 py-2 uppercase text-xs font-normal">{cust.source}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => toggleExpand(cust.id)}
                      className="text-accent hover:text-accentLight text-xs underline"
                    >
                      {expanded[cust.id] ? "Hide" : "Details"}
                    </button>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-muted">
                    {Array.isArray(cust.orders) ? cust.orders.length : "—"}
                  </td>
                </tr>

                {expanded[cust.id] && (
                  <tr className="bg-[#101010] border-b border-border">
                    <td colSpan={7} className="p-4">
                      <div className="space-y-4 text-sm">
                        <div>
                          <div className="uppercase text-[11px] font-bold text-muted mb-1">
                            Orders & Invoices
                          </div>
                          {cust.orders?.length > 0 ? (
                            <ul className="list-disc ml-5 text-text font-normal">
                              {cust.orders.map((o) => (
                                <li key={o.id}>
                                  <a
                                    href={`/orders/${o.id}`}
                                    className="text-accent underline hover:text-accentLight"
                                  >
                                    <SourceIcon source={o.source} />
                                    [{o.source.toUpperCase()}] #{o.invoice_number || o.external_id || o.id}
                                  </a>{" "}
                                  — {new Date(o.date).toLocaleDateString()}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-muted italic font-normal">No records found</p>
                          )}
                        </div>

                        <div>
                          <div className="uppercase text-[11px] font-bold text-muted mb-1">Vehicle Info</div>
                          <div className="flex flex-col md:flex-row gap-2">
                            <input
                              value={formCache[cust.id]?.vehicle_make || ""}
                              onChange={(e) => handleChange(cust.id, "vehicle_make", e.target.value)}
                              placeholder="Make"
                              className="bg-surface border border-border rounded px-2 py-1 text-sm font-normal w-full md:w-1/3"
                            />
                            <input
                              value={formCache[cust.id]?.vehicle_model || ""}
                              onChange={(e) => handleChange(cust.id, "vehicle_model", e.target.value)}
                              placeholder="Model"
                              className="bg-surface border border-border rounded px-2 py-1 text-sm font-normal w-full md:w-1/3"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="uppercase text-[11px] font-bold text-muted mb-1">Notes</div>
                          <textarea
                            value={formCache[cust.id]?.notes || ""}
                            onChange={(e) => handleChange(cust.id, "notes", e.target.value)}
                            rows={3}
                            className="w-full bg-surface border border-border rounded p-2 text-sm font-normal"
                          />
                        </div>

                        {edited[cust.id] ? (
                          <div className="flex justify-end">
                            <button
                              onClick={() => saveChanges(cust.id)}
                              className="px-4 py-1 text-xs bg-accent hover:bg-accentLight text-white rounded"
                            >
                              Save Changes
                            </button>
                          </div>
                        ) : saved[cust.id] ? (
                          <div className="flex justify-end">
                            <span className="text-xs text-green-500 font-semibold">✔ Saved</span>
                          </div>
                        ) : null}

                        <div>
                          <div className="uppercase text-[11px] font-bold text-muted mb-1">
                            Service (Coming Soon)
                          </div>
                          <div className="text-muted italic font-normal">
                            This section will show recent services and upcoming appointments.
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
