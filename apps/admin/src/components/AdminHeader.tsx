'use client';

import React, { useState } from 'react';
import { Search, Bell, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function AdminHeader() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`Global search results for: "${searchQuery}"\nFound 1 matching Order (DIV-2026-98124) and 2 matching Products.`);
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Global Admin Search Bar */}
      <form onSubmit={handleSearch} className="relative w-96">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Global Search (Order #, SKU, Customer phone, Email)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white font-mono transition-all"
        />
      </form>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* System Health Indicators */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-mono text-emerald-800">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Store Status: Live & Synced</span>
        </div>

        {/* Live Storefront Link */}
        <Link
          href="http://localhost:3000"
          target="_blank"
          className="flex items-center gap-1.5 text-xs text-brand-700 font-bold hover:text-brand-900 transition-colors"
        >
          <span>View Customer Storefront</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500" />
        </button>
      </div>
    </header>
  );
}
