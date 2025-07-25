import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import RightSidebar from '../components/RightSidebar';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background text-text font-sans tracking-wide px-4 pb-4 gap-4 mt-1 relative z-0">
      {/* Top header (not the gradient bar) */}
      <div className="lg:hidden sticky top-0 z-30 bg-background px-2 pt-4">
        <button
          className="mb-2 flex items-center gap-2 text-xs uppercase font-semibold tracking-wider text-accentLight hover:text-white transition"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-5 h-5" />
          Menu
        </button>
      </div>

      <Header />

      <div className="flex flex-1 flex-col lg:flex-row gap-4">
        {/* Mobile Sidebar Overlay */}
        <div
          className={`fixed inset-0 z-[200] bg-black/80 transition-opacity lg:hidden ${
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

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex w-[240px]">
          <div className="w-full h-fit bg-surface border border-border shadow-panel rounded-md">
            <Sidebar />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative z-10">
          <div className="w-full h-full bg-surface border border-border shadow-panel rounded-md px-6 py-6">
            <Outlet />
          </div>
        </main>

        <aside className="hidden lg:flex w-[260px]">
          <RightSidebar />
        </aside>
      </div>
    </div>
  );
}
