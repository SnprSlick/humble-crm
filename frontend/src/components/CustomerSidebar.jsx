import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function CustomerSidebar({ invoices = [], onLogout }) {
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden flex justify-between items-center mb-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white flex items-center gap-2"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          <span className="uppercase tracking-wide text-sm">Menu</span>
        </button>
      </div>

      {/* Sidebar Wrapper */}
      <div
        className={`${
          mobileOpen ? "block" : "hidden"
        } md:block w-full md:w-60 bg-[#1a1a1a] p-4 rounded-xl shadow-lg h-fit text-white`}
      >
        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full text-sm bg-red-600 hover:bg-red-700 px-4 py-2 rounded mb-4"
        >
          Logout
        </button>

        {/* Invoices Accordion */}
        <div>
          <button
            className="w-full text-left text-lg font-bold mb-2 focus:outline-none"
            onClick={() => setExpanded(!expanded)}
          >
            Previous Invoices
          </button>

          {expanded && (
            <>
              {invoices.length === 0 ? (
                <p className="text-gray-400 text-sm">No previous invoices found.</p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {invoices.map((inv, index) => (
                    <li
                      key={index}
                      className="bg-[#2a2a2a] p-3 rounded hover:bg-[#333] cursor-pointer"
                    >
                      <div className="font-semibold">#{inv.number}</div>
                      <div className="text-xs text-gray-400">{inv.date}</div>
                      <div className="text-xs">Total: ${inv.total.toFixed(2)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
