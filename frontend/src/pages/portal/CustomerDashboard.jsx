import { useEffect, useState } from "react";
import CustomerSidebar from "../../components/CustomerSidebar";

export default function CustomerDashboard({ auth }) {
  const [customer, setCustomer] = useState(null);
  const [latestMessage, setLatestMessage] = useState("“Hey! Your turbo will arrive Thursday. We’ll update once it’s installed.”");
  const [showReply, setShowReply] = useState(false);

  const invoices = [
    { number: "INV-001", date: "2025-06-18", total: 1350.0 },
    { number: "INV-002", date: "2025-07-01", total: 875.5 },
    { number: "INV-003", date: "2025-07-15", total: 2200.0 }
  ];

  const handleLogout = () => {
    localStorage.removeItem("portalToken");
    localStorage.removeItem("portalCustomerId");
    window.location.reload();
  };

  useEffect(() => {
    setCustomer({
      name: "Test Customer",
      email: "test@example.com",
      phone: "555-1234",
      vehicle_make: "Honda",
      vehicle_model: "Civic",
      notes: "Customer prefers text over email. Dropping car off early."
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white px-4 py-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      <aside className="w-full md:w-60">
        <CustomerSidebar invoices={invoices} onLogout={handleLogout} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Conditional Shop Banner + Reply Toggle */}
        {latestMessage && (
          <div className="bg-red-800 text-white p-4 rounded-xl shadow">
            <p><strong>Message from the Shop:</strong> {latestMessage}</p>
            <button
              onClick={() => setShowReply(!showReply)}
              className="text-sm underline mt-2"
            >
              {showReply ? "Hide Reply" : "Click here to reply"}
            </button>
            {showReply && (
              <div className="mt-3">
                <textarea
                  className="w-full bg-[#2a2a2a] p-2 rounded resize-none text-white"
                  placeholder="Type your reply..."
                  rows={3}
                />
                <button className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm">
                  Send Reply
                </button>
              </div>
            )}
          </div>
        )}

        {/* Row 1: Customer Info + Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1e1e1e] p-4 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-2">Customer Info</h2>
            {customer && (
              <div>
                <p><strong>Name:</strong> {customer.name}</p>
                <p><strong>Email:</strong> {customer.email}</p>
                <p><strong>Phone:</strong> {customer.phone}</p>
                <p><strong>Vehicle:</strong> {customer.vehicle_make} {customer.vehicle_model}</p>
              </div>
            )}
          </div>

          <div className="bg-[#1e1e1e] p-4 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-2">Customer Notes</h2>
            <p>{customer?.notes || "No notes available."}</p>
          </div>
        </div>

        {/* Invoice (Full Width) */}
        <div className="bg-[#1e1e1e] p-4 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-2">Invoice</h2>
          <details className="bg-[#2a2a2a] rounded-lg p-4">
            <summary className="cursor-pointer text-white font-semibold">
              View Invoice - Total: $1,350.00
            </summary>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full table-auto text-sm text-left border-collapse mt-2">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-300">
                    <th className="pb-2 px-3">Item</th>
                    <th className="pb-2 px-3">Qty</th>
                    <th className="pb-2 px-3">Unit Price</th>
                    <th className="pb-2 px-3">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  <tr>
                    <td className="py-2 px-3">Turbo Kit</td>
                    <td className="py-2 px-3">1</td>
                    <td className="py-2 px-3">$950.00</td>
                    <td className="py-2 px-3">$950.00</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Injectors</td>
                    <td className="py-2 px-3">4</td>
                    <td className="py-2 px-3">$100.00</td>
                    <td className="py-2 px-3">$400.00</td>
                  </tr>
                </tbody>
              </table>
              <div className="text-right mt-4 space-y-1 text-sm">
                <p>Subtotal: $1,350.00</p>
                <p>Tax: $0.00</p>
                <p className="font-bold text-lg">Total: $1,350.00</p>
              </div>
            </div>
          </details>
        </div>

        {/* Updates + Parts + Pictures */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1e1e1e] p-4 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">Latest Updates</h2>
            <table className="w-full table-auto text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-700 text-gray-300">
                  <th className="pb-2 px-3">Date</th>
                  <th className="pb-2 px-3">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr>
                  <td className="py-2 px-3">7/22</td>
                  <td className="py-2 px-3">Engine disassembled</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">7/23</td>
                  <td className="py-2 px-3">Parts ordered</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">7/24</td>
                  <td className="py-2 px-3">Awaiting turbo delivery</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-4">
              <h2 className="text-lg font-semibold">Estimated Next Update</h2>
              <p>Estimated: Friday, July 26, 2025</p>
            </div>
          </div>

          <div className="bg-[#1e1e1e] p-4 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">Parts Tracker</h2>
            <table className="w-full table-auto text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-700 text-gray-300">
                  <th className="pb-2 px-3">Part</th>
                  <th className="pb-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr>
                  <td className="py-2 px-3">Clutch Kit</td>
                  <td className="py-2 px-3">In Shop</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Turbo</td>
                  <td className="py-2 px-3">Shipped (FedEx)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Injectors</td>
                  <td className="py-2 px-3 text-yellow-400">Backordered</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-[#1e1e1e] p-4 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">Picture Progress</h2>
            <div className="grid grid-cols-2 gap-2">
              <img src="/sample1.jpg" alt="Progress 1" className="rounded-lg object-cover" />
              <img src="/sample2.jpg" alt="Progress 2" className="rounded-lg object-cover" />
              <img src="/sample3.jpg" alt="Progress 3" className="rounded-lg object-cover" />
            </div>
          </div>
        </div>

        {/* Dyno Results */}
        <div className="bg-[#1e1e1e] p-4 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Dyno Results</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <img src="/dyno1.jpg" alt="Dyno 1" className="rounded-lg object-cover" />
            <img src="/dyno2.jpg" alt="Dyno 2" className="rounded-lg object-cover" />
          </div>
        </div>

        {/* Message History */}
        <div className="bg-[#1e1e1e] p-4 rounded-xl shadow-lg mb-6">
          <h2 className="text-xl font-bold mb-4">Message History</h2>
          <div className="space-y-2 text-sm">
            <div className="bg-[#2a2a2a] p-3 rounded">
              <p>“Hey! Your turbo will arrive Thursday. We’ll update once it’s installed.”</p>
              <p className="text-xs text-gray-400 text-right">7/23 4:12 PM — Shop</p>
            </div>
            <div className="bg-[#2a2a2a] p-3 rounded text-right">
              <p>“Thanks for the update. Can you confirm the tracking #?”</p>
              <p className="text-xs text-gray-400 text-left">7/23 4:32 PM — Customer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
