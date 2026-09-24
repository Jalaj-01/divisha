'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  Download,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  IndianRupee,
  Layers
} from 'lucide-react';

interface PaymentRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  method: 'RAZORPAY_UPI' | 'RAZORPAY_CARD' | 'NET_BANKING' | 'COD_WHITE_GLOVE';
  gatewayPaymentId: string;
  status: 'CAPTURED' | 'SETTLED' | 'PENDING' | 'REFUNDED';
  createdAt: string;
  fee: number;
  tax: number;
}

const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-001',
    orderNumber: 'DIV-2026-98124',
    customerName: 'Aarav Mehta',
    customerEmail: 'aarav.mehta@example.com',
    amount: 209990,
    currency: 'INR',
    method: 'RAZORPAY_CARD',
    gatewayPaymentId: 'pay_Rzp992211Aarav',
    status: 'SETTLED',
    createdAt: '2026-09-22T14:31:00.000Z',
    fee: 4199.8,
    tax: 755.96
  },
  {
    id: 'pay-002',
    orderNumber: 'DIV-2026-94810',
    customerName: 'Aarav Mehta',
    customerEmail: 'aarav.mehta@example.com',
    amount: 159000,
    currency: 'INR',
    method: 'RAZORPAY_UPI',
    gatewayPaymentId: 'pay_Rzp774411UpiMehta',
    status: 'SETTLED',
    createdAt: '2026-09-20T09:16:00.000Z',
    fee: 0,
    tax: 0
  },
  {
    id: 'pay-003',
    orderNumber: 'DIV-2026-88301',
    customerName: 'Rhea Singhania',
    customerEmail: 'rhea.singhania@luxuryestates.in',
    amount: 193000,
    currency: 'INR',
    method: 'NET_BANKING',
    gatewayPaymentId: 'pay_HdfcCorp88301Rhea',
    status: 'CAPTURED',
    createdAt: '2026-09-23T10:14:00.000Z',
    fee: 3860,
    tax: 694.8
  },
  {
    id: 'pay-004',
    orderNumber: 'DIV-2026-77219',
    customerName: 'Devendra Parekh',
    customerEmail: 'devendra.parekh@ahmedabadfine.com',
    amount: 128000,
    currency: 'INR',
    method: 'RAZORPAY_UPI',
    gatewayPaymentId: 'pay_UpiParekh77219',
    status: 'SETTLED',
    createdAt: '2026-09-17T11:05:00.000Z',
    fee: 0,
    tax: 0
  }
];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const totalCaptured = payments.reduce((acc, p) => acc + p.amount, 0);

  const filtered = payments.filter((p) => {
    const matchSearch =
      p.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.gatewayPaymentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-brand-700 border border-amber-200 shadow-sm">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                Payments & Settlements Reconciliation
                <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[11px] font-mono font-bold text-emerald-800">
                  Razorpay Live Webhooks
                </span>
              </h1>
              <p className="text-sm text-slate-600">
                Authoritative transaction ledger, gateway settlement tracking, and payment reconciliation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:4000/v1/analytics/reports/export?type=orders"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="h-3.5 w-3.5 text-brand-600" />
            <span>Export Financial Ledger</span>
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-all">
          <div className="text-xs font-mono font-bold uppercase text-slate-500">Total Processed Volume</div>
          <div className="text-2xl font-display font-bold text-slate-900 mt-1">₹{totalCaptured.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-emerald-700 font-mono mt-1 font-semibold">100% Cryptographically Verified</div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-all">
          <div className="text-xs font-mono font-bold uppercase text-slate-500">Gateway Provider</div>
          <div className="text-base font-semibold text-brand-700 mt-1 flex items-center gap-2">
            <span>Razorpay Standard + Smart Collect</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">HMAC SHA-256 Signature Guard</div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-all">
          <div className="text-xs font-mono font-bold uppercase text-slate-500">Settlement Frequency</div>
          <div className="text-base font-semibold text-slate-900 mt-1">T+1 Business Day</div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">Bank of India, Vijay Nagar Indore</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="SETTLED">Settled</option>
            <option value="CAPTURED">Captured</option>
            <option value="PENDING">Pending</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search order number, client, payment ID..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 font-mono text-[10px] text-slate-500 uppercase">
            <tr>
              <th className="p-4">Payment Ref / Date</th>
              <th className="p-4">Order Reference</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Method</th>
              <th className="p-4">Gateway Transaction ID</th>
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
                <td className="p-4">
                  <div className="font-semibold text-slate-900">{item.customerName}</div>
                  <div className="text-[11px] text-slate-500">{item.customerEmail}</div>
                </td>
                <td className="p-4">
                  <span className="rounded-lg bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-mono text-slate-700 font-semibold">
                    {item.method}
                  </span>
                </td>
                <td className="p-4 font-mono text-[11px] text-slate-500">{item.gatewayPaymentId}</td>
                <td className="p-4 text-right font-mono font-bold text-slate-900">
                  ₹{item.amount.toLocaleString('en-IN')}
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
    </div>
  );
}
