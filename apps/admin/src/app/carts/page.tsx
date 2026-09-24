'use client';

import React, { useState } from 'react';
import {
  ShoppingCart,
  Search,
  MessageSquare,
  Clock,
  Send,
  CheckCircle2,
  Info,
  HelpCircle
} from 'lucide-react';

interface CartSummary {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  itemsCount: number;
  itemsPreview: string;
  subtotal: number;
  lastActive: string;
  status: 'ACTIVE' | 'ABANDONED';
}

const INITIAL_CARTS: CartSummary[] = [
  {
    id: 'cart-abnd-01',
    customerName: 'Kunal Singhal',
    customerPhone: '+919820011445',
    customerEmail: 'kunal.singhal@capitalrealty.in',
    itemsCount: 1,
    itemsPreview: 'Divisha Celestial 77" Master OLED 4K',
    subtotal: 289999,
    lastActive: '2026-09-23T18:30:00.000Z',
    status: 'ABANDONED'
  },
  {
    id: 'cart-abnd-02',
    customerName: 'Aanchal Mittal',
    customerPhone: '+919811224499',
    customerEmail: 'aanchal@mittaldesigns.com',
    itemsCount: 2,
    itemsPreview: 'Solid Malabar Teak 8-Seater Dining Table + Credenza',
    subtotal: 203000,
    lastActive: '2026-09-23T19:10:00.000Z',
    status: 'ABANDONED'
  },
  {
    id: 'cart-actv-03',
    customerName: 'Aarav Mehta',
    customerPhone: '+919876543210',
    customerEmail: 'aarav.mehta@example.com',
    itemsCount: 1,
    itemsPreview: 'Samsung 65" Neo QLED 8K TV',
    subtotal: 349999,
    lastActive: '2026-09-23T19:40:00.000Z',
    status: 'ACTIVE'
  }
];

export default function ActiveAndAbandonedCartsPage() {
  const [carts, setCarts] = useState<CartSummary[]>(INITIAL_CARTS);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [nudgedCarts, setNudgedCarts] = useState<Record<string, boolean>>({});

  const handleSendReminder = (cart: CartSummary) => {
    const raw = cart.customerPhone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `Hello ${cart.customerName},\n\nWe noticed you left *${cart.itemsPreview}* in your cart at Divisha Electronics.\n\nComplete your purchase today and get flat 10% off with coupon code *DIVISHA10*:\nhttp://localhost:3000/cart\n\nIf you need any help with your order, reply to this message!`
    );
    window.open(`https://wa.me/${raw}?text=${msg}`, '_blank');
    setNudgedCarts({ ...nudgedCarts, [cart.id]: true });
  };

  const filtered = carts.filter((c) => {
    const matchStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchSearch =
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerPhone.includes(searchTerm) ||
      c.itemsPreview.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-brand-700 border border-amber-200 shadow-sm">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
                Incomplete Orders & Abandoned Carts
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync Active
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              See customers who added products to their cart but left before paying, and send WhatsApp reminders to recover sales.
            </p>
          </div>
        </div>
      </div>

      {/* WHAT DOES ABANDONED MEAN? - EXPLANATION CARD */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 flex items-start gap-3.5">
        <HelpCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 space-y-1">
          <p className="font-bold text-sm text-blue-950">
            What does "Abandoned Cart" mean?
          </p>
          <p className="text-blue-800 leading-relaxed">
            An <b>Abandoned Cart</b> means a customer added products to their shopping cart and typed their contact details, but left your website without completing the final payment.
          </p>
          <p className="text-blue-800 leading-relaxed">
            <b>How to use this page:</b> Click <b>"Send WhatsApp Reminder"</b> to message the customer directly with a reminder and discount code. This helps bring back buyers and complete the sale!
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="text-xs font-mono font-bold uppercase text-slate-500">Unfinished Order Value</div>
          <div className="text-2xl font-display font-bold text-brand-700 mt-1">₹4,92,999</div>
          <div className="text-[11px] text-slate-500 mt-1">2 Customers ready for WhatsApp reminder</div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="text-xs font-mono font-bold uppercase text-slate-500">Currently Shopping</div>
          <div className="text-2xl font-display font-bold text-emerald-700 mt-1">1 Active Cart</div>
          <div className="text-[11px] text-slate-500 mt-1">Value: ₹3,49,999 in active session</div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
          <div className="text-xs font-mono font-bold uppercase text-slate-500">Recovery Success Rate</div>
          <div className="text-2xl font-display font-bold text-slate-900 mt-1">38%</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">Orders recovered via WhatsApp message</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white"
          >
            <option value="ALL">All Carts</option>
            <option value="ABANDONED">Unfinished Orders (Payment Not Made)</option>
            <option value="ACTIVE">Currently Shopping (Active)</option>
          </select>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customer, phone, products..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white"
          />
        </div>
      </div>

      {/* Carts Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-mono uppercase text-slate-500 text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Customer & Phone</th>
                <th className="px-6 py-3.5">Cart Items</th>
                <th className="px-6 py-3.5 font-mono text-right">Cart Total</th>
                <th className="px-6 py-3.5">Order Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((cart) => (
                <tr key={cart.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{cart.customerName}</p>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">{cart.customerPhone}</p>
                  </td>

                  <td className="px-6 py-4 max-w-sm">
                    <p className="font-medium text-slate-900 line-clamp-1">{cart.itemsPreview}</p>
                    <span className="text-[11px] text-slate-500">{cart.itemsCount} item{cart.itemsCount > 1 ? 's' : ''} in cart</span>
                  </td>

                  <td className="px-6 py-4 font-mono font-bold text-slate-900 text-right">
                    ₹{cart.subtotal.toLocaleString('en-IN')}
                  </td>

                  <td className="px-6 py-4">
                    {cart.status === 'ABANDONED' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-300">
                        Payment Not Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-300">
                        Currently Shopping
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleSendReminder(cart)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm ${
                        nudgedCarts[cart.id]
                          ? 'bg-slate-100 text-slate-600 border border-slate-300'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>{nudgedCarts[cart.id] ? 'Reminder Sent' : 'Send WhatsApp Reminder'}</span>
                    </button>
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
