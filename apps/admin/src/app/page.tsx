'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingCart,
  Users,
  MessageSquare,
  Phone,
  RefreshCw
} from 'lucide-react';
import { db } from '@divisha/database';

export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState(() => db.getDashboardKPIs());
  const [orders, setOrders] = useState(() => db.orders);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());

  // Real-time live auto-sync without needing manual refresh
  useEffect(() => {
    const syncLiveData = async () => {
      try {
        const [kpiRes, ordersRes] = await Promise.all([
          fetch('http://localhost:4000/v1/analytics/kpis').then((r) => (r.ok ? r.json() : null)),
          fetch('http://localhost:4000/v1/orders?limit=10').then((r) => (r.ok ? r.json() : null))
        ]);
        if (kpiRes?.data) setKpis(kpiRes.data);
        if (ordersRes?.data?.items) setOrders(ordersRes.data.items);
        else if (Array.isArray(ordersRes?.data)) setOrders(ordersRes.data);
        setLastSynced(new Date());
      } catch {
        // Fallback gracefully
      }
    };

    const interval = setInterval(syncLiveData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleWhatsAppCustomer = (phone: string, customerName: string, orderNumber: string) => {
    const raw = phone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `Hello ${customerName}, this is Divisha Electronics Customer Support regarding your order *${orderNumber}*. How can we assist you?`
    );
    window.open(`https://wa.me/${raw}?text=${msg}`, '_blank');
  };

  const handleCallCustomer = (phone: string) => {
    const raw = phone.replace(/[^0-9]/g, '');
    window.location.href = `tel:${raw}`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Store Dashboard & Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Live Sales, Orders, Inventory & Store Performance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-1 text-xs font-mono text-emerald-800 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Sync Active (Updated {lastSynced.toLocaleTimeString('en-IN')})</span>
          </div>

          <div className="rounded-full border border-slate-200 bg-white px-4 py-1 text-xs font-mono text-slate-700 shadow-sm">
            Date: <span className="text-brand-700 font-bold">2026-09-24</span>
          </div>
        </div>
      </div>

      {/* Top 4 Primary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Today Revenue */}
        <div className="rounded-2xl p-5 bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500 font-bold uppercase">Today&apos;s Sales</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/10 text-brand-700 font-bold font-mono text-sm">
              ₹
            </div>
          </div>
          <div className="mt-3 font-display text-2xl font-extrabold text-slate-900 font-mono">
            ₹{kpis.revenue.today.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 flex items-center text-xs text-emerald-700 font-mono font-semibold">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span>+{kpis.revenue.growthPercent}% vs last period</span>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="rounded-2xl p-5 bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500 font-bold uppercase">Monthly Run-Rate</span>
            <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3 font-display text-2xl font-extrabold text-slate-900 font-mono">
            ₹{kpis.revenue.monthly.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-xs text-slate-500 font-mono">
            Yesterday: ₹{kpis.revenue.yesterday.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Average Order Value */}
        <div className="rounded-2xl p-5 bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500 font-bold uppercase">Average Order Value</span>
            <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
              <ShoppingCart className="h-4 w-4 text-brand-600" />
            </div>
          </div>
          <div className="mt-3 font-display text-2xl font-extrabold text-slate-900 font-mono">
            ₹{Math.round(kpis.customers.averageOrderValue).toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-xs text-emerald-700 font-mono font-medium">
            High-Ticket Consumer Electronics
          </div>
        </div>

        {/* Active Customers */}
        <div className="rounded-2xl p-5 bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500 font-bold uppercase">Registered Customers</span>
            <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
              <Users className="h-4 w-4 text-brand-600" />
            </div>
          </div>
          <div className="mt-3 font-display text-2xl font-extrabold text-slate-900 font-mono">
            {kpis.customers.total.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-xs text-slate-500 font-mono">
            +{kpis.customers.newToday} registered today
          </div>
        </div>
      </div>

      {/* Conversion Funnel Section */}
      <div className="rounded-3xl p-6 sm:p-8 bg-white border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Customer Shopping & Order Journey
            </h2>
            <p className="text-xs text-slate-500">
              See how many visitors view products, add to cart, and complete payment.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-600">
              Overall Purchase Rate: <strong className="text-emerald-700">{kpis.conversionFunnel.overallConversionRate}%</strong>
            </span>
            <span className="text-slate-600">
              Cart Abandonment: <strong className="text-amber-700">{kpis.conversionFunnel.cartAbandonmentRate}%</strong>
            </span>
          </div>
        </div>

        {/* Visual Funnel Step Bars */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">1. Visitors</span>
            <div className="text-lg font-bold font-mono text-slate-900 mt-1">
              {kpis.conversionFunnel.visitors.toLocaleString()}
            </div>
            <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-slate-500 w-full rounded-full" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">2. Product Views</span>
            <div className="text-lg font-bold font-mono text-slate-900 mt-1">
              {kpis.conversionFunnel.productViews.toLocaleString()}
            </div>
            <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 w-[69%] rounded-full" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">3. Add To Cart</span>
            <div className="text-lg font-bold font-mono text-slate-900 mt-1">
              {kpis.conversionFunnel.addToCart.toLocaleString()}
            </div>
            <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 w-[24%] rounded-full" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">4. Checkout Started</span>
            <div className="text-lg font-bold font-mono text-slate-900 mt-1">
              {kpis.conversionFunnel.checkoutStarted.toLocaleString()}
            </div>
            <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-600 w-[12%] rounded-full" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">5. Payment Gateway</span>
            <div className="text-lg font-bold font-mono text-slate-900 mt-1">
              {kpis.conversionFunnel.paymentStarted.toLocaleString()}
            </div>
            <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[10%] rounded-full" />
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4">
            <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold">6. Purchased</span>
            <div className="text-lg font-bold font-mono text-emerald-900 mt-1">
              {kpis.conversionFunnel.purchaseCompleted.toLocaleString()}
            </div>
            <div className="mt-2 h-1.5 w-full bg-emerald-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 w-[9.8%] rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders with WhatsApp Customer Quick Actions */}
      <div className="rounded-3xl p-6 sm:p-8 bg-white border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Recent Orders & Direct WhatsApp Customer Dispatch
            </h2>
            <p className="text-xs text-slate-500">
              Live orders with authoritative payment verification, stock commitment, and 1-click WhatsApp customer actions.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 font-semibold">
            Total Orders: {orders.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 text-[10px] uppercase font-mono text-slate-500">
              <tr>
                <th className="py-3 px-4">Order Number</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Masterpiece</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">WhatsApp & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-brand-700">
                    {ord.orderNumber}
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900">{ord.customerName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{ord.customerPhone}</div>
                  </td>
                  <td className="py-4 px-4 max-w-xs truncate text-slate-700">
                    {ord.items[0]?.productName || 'Product'}
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-slate-900">
                    ₹{ord.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-4">
                    <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-800">
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-[11px] font-mono text-slate-700">
                      {ord.paymentStatus} ({ord.paymentMethod})
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    {/* One-Click WhatsApp Chat with Customer */}
                    <button
                      onClick={() => handleWhatsAppCustomer(ord.customerPhone, ord.customerName, ord.orderNumber)}
                      title="Chat with Customer on WhatsApp"
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-600 hover:bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-white transition-colors shadow-sm"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>Chat</span>
                    </button>

                    {/* Direct Voice Call */}
                    <button
                      onClick={() => handleCallCustomer(ord.customerPhone)}
                      title="Call Customer"
                      className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white hover:bg-slate-50 px-2.5 py-1 text-[11px] text-slate-700 transition-colors shadow-sm"
                    >
                      <Phone className="h-3 w-3 text-brand-600" />
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
