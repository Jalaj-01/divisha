'use client';

import React, { useState } from 'react';
import {
  RotateCcw,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Plus,
  X
} from 'lucide-react';

interface RefundRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  reason: string;
  gatewayRefundId: string;
  status: 'PROCESSED' | 'PENDING' | 'REJECTED';
  initiatedBy: string;
  createdAt: string;
}

const INITIAL_REFUNDS: RefundRecord[] = [
  {
    id: 'ref-01',
    orderNumber: 'DIV-2026-88192',
    customerName: 'Samir Shroff',
    amount: 45000,
    reason: 'Customer requested change to 77" model before factory transit dispatch',
    gatewayRefundId: 'rfnd_Rzp993322Samir',
    status: 'PROCESSED',
    initiatedBy: 'Divisha Senior Executive',
    createdAt: '2026-09-19T16:00:00.000Z'
  },
  {
    id: 'ref-02',
    orderNumber: 'DIV-2026-77301',
    customerName: 'Priya Kothari',
    amount: 18500,
    reason: 'Bespoke fabric upholstery concession adjustment',
    gatewayRefundId: 'rfnd_Rzp551100Priya',
    status: 'PROCESSED',
    initiatedBy: 'Super Admin',
    createdAt: '2026-09-15T11:20:00.000Z'
  }
];

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<RefundRecord[]>(INITIAL_REFUNDS);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  // New refund form state
  const [orderRef, setOrderRef] = useState('');
  const [clientName, setClientName] = useState('');
  const [refundAmt, setRefundAmt] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const handleCreateRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderRef || !refundAmt) return;

    const newRef: RefundRecord = {
      id: `ref-${Date.now().toString().slice(-4)}`,
      orderNumber: orderRef,
      customerName: clientName || 'VIP Customer',
      amount: parseFloat(refundAmt),
      reason: refundReason || 'Executive Privilege Adjustment',
      gatewayRefundId: `rfnd_Rzp_${Math.random().toString(36).substring(2, 8)}`,
      status: 'PROCESSED',
      initiatedBy: 'Super Admin Session',
      createdAt: new Date().toISOString()
    };

    setRefunds([newRef, ...refunds]);
    setShowModal(false);
    setOrderRef('');
    setClientName('');
    setRefundAmt('');
    setRefundReason('');
  };

  const filtered = refunds.filter(
    (r) =>
      r.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.gatewayRefundId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
              <RotateCcw className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                Refunds & Reversals Management
                <span className="rounded-full bg-slate-100 border border-slate-300 px-2.5 py-0.5 text-[11px] font-mono text-slate-700 font-bold">
                  Authoritative Ledger
                </span>
              </h1>
              <p className="text-sm text-slate-600">
                Process customer reversals, track gateway credit notes, and maintain statutory audit logs.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-600 to-rose-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:from-rose-500 hover:to-rose-600 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Initiate Statutory Refund</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search order ref, client, gateway ID..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 font-mono text-[10px] text-slate-500 uppercase">
            <tr>
              <th className="p-4">Refund ID / Date</th>
              <th className="p-4">Order Ref</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Reason / Notes</th>
              <th className="p-4">Gateway ARN</th>
              <th className="p-4 text-right">Amount</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4">
                  <div className="font-mono text-slate-900 font-semibold">{item.id}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {new Date(item.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                </td>
                <td className="p-4 font-mono font-bold text-brand-700">{item.orderNumber}</td>
                <td className="p-4 font-medium text-slate-900">{item.customerName}</td>
                <td className="p-4 text-slate-600 max-w-xs">{item.reason}</td>
                <td className="p-4 font-mono text-[11px] text-slate-500">{item.gatewayRefundId}</td>
                <td className="p-4 text-right font-mono font-bold text-rose-700">
                  -₹{item.amount.toLocaleString('en-IN')}
                </td>
                <td className="p-4 text-right">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-800">
                    <CheckCircle2 className="h-3 w-3" />
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-rose-600" />
                Initiate Customer Refund
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRefund} className="space-y-3">
              <div>
                <label className="text-xs font-mono font-semibold text-slate-700 block mb-1">Order Reference</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DIV-2026-98124"
                  value={orderRef}
                  onChange={(e) => setOrderRef(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 font-mono focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-semibold text-slate-700 block mb-1">Customer Name</label>
                <input
                  type="text"
                  placeholder="e.g. Aarav Mehta"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-semibold text-slate-700 block mb-1">Refund Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 25000"
                  value={refundAmt}
                  onChange={(e) => setRefundAmt(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 font-mono focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-semibold text-slate-700 block mb-1">Statutory Reason</label>
                <textarea
                  rows={2}
                  placeholder="Reason for return/concession..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-500 transition-colors shadow-sm"
                >
                  Process Reversal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
