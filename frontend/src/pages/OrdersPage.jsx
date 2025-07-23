import React, { useEffect, useState, useRef } from "react";
import { ChevronRight, FileText } from "lucide-react";
import { Link } from "react-router-dom";

function SourceIcon({ source }) {
  if (!source) return null;
  const src = source.toLowerCase();
  if (src === "wave") {
    return (
      <svg className="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h3l3-9 4 18 3-9h3" />
      </svg>
    );
  }
  if (src === "bigc" || src === "bigcommerce") {
    return (
      <svg className="inline-block w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l9 5v10l-9 5-9-5V7l9-5z" />
      </svg>
    );
  }
  return null;
}

function StatusBadge({ status }) {
  const base = "px-2 py-0.5 rounded-full text-xs font-semibold inline-block uppercase";
  if (!status) return <span className={`${base} bg-gray-800 text-gray-300`}>—</span>;
  const s = status.toLowerCase();
  if (s === "shipped") return <span className={`${base} bg-green-800 text-green-200`}>Shipped</span>;
  if (s.includes("awaiting")) return <span className={`${base} bg-yellow-800 text-yellow-200`}>{status}</span>;
  return <span className={`${base} bg-gray-700 text-white`}>{status}</span>;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const topRef = useRef(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/orders`)
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error("Error fetching orders:", err));
  }, []);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const customerName = (order) => order.customer?.name || "Guest";

  const filtered = orders.filter((order) => {
    if (order.status?.toUpperCase() === "INCOMPLETE") return false;
    const search = searchTerm.toLowerCase();
    return (
      customerName(order).toLowerCase().includes(search) ||
      (order.customer?.email || "").toLowerCase().includes(search) ||
      (order.external_id || "").includes(search) ||
      (order.invoice_number || "").includes(search)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    const aVal = sortField === "customer" ? customerName(a) : a[sortField];
    const bVal = sortField === "customer" ? customerName(b) : b[sortField];
    if (!aVal) return 1;
    if (!bVal) return -1;
    return sortOrder === "asc" ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
  });

  const totalPages = Math.ceil(sorted.length / rowsPerPage);
  const paginated = sorted.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleSort = (field) => {
    if (sortField === field) setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const changePage = (p) => {
    setCurrentPage(p);
    if (topRef.current) topRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div ref={topRef} className="min-h-screen w-full text-text font-mono px-4 py-6">
      <h1 className="text-2xl font-bold uppercase mb-4 tracking-widest text-accent">📦 Orders</h1>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-1 text-sm rounded bg-black border border-border w-64"
        />
        <select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))} className="bg-black border border-border px-2 py-1 rounded text-sm">
          {[20, 50, 100].map((n) => (
            <option key={n} value={n}>{n} per page</option>
          ))}
        </select>
      </div>

      <div className="w-full border border-border bg-[#0a0a0a]">
        <div className="grid grid-cols-6 text-xs uppercase font-bold tracking-widest bg-highlight text-accent px-4 py-2 border-b border-border">
          <div onClick={() => handleSort("date")} className="cursor-pointer">Date</div>
          <div onClick={() => handleSort("customer")} className="cursor-pointer">Customer</div>
          <div>Order ID</div>
          <div>Status</div>
          <div className="text-right">Total</div>
          <div className="text-right">Actions</div>
        </div>

        {paginated.map((order, idx) => (
          <div key={order.id} onClick={() => toggleExpand(order.id)} className={`border-t border-border px-4 py-2 text-sm cursor-pointer ${idx % 2 === 0 ? "bg-background" : "bg-[#141414]"}`}>
            <div className="grid grid-cols-6 items-center">
              <div className="flex items-center gap-2">
                <ChevronRight className={`w-3.5 h-3.5 text-muted transition-transform duration-300 ${expanded[order.id] ? "rotate-90" : ""}`} />
                {order.date?.slice(0, 10) || "-"}
              </div>
              <div>{customerName(order)}</div>
              <div className="text-muted flex items-center">
                <SourceIcon source={order.source} />
                {order.source === "wave" ? `#${order.invoice_number}` : `#${order.external_id}`}
              </div>
              <div><StatusBadge status={order.status} /></div>
              <div className="text-right font-bold text-accentLight">${order.total?.toFixed(2) || "0.00"}</div>
              <div className="text-right" onClick={(e) => e.stopPropagation()}>
                <Link to={`/orders/${order.id}`} className="inline-flex items-center gap-1 bg-accent text-black px-3 py-1 rounded text-xs font-semibold shadow hover:bg-accentLight transition">
                  <FileText className="w-4 h-4" /> View
                </Link>
              </div>
            </div>

            {expanded[order.id] && (
              <div className="mt-2 border-t border-border pt-2 text-sm text-muted bg-black/30 p-2 rounded-sm space-y-2">
                <div><strong>Email:</strong> {order.customer?.email || "—"}</div>
                <div><strong>Phone:</strong> {order.customer?.phone || "—"}</div>
                <div><strong>Shipping:</strong> {order.shipping_tracking || "—"} via {order.shipping_carrier || "—"}</div>
                <div>
                  <strong>Line Items:</strong>
                  <ul className="ml-4 list-disc">
                    {order.line_items?.map((item, i) => (
                      <li key={i}>{item.quantity} × {item.name} @ ${item.unit_price?.toFixed(2)}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center mt-4 gap-4">
        <div className="flex gap-2 items-center flex-wrap justify-center">
          <button
            onClick={() => changePage(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 border border-border bg-[#111] rounded disabled:opacity-50"
          >
            Prev
          </button>

          {(() => {
            const pageButtons = [];
            const startPage = Math.max(1, currentPage - 3);
            const endPage = Math.min(totalPages, currentPage + 3);

            if (startPage > 1) {
              pageButtons.push(
                <button
                  key={1}
                  onClick={() => changePage(1)}
                  className={`px-3 py-1 border rounded ${currentPage === 1 ? "bg-accent text-black font-bold" : "bg-[#111] text-muted"}`}
                >
                  1
                </button>
              );
              if (startPage > 2) {
                pageButtons.push(<span key="start-ellipsis" className="px-2 text-muted">…</span>);
              }
            }

            for (let p = startPage; p <= endPage; p++) {
              pageButtons.push(
                <button
                  key={p}
                  onClick={() => changePage(p)}
                  className={`px-3 py-1 border rounded ${p === currentPage ? "bg-accent text-black font-bold" : "bg-[#111] text-muted"}`}
                >
                  {p}
                </button>
              );
            }

            if (endPage < totalPages) {
              if (endPage < totalPages - 1) {
                pageButtons.push(<span key="end-ellipsis" className="px-2 text-muted">…</span>);
              }
              pageButtons.push(
                <button
                  key={totalPages}
                  onClick={() => changePage(totalPages)}
                  className={`px-3 py-1 border rounded ${currentPage === totalPages ? "bg-accent text-black font-bold" : "bg-[#111] text-muted"}`}
                >
                  {totalPages}
                </button>
              );
            }

            return pageButtons;
          })()}

          <button
            onClick={() => changePage(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 border border-border bg-[#111] rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const p = parseInt(e.target.page.value);
            if (!isNaN(p) && p >= 1 && p <= totalPages) changePage(p);
          }}
          className="flex items-center gap-2"
        >
          <label htmlFor="page" className="text-xs text-muted">Jump to:</label>
          <input
            type="number"
            name="page"
            min="1"
            max={totalPages}
            defaultValue={currentPage}
            className="w-16 px-2 py-1 text-sm rounded bg-black border border-border text-center"
          />
          <button
            type="submit"
            className="px-2 py-1 text-xs bg-accent text-black rounded font-semibold"
          >
            Go
          </button>
        </form>
      </div>
    </div>
  );
}
