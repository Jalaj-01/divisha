'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Boxes,
  Search,
  Filter,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  History,
  TrendingUp,
  Layers,
  ArrowUpRight,
  X,
  FileSpreadsheet,
  Upload,
  Download,
  Check
} from 'lucide-react';
import { InventoryTransactionReason } from '@divisha/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface InventoryItem {
  productId: string;
  productName: string;
  productSku: string;
  variantId: string;
  variantTitle: string;
  variantSku: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

interface InventoryTransaction {
  id: string;
  variantId: string;
  previousStock: number;
  delta: number;
  newStock: number;
  reason: InventoryTransactionReason;
  referenceId?: string;
  adminId: string;
  notes?: string;
  createdAt: string;
}

interface BulkRow {
  sku: string;
  delta: number;
  notes: string;
  status?: 'pending' | 'success' | 'error';
  message?: string;
}

export default function AdminInventoryPage() {
  const [activeTab, setActiveTab] = useState<'balances' | 'transactions'>('balances');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [summary, setSummary] = useState<any>({
    totalSKUs: 0,
    totalUnitsOnHand: 0,
    totalUnitsReserved: 0,
    lowStockCount: 0,
    outOfStockCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

  // Single Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [deltaInput, setDeltaInput] = useState<number>(10);
  const [reasonInput, setReasonInput] = useState<InventoryTransactionReason>(InventoryTransactionReason.MANUAL_ADJUSTMENT);
  const [notesInput, setNotesInput] = useState('');
  const [submittingAdjustment, setSubmittingAdjustment] = useState(false);
  const [adjustMessage, setAdjustMessage] = useState<string | null>(null);

  // Bulk Upload Modal
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkResultMsg, setBulkResultMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [invRes, transRes, sumRes] = await Promise.all([
        fetch(`${API_BASE}/v1/inventory`),
        fetch(`${API_BASE}/v1/inventory/transactions`),
        fetch(`${API_BASE}/v1/inventory/summary`)
      ]);

      if (invRes.ok) {
        const json = await invRes.json();
        setInventory(json.data || json || []);
      }
      if (transRes.ok) {
        const json = await transRes.json();
        setTransactions(json.data || json || []);
      }
      if (sumRes.ok) {
        const json = await sumRes.json();
        setSummary(json.data || json || {});
      }
    } catch (e) {
      console.error('Failed to load inventory data', e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-sync polling every 4 seconds for live customer purchase updates
    const interval = setInterval(() => {
      fetchData(true);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Submit Single Stock Adjustment
  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariantId) return;
    setSubmittingAdjustment(true);
    setAdjustMessage(null);

    try {
      const res = await fetch(`${API_BASE}/v1/inventory/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: selectedVariantId,
          quantityDelta: Number(deltaInput),
          reason: reasonInput,
          notes: notesInput || 'Manual warehouse stock adjustment',
          adminId: 'admin-lead'
        })
      });

      const json = await res.json();
      if (res.ok) {
        setAdjustMessage('Stock adjustment saved successfully!');
        setNotesInput('');
        await fetchData(true);
        setTimeout(() => setShowAdjustModal(false), 1000);
      } else {
        setAdjustMessage(`Error: ${json.message || 'Adjustment failed'}`);
      }
    } catch (e: any) {
      setAdjustMessage(`Network error: ${e.message}`);
    } finally {
      setSubmittingAdjustment(false);
    }
  };

  // Download CSV Template
  const handleDownloadCsvTemplate = () => {
    const header = 'SKU,QuantityDelta,Notes\n';
    const sampleRows = inventory.slice(0, 10).map((i) => `${i.variantSku},10,Bulk restock batch`).join('\n');
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(header + sampleRows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `inventory_bulk_template_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle CSV File Upload
  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        parseCsv(text);
      }
    };
    reader.readAsText(file);
  };

  // Parse CSV string into BulkRows
  const parseCsv = (text: string) => {
    setBulkCsvText(text);
    const lines = text.trim().split('\n');
    const parsed: BulkRow[] = [];

    lines.forEach((line, index) => {
      if (index === 0 && line.toLowerCase().includes('sku')) return; // skip header
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 2 && parts[0]) {
        const sku = parts[0];
        const delta = parseInt(parts[1], 10);
        const notes = parts[2] || 'Bulk stock update';
        if (!isNaN(delta)) {
          parsed.push({ sku, delta, notes, status: 'pending' });
        }
      }
    });

    setBulkRows(parsed);
    setBulkResultMsg(parsed.length > 0 ? `Loaded ${parsed.length} rows. Ready to upload.` : 'No valid rows found.');
  };

  // Process Bulk Stock Adjustment
  const handleProcessBulkStock = async () => {
    if (bulkRows.length === 0) return;
    setBulkProcessing(true);
    let successCount = 0;
    let failCount = 0;

    const updatedRows = [...bulkRows];

    for (let i = 0; i < updatedRows.length; i++) {
      const row = updatedRows[i];
      // Match SKU to variant
      const match = inventory.find(
        (inv) =>
          inv.variantSku.toLowerCase() === row.sku.toLowerCase() ||
          inv.productSku.toLowerCase() === row.sku.toLowerCase()
      );

      if (!match) {
        row.status = 'error';
        row.message = 'SKU not found in catalog';
        failCount++;
        continue;
      }

      try {
        const res = await fetch(`${API_BASE}/v1/inventory/adjust`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            variantId: match.variantId,
            quantityDelta: row.delta,
            reason: InventoryTransactionReason.PURCHASE,
            notes: row.notes,
            adminId: 'admin-bulk-upload'
          })
        });

        if (res.ok) {
          row.status = 'success';
          row.message = 'Updated successfully';
          successCount++;
        } else {
          row.status = 'error';
          row.message = 'Failed to update';
          failCount++;
        }
      } catch (err: any) {
        row.status = 'error';
        row.message = err.message || 'Network error';
        failCount++;
      }
    }

    setBulkRows(updatedRows);
    setBulkProcessing(false);
    setBulkResultMsg(`Bulk upload complete: ${successCount} updated successfully, ${failCount} failed.`);
    await fetchData(true);
  };

  // Filter balances
  const filteredBalances = inventory.filter((item) => {
    if (statusFilter === 'LOW_STOCK' && (!item.isLowStock || item.isOutOfStock)) return false;
    if (statusFilter === 'OUT_OF_STOCK' && !item.isOutOfStock) return false;
    if (statusFilter === 'IN_STOCK' && (item.isLowStock || item.isOutOfStock)) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.productName.toLowerCase().includes(q) ||
        item.variantTitle.toLowerCase().includes(q) ||
        item.variantSku.toLowerCase().includes(q) ||
        item.productSku.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-700 font-bold">
              INVENTORY CONTROL
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync (Auto-refreshes every 4s)
            </span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Inventory & Stock Management
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            Real-time stock tracking, automatic live sync when orders are placed, and instant bulk stock upload.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* BULK STOCK UPLOAD BUTTON */}
          <button
            onClick={() => {
              setShowBulkModal(true);
              setBulkResultMsg(null);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-brand-300 bg-brand-50 px-4 py-2 text-xs font-bold text-brand-900 hover:bg-brand-100 transition-all shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-brand-700" />
            <span>Bulk Stock Upload</span>
          </button>

          <button
            onClick={() => {
              if (inventory.length > 0 && !selectedVariantId) {
                setSelectedVariantId(inventory[0].variantId);
              }
              setShowAdjustModal(true);
            }}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-sm hover:scale-[1.02] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Adjust Stock</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-bold uppercase">
            <span>Managed SKUs</span>
            <Boxes className="h-4 w-4 text-brand-600" />
          </div>
          <div className="mt-2 font-display text-2xl font-extrabold text-slate-900 font-mono">{summary.totalSKUs || inventory.length}</div>
          <p className="mt-1 text-[11px] text-slate-500">Total variants in catalog</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-bold uppercase">
            <span>Units in Stock</span>
            <Layers className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 font-display text-2xl font-extrabold text-emerald-700 font-mono">
            {summary.totalUnitsOnHand || 0}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Live available quantity</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-bold uppercase">
            <span>Units Reserved</span>
            <History className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 font-display text-2xl font-extrabold text-amber-700 font-mono">
            {summary.totalUnitsReserved || 0}
          </div>
          <p className="mt-1 text-[11px] text-amber-800">Pending checkout completion</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-bold uppercase">
            <span>Low Stock Alerts</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 font-display text-2xl font-extrabold text-rose-700 font-mono">
            {summary.lowStockCount || 0}
          </div>
          <p className="mt-1 text-[11px] text-rose-800">Requires restocking</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('balances')}
          className={`pb-3 font-display text-sm tracking-wide transition-colors ${
            activeTab === 'balances'
              ? 'border-b-2 border-brand-600 text-brand-900 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Current Stock Balances ({inventory.length})
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`pb-3 font-display text-sm tracking-wide transition-colors ${
            activeTab === 'transactions'
              ? 'border-b-2 border-brand-600 text-brand-900 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Stock History & Audit Log ({transactions.length})
        </button>
      </div>

      {/* BALANCES TAB */}
      {activeTab === 'balances' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by product, variant, or SKU..."
                className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:outline-none transition-all"
              />
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              {(['ALL', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                    statusFilter === st
                      ? 'bg-brand-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st === 'IN_STOCK' ? 'In Stock' : st === 'LOW_STOCK' ? 'Low Stock' : 'Out of Stock'}
                </button>
              ))}
            </div>
          </div>

          {/* Balances Table */}
          <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 font-mono uppercase text-slate-500 text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Product & Variant</th>
                    <th className="px-6 py-3.5">SKU Code</th>
                    <th className="px-6 py-3.5 text-right">In Stock</th>
                    <th className="px-6 py-3.5 text-right">Reserved</th>
                    <th className="px-6 py-3.5 text-right">Available</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-500 font-mono">
                        Loading inventory...
                      </td>
                    </tr>
                  ) : filteredBalances.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-500 font-mono">
                        No inventory items found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredBalances.map((item) => (
                      <tr key={item.variantId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-900">{item.productName}</p>
                            <span className="text-[11px] text-slate-500">{item.variantTitle}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 font-mono text-slate-700">
                          {item.variantSku}
                        </td>

                        <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">
                          {item.currentStock}
                        </td>

                        <td className="px-6 py-4 text-right font-mono text-amber-700">
                          {item.reservedStock}
                        </td>

                        <td className="px-6 py-4 text-right font-mono font-bold text-emerald-700">
                          {item.availableStock}
                        </td>

                        <td className="px-6 py-4">
                          {item.isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-semibold text-rose-800 border border-rose-300">
                              <XCircle className="h-3 w-3" /> Out of Stock
                            </span>
                          ) : item.isLowStock ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-300">
                              <AlertTriangle className="h-3 w-3" /> Low Stock ({item.availableStock})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="h-3 w-3" /> Healthy
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedVariantId(item.variantId);
                              setShowAdjustModal(true);
                            }}
                            className="rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-900 hover:bg-brand-100 transition-colors cursor-pointer"
                          >
                            Adjust
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TRANSACTIONS TAB */}
      {activeTab === 'transactions' && (
        <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-mono uppercase text-slate-500 text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Variant ID</th>
                  <th className="px-6 py-3.5">Reason</th>
                  <th className="px-6 py-3.5 text-right">Previous</th>
                  <th className="px-6 py-3.5 text-right">Change</th>
                  <th className="px-6 py-3.5 text-right">New Stock</th>
                  <th className="px-6 py-3.5">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-slate-500 text-[11px]">
                      {new Date(tx.createdAt).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-700">
                      {tx.variantId}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="font-semibold text-slate-800">{tx.reason}</span>
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono text-slate-500">
                      {tx.previousStock}
                    </td>
                    <td className={`px-6 py-3.5 text-right font-mono font-bold ${tx.delta > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {tx.delta > 0 ? `+${tx.delta}` : tx.delta}
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono font-bold text-slate-900">
                      {tx.newStock}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 max-w-xs truncate">
                      {tx.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BULK STOCK UPLOAD MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-brand-600" />
                  Bulk Stock Upload
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update stock quantities for multiple SKUs at once via CSV file or paste.
                </p>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Actions Header */}
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div>
                  <p className="font-bold text-amber-950">1. Download Template or Upload CSV</p>
                  <p className="text-[11px] text-amber-800">
                    Template pre-filled with all current catalog SKUs.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadCsvTemplate}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-950 font-bold hover:bg-amber-100 transition-all cursor-pointer shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download CSV Template</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500 text-slate-950 font-bold hover:bg-brand-400 transition-all cursor-pointer shadow-sm"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Choose CSV File</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleCsvFileUpload}
                  />
                </div>
              </div>

              {/* Paste CSV Text */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Or Paste CSV Data (Format: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">SKU,QuantityDelta,Notes</code>):
                </label>
                <textarea
                  rows={4}
                  value={bulkCsvText}
                  onChange={(e) => parseCsv(e.target.value)}
                  placeholder="SNY-XR77-OLED-STD,25,Warehouse restock batch&#10;SAM-65QN90D-STD,15,New shipment received"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              {/* Parsed Rows Preview */}
              {bulkRows.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800">
                      Parsed Rows to Update ({bulkRows.length})
                    </span>
                    {bulkResultMsg && (
                      <span className="text-[11px] font-semibold text-brand-900">
                        {bulkResultMsg}
                      </span>
                    )}
                  </div>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 font-mono text-[10px] uppercase text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2">SKU</th>
                          <th className="px-3 py-2 text-right">Delta</th>
                          <th className="px-3 py-2">Notes</th>
                          <th className="px-3 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {bulkRows.map((r, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-3 py-2 font-mono font-semibold text-slate-900">{r.sku}</td>
                            <td className={`px-3 py-2 font-mono text-right font-bold ${r.delta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {r.delta >= 0 ? `+${r.delta}` : r.delta}
                            </td>
                            <td className="px-3 py-2 text-slate-600 truncate max-w-xs">{r.notes}</td>
                            <td className="px-3 py-2">
                              {r.status === 'success' ? (
                                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                  <Check className="h-3 w-3" /> Updated
                                </span>
                              ) : r.status === 'error' ? (
                                <span className="text-rose-600 font-semibold">{r.message}</span>
                              ) : (
                                <span className="text-slate-500">Ready</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleProcessBulkStock}
                  disabled={bulkProcessing || bulkRows.length === 0}
                  className="rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-6 py-2.5 font-bold text-slate-950 shadow-sm hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
                >
                  {bulkProcessing ? 'Processing Updates...' : `Commit Bulk Stock (${bulkRows.length} Items)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE ADJUSTMENT MODAL */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="h-5 w-5 text-brand-600" />
                Adjust Stock Quantity
              </h3>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="rounded-full p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {adjustMessage && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs font-mono text-amber-900 mt-4">
                {adjustMessage}
              </div>
            )}

            <form onSubmit={handleAdjustStock} className="space-y-4 text-xs font-mono mt-4">
              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Select Product SKU</label>
                <select
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                >
                  {inventory.map((i) => (
                    <option key={i.variantId} value={i.variantId}>
                      {i.productName} ({i.variantTitle}) — SKU: {i.variantSku} [Current Stock: {i.currentStock}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">Quantity Delta (+/-)</label>
                  <input
                    type="number"
                    required
                    value={deltaInput}
                    onChange={(e) => setDeltaInput(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                    placeholder="e.g. 15 or -5"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Use negative values for reductions</p>
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">Reason</label>
                  <select
                    value={reasonInput}
                    onChange={(e) => setReasonInput(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 uppercase text-[11px] focus:bg-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value={InventoryTransactionReason.PURCHASE}>Purchase (New Shipment)</option>
                    <option value={InventoryTransactionReason.RETURN}>Return (Customer Restock)</option>
                    <option value={InventoryTransactionReason.DAMAGE}>Damage (Write-off)</option>
                    <option value={InventoryTransactionReason.MANUAL_ADJUSTMENT}>Manual Adjustment</option>
                    <option value={InventoryTransactionReason.CORRECTION}>Count Correction</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Note / Reason Details</label>
                <textarea
                  rows={2}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-900 font-sans text-xs focus:bg-white focus:border-brand-500 focus:outline-none"
                  placeholder="Details about this stock update..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdjustment}
                  className="rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-5 py-2.5 font-bold text-slate-950 shadow-sm hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
                >
                  {submittingAdjustment ? 'Saving...' : 'Update Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
