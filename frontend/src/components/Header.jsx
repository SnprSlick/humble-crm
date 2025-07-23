import React from 'react';
import logo from '../assets/logo.png'; // Make sure this path matches your structure

export default function Header() {
  return (
    <header className="w-full bg-surface border-b border-border px-4 py-3 flex items-center justify-between shadow-panel z-50">
      <div className="flex items-center gap-4">
        <img
          src={logo}
          alt="Humble Performance"
          className="h-10 w-auto object-contain"
        />

      </div>

      {/* Optional: Right Side Info */}
      <div className="text-xs text-muted font-mono tracking-wide">
        {/* Could add live clock, version, status, etc. */}
        Powered by Humble · v1.0
      </div>
    </header>
  );
}
