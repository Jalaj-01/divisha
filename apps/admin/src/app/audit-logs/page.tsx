'use client';

import React, { useState } from 'react';
import {
  History,
  Search,
  User,
  Clock,
  Filter,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  actor: string;
  actorRole: string;
  ipAddress: string;
  timestamp: string;
  details: string;
}

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-01',
    action: 'ORDER_PACKED',
    entity: 'Order',
    entityId: 'DIV-2026-98124',
    actor: 'admin@divisha.com',
    actorRole: 'Administrator',
    ipAddress: '103.211.54.12 (Indore, MP)',
    timestamp: '2026-09-23T19:20:00.000Z',
    details: 'Changed order status from PROCESSING to PACKED.'
  },
  {
    id: 'aud-02',
    action: 'STOCK_RESTOCKED',
    entity: 'InventoryVariant',
    entityId: 'Sony OLED 77" (SNY-XR77-OLED-STD)',
    actor: 'warehouse@divisha.com',
    actorRole: 'Warehouse Manager',
    ipAddress: '103.211.54.14 (Indore Warehouse)',
    timestamp: '2026-09-23T17:45:00.000Z',
    details: 'Added +10 units of Sony 77" OLED TV from new supplier shipment.'
  },
  {
    id: 'aud-03',
    action: 'ANNOUNCEMENT_UPDATED',
    entity: 'StoreSettings',
    entityId: 'Top Announcement Banner',
    actor: 'admin@divisha.com',
    actorRole: 'Administrator',
    ipAddress: '103.211.54.12',
    timestamp: '2026-09-23T16:10:00.000Z',
    details: 'Updated top announcement text and 10% discount promo code.'
  },
  {
    id: 'aud-04',
    action: 'SHIPPING_ALERT_SENT',
    entity: 'WhatsAppAlert',
    entityId: 'Order DIV-2026-1001',
    actor: 'support@divisha.com',
    actorRole: 'Support Executive',
    ipAddress: '103.211.54.18',
    timestamp: '2026-09-23T15:30:00.000Z',
    details: 'Sent WhatsApp courier tracking AWB BD-889922110 to customer Aarav Mehta.'
  }
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filtered = logs.filter((l) => {
    const matchAction = actionFilter === 'ALL' || l.action === actionFilter;
    const matchSearch =
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchAction && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 border border-brand-200 shadow-sm">
            <History className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
                Staff Activity History & Security Log
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Recording
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Automatic record of all actions taken by store staff (stock updates, order changes, price edits) for security and accountability.
            </p>
          </div>
        </div>
      </div>

      {/* EXPLANATION BOX */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 flex items-start gap-3.5">
        <HelpCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 space-y-1">
          <p className="font-bold text-sm text-blue-950">
            What is the Staff Activity History & Security Log?
          </p>
          <p className="text-blue-800 leading-relaxed">
            This page works like an automatic security log for your store. Whenever an employee or staff member takes an action — such as changing an order status, adding stock, or changing product prices — it is recorded here with:
          </p>
          <ul className="list-disc list-inside text-blue-800 space-y-0.5 pt-1">
            <li><b>Who did it</b> (staff name & email)</li>
            <li><b>What was changed</b> (e.g. stock added, order shipped)</li>
            <li><b>Exact time & date</b></li>
          </ul>
          <p className="text-blue-800 pt-1">
            This gives you total transparency over your business and prevents errors or unauthorized changes.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by staff, action, or item..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white"
          />
        </div>

        <span className="text-xs text-slate-500 font-mono">
          Showing {filtered.length} recorded actions
        </span>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-mono uppercase text-slate-500 text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Time & Date</th>
                <th className="px-6 py-3.5">Staff Member</th>
                <th className="px-6 py-3.5">Action Taken</th>
                <th className="px-6 py-3.5">Item / Target</th>
                <th className="px-6 py-3.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('en-IN')}
                  </td>

                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{log.actor}</p>
                    <span className="text-[10px] text-slate-500 font-mono">{log.actorRole}</span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-800 border border-slate-200">
                      {log.action}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-mono text-slate-800 font-semibold max-w-xs truncate">
                    {log.entityId}
                  </td>

                  <td className="px-6 py-4 text-slate-600 max-w-sm">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
