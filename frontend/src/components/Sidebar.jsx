import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Users,
  Package,
  ClipboardList,
  Calendar,
  Wrench,
  Truck
} from 'lucide-react';

import logo from '../assets/logo.png'; // adjust path as needed

export default function Sidebar() {
  const navItems = [
    { label: 'Dashboard', icon: <Home size={18} />, to: '/' },
    { label: 'Customers', icon: <Users size={18} />, to: '/customers' },
    { label: 'Orders', icon: <Package size={18} />, to: '/orders' },
    { label: 'To-Do', icon: <ClipboardList size={18} />, to: '/todo' },
    { label: 'Calendar', icon: <Calendar size={18} />, to: '/calendar' },
    { label: 'Service Jobs', icon: <Wrench size={18} />, to: '/service-jobs' },
    { label: 'Drop Ship', icon: <Truck size={18} />, to: '/drop-ship' },
  ];

  return (
    <div className="flex flex-col h-full p-4 space-y-4 bg-surface text-text font-sans text-sm tracking-wide">

      {/* Nav Links */}
      <nav className="flex flex-col space-y-2 mt-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-sm font-header tracking-widest text-xs uppercase transition ${
                isActive
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-muted hover:bg-highlight hover:text-white'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto text-muted text-xs tracking-wide px-2 pt-4 border-t border-border">
        <p className="opacity-60">© 2025 Humble Performance</p>
      </div>
    </div>
  );
}
