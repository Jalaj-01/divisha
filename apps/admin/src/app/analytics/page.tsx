'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Users,
  ShoppingCart,
  CreditCard,
  CheckCircle2,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  Layers,
  Activity,
  Calendar,
  IndianRupee,
  RefreshCw
} from 'lucide-react';
import { DashboardKpiDTO, AnalyticsEventDTO } from '@divisha/types';

const API_BASE = 'http://localhost:4000/v1';

export default function AnalyticsDashboardPage() {
  const [kpis, setKpis] = useState<DashboardKpiDTO | null>(null);
  const [events, setEvents] = useState<AnalyticsEventDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingType, setDownloadingType] = useState<string | null>(null);

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [kpiRes, evRes] = await Promise.all([
        fetch(`${API_BASE}/analytics/kpis`),
        fetch(`${API_BASE}/analytics/events?limit=25`)
      ]);
      const kpiJson = await kpiRes.json();
      const evJson = await evRes.json();

      setKpis(kpiJson.data || kpiJson);
      setEvents(evJson.data || evJson || []);
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData(true);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleDownloadCsv = (type: 'orders' | 'inventory' | 'tax') => {
    setDownloadingType(type);
    const link = document.createElement('a');
    link.href = `${API_BASE}/analytics/reports/export?type=${type}`;
    link.setAttribute('download', `divisha-${type}-report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadingType(null), 1000);
  };

  const funnel = kpis?.conversionFunnel || {
    visitors: 14200,
    productViews: 9800,
    addToCart: 2400,
    checkoutStarted: 1250,
    paymentStarted: 1040,
    purchaseCompleted: 980,
    cartAbandonmentRate: 47.9,
    checkoutAbandonmentRate: 21.6,
    overallConversionRate: 6.9
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-700 font-bold">
              STORE PERFORMANCE
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync Active
            </span>
          </div>
          <h1 className="mt-1 font-display text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            Sales & Store Analytics
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            Monitor sales performance, customer purchase steps, top products, and download accounting CSV reports.
          </p>
        </div>
      </div>

      {/* Financial & Tax CSV Reports Strip */}
      <div className="rounded-2xl border border-brand-200 bg-gradient-to-r from-amber-50/40 via-white to-amber-50/40 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-brand-600" />
            <h3 className="font-display text-base font-bold text-slate-900">
              Official Statutory & Financial CSV Reports
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            State of Supply: <strong className="text-brand-700">Madhya Pradesh (Code 23)</strong> • UTF-8 BOM Excel Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Orders CSV */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between space-y-3 shadow-sm">
            <div>
              <div className="font-display font-bold text-slate-900 text-sm">
                Orders Fulfillment Ledger
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Itemized transaction numbers, customer details, freight, payment methods, and BlueDart tracking AWB.
              </p>
            </div>
            <button
              onClick={() => handleDownloadCsv('orders')}
              disabled={downloadingType === 'orders'}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:border-brand-500/40 transition-all shadow-sm"
            >
              <Download className="h-3.5 w-3.5 text-brand-600" />
              <span>{downloadingType === 'orders' ? 'Preparing CSV...' : 'Download Orders CSV'}</span>
            </button>
          </div>

          {/* Inventory CSV */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between space-y-3 shadow-sm">
            <div>
              <div className="font-display font-bold text-slate-900 text-sm">
                Warehouse Stock Valuation
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Complete SKU inventory balance, reserved units, warehouse on-hand stock, and reorder warning statuses.
              </p>
            </div>
            <button
              onClick={() => handleDownloadCsv('inventory')}
              disabled={downloadingType === 'inventory'}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:border-brand-500/40 transition-all shadow-sm"
            >
              <Download className="h-3.5 w-3.5 text-brand-600" />
              <span>{downloadingType === 'inventory' ? 'Preparing CSV...' : 'Download Inventory CSV'}</span>
            </button>
          </div>

          {/* Tax CSV */}
          <div className="rounded-xl border border-brand-300 bg-white p-4 flex flex-col justify-between space-y-3 shadow-sm">
            <div>
              <div className="font-display font-bold text-brand-800 text-sm flex items-center justify-between">
                <span>GST Tax Reconciliation (M.P.)</span>
                <span className="text-[10px] font-mono rounded bg-brand-50 border border-brand-200 px-1.5 py-0.5 text-brand-700 font-bold">
                  GSTIN 23
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                CGST 9% + SGST 9% (Intrastate MP) and IGST 18% (Interstate) tax split breakdown for quarterly GST filing.
              </p>
            </div>
            <button
              onClick={() => handleDownloadCsv('tax')}
              disabled={downloadingType === 'tax'}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-500 to-amber-500 text-slate-950 font-bold px-4 py-2 text-xs hover:brightness-105 transition-all shadow-md shadow-brand-500/20"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{downloadingType === 'tax' ? 'Exporting...' : 'Download GST Tax CSV (MP)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conversion Funnel Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-brand-600 font-semibold">
              STEP-BY-STEP FUNNEL TELEMETRY
            </div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              End-to-End Storefront Conversion Funnel
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-500">
              Cart Abandonment: <strong className="text-amber-600">{funnel.cartAbandonmentRate}%</strong>
            </span>
            <span className="text-slate-500">
              Overall Conversion: <strong className="text-emerald-600">{funnel.overallConversionRate}%</strong>
            </span>
          </div>
        </div>

        {/* Funnel Progress Stepper */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {/* Step 1: Visitors */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
            <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
              <span>1. VISITORS</span>
              <Users className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <div className="font-display text-xl font-bold text-slate-900">
              {funnel.visitors.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400">100% of traffic</div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-slate-500 h-full w-full rounded-full" />
            </div>
          </div>

          {/* Step 2: Views */}
          <div className="rounded-xl border border-sky-100 bg-sky-50/40 p-4 space-y-2">
            <div className="text-[11px] font-mono text-sky-700 flex items-center justify-between">
              <span>2. VIEWS</span>
              <Activity className="h-3.5 w-3.5 text-sky-500" />
            </div>
            <div className="font-display text-xl font-bold text-sky-800">
              {funnel.productViews.toLocaleString()}
            </div>
            <div className="text-[11px] text-sky-600">
              {Math.round((funnel.productViews / funnel.visitors) * 100)}% reach
            </div>
            <div className="w-full bg-sky-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-sky-500 h-full rounded-full"
                style={{ width: `${Math.round((funnel.productViews / funnel.visitors) * 100)}%` }}
              />
            </div>
          </div>

          {/* Step 3: Add to Bag */}
          <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-4 space-y-2">
            <div className="text-[11px] font-mono text-purple-700 flex items-center justify-between">
              <span>3. ADD TO BAG</span>
              <ShoppingCart className="h-3.5 w-3.5 text-purple-500" />
            </div>
            <div className="font-display text-xl font-bold text-purple-800">
              {funnel.addToCart.toLocaleString()}
            </div>
            <div className="text-[11px] text-purple-600">
              {Math.round((funnel.addToCart / funnel.productViews) * 100)}% of views
            </div>
            <div className="w-full bg-purple-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full"
                style={{ width: `${Math.round((funnel.addToCart / funnel.visitors) * 100)}%` }}
              />
            </div>
          </div>

          {/* Step 4: Checkout Started */}
          <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4 space-y-2">
            <div className="text-[11px] font-mono text-amber-700 flex items-center justify-between">
              <span>4. CHECKOUT</span>
              <ArrowRight className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <div className="font-display text-xl font-bold text-amber-800">
              {funnel.checkoutStarted.toLocaleString()}
            </div>
            <div className="text-[11px] text-amber-600">
              {Math.round((funnel.checkoutStarted / funnel.addToCart) * 100)}% of carts
            </div>
            <div className="w-full bg-amber-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${Math.round((funnel.checkoutStarted / funnel.visitors) * 100)}%` }}
              />
            </div>
          </div>

          {/* Step 5: Payment Started */}
          <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-4 space-y-2">
            <div className="text-[11px] font-mono text-brand-800 flex items-center justify-between">
              <span>5. PAYMENT</span>
              <CreditCard className="h-3.5 w-3.5 text-brand-600" />
            </div>
            <div className="font-display text-xl font-bold text-brand-900">
              {funnel.paymentStarted.toLocaleString()}
            </div>
            <div className="text-[11px] text-brand-700">
              {Math.round((funnel.paymentStarted / funnel.checkoutStarted) * 100)}% initiated
            </div>
            <div className="w-full bg-brand-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-brand-500 h-full rounded-full"
                style={{ width: `${Math.round((funnel.paymentStarted / funnel.visitors) * 100)}%` }}
              />
            </div>
          </div>

          {/* Step 6: Order Paid */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
            <div className="text-[11px] font-mono text-emerald-700 flex items-center justify-between">
              <span>6. COMPLETED</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <div className="font-display text-xl font-bold text-emerald-800">
              {funnel.purchaseCompleted.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600">
              {Math.round((funnel.purchaseCompleted / funnel.paymentStarted) * 100)}% success
            </div>
            <div className="w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${Math.round((funnel.purchaseCompleted / funnel.visitors) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Revenue Distribution & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Split */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
          <div className="text-xs font-mono uppercase tracking-wider text-brand-600 font-semibold">
            DOMAIN PORTFOLIO
          </div>
          <h3 className="font-display text-base font-bold text-slate-900">
            Category Revenue Share
          </h3>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-semibold">Smart OLED Displays & Appliances</span>
                <span className="font-mono text-brand-700 font-bold">62% (₹24.1L)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-brand-500 to-amber-400 h-full w-[62%] rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-semibold">Solid Teak Luxury Furniture</span>
                <span className="font-mono text-purple-700 font-bold">38% (₹14.8L)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full w-[38%] rounded-full" />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
            <div className="flex justify-between">
              <span>Combined Average Order Value (AOV):</span>
              <strong className="text-slate-900 font-mono font-bold">₹1,84,500</strong>
            </div>
            <div className="flex justify-between">
              <span>Gross Fulfilled Margin:</span>
              <strong className="text-emerald-600 font-mono font-bold">31.4%</strong>
            </div>
          </div>
        </div>

        {/* Live Telemetry Event Stream */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-emerald-600 font-semibold flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>LIVE TELEMETRY STREAM</span>
              </div>
              <h3 className="font-display text-base font-bold text-slate-900">
                Recent Storefront User Actions
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Auto-buffered stream</span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {events.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No telemetry events streamed in this session. Events are automatically captured on user navigation, add to bag, and checkout.
              </div>
            ) : (
              events.map((ev, i) => (
                <div
                  key={ev.id || i}
                  className="rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="rounded bg-brand-50 border border-brand-200 px-2 py-0.5 text-[10px] font-mono text-brand-700 font-bold">
                      {ev.eventType}
                    </span>
                    <span className="text-slate-700 font-mono text-[11px]">
                      Session: {ev.sessionId ? ev.sessionId.substring(0, 16) : 'anon-session'}...
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(ev.timestamp).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
