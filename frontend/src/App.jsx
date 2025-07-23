import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Menu } from 'lucide-react';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import RightSidebar from './components/RightSidebar';

import MainDashboard from './pages/MainDashboard';
import CustomersPage from './pages/CustomersPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ToDoPage from './pages/ToDoPage';
import CalendarPage from './pages/CalendarPage';
import ServicePage from './pages/ServicePage';
import DropShipDashboard from './pages/DropShipDashboard';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [input, setInput] = useState('');

  const password = 'admin123'; // 🔒 Set your desired password here

  if (!accessGranted) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-white font-sans">
        <h1 className="text-2xl mb-4 tracking-wide uppercase text-accent">Enter Password</h1>
        <input
          type="password"
          className="p-2 bg-gray-800 border border-gray-700 text-white rounded mb-4 w-64 text-center"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && input === password) {
              setAccessGranted(true);
            }
          }}
        />
        <button
          onClick={() => {
            if (input === password) setAccessGranted(true);
          }}
          className="px-4 py-2 bg-accent hover:bg-red-700 rounded"
        >
          Unlock
        </button>
      </div>
    );
  }

  return (
    <Router>
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-black to-accent z-50 shadow-md" />

      <div className="flex flex-col min-h-screen bg-background text-text font-sans tracking-wide px-4 pb-4 gap-4 mt-1">
        <Header />

        <div className="flex flex-1 flex-col lg:flex-row gap-4">
          <div
            className={`fixed inset-0 z-40 bg-black/80 transition-opacity lg:hidden ${
              sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <div
              className="w-64 h-full bg-surface border-l border-accent shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar />
            </div>
          </div>

          <div className="hidden lg:flex w-[240px]">
            <div className="w-full h-fit bg-surface border border-border shadow-panel rounded-md">
              <Sidebar />
            </div>
          </div>

          <main className="flex-1 overflow-y-auto">
            <div className="w-full h-full bg-surface border border-border shadow-panel rounded-md px-6 py-6">
              <button
                className="lg:hidden mb-4 flex items-center gap-2 text-xs uppercase font-semibold tracking-wider text-accentLight hover:text-white transition"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
                Menu
              </button>

              <Routes>
                <Route path="/" element={<MainDashboard />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/orders/:id" element={<OrderDetailPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/todo" element={<ToDoPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/service" element={<ServicePage />} />
                <Route path="/drop-ship" element={<DropShipDashboard />} />
              </Routes>
            </div>
          </main>

          <aside className="hidden lg:flex w-[260px]">
            <RightSidebar />
          </aside>
        </div>
      </div>
    </Router>
  );
}
