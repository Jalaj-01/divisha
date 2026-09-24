'use client';

import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Search,
  CheckCircle2,
  Copy,
  Check,
  Pause,
  Play,
  Edit3,
  Trash2,
  X,
  AlertCircle
} from 'lucide-react';

export interface CouponItem {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageCount: number;
  usageLimit: number;
  validUntil: string;
  isActive: boolean;
}

const INITIAL_COUPONS: CouponItem[] = [
  {
    id: 'coup-01',
    code: 'DIVISHA10',
    description: 'Festive privilege concession for high-end televisions & solid teak dining suites',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderValue: 50000,
    maxDiscount: 25000,
    usageCount: 42,
    usageLimit: 500,
    validUntil: '2026-12-31T23:59:59.000Z',
    isActive: true
  },
  {
    id: 'coup-02',
    code: 'FESTIVE5000',
    description: 'Instant ₹5,000 architectural voucher for premium furniture sets',
    discountType: 'FIXED',
    discountValue: 5000,
    minOrderValue: 75000,
    usageCount: 19,
    usageLimit: 250,
    validUntil: '2026-11-15T23:59:59.000Z',
    isActive: true
  },
  {
    id: 'coup-03',
    code: 'BESPOKE15',
    description: 'Architectural firm and interior designer bulk privilege code',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minOrderValue: 150000,
    maxDiscount: 50000,
    usageCount: 8,
    usageLimit: 50,
    validUntil: '2026-10-31T23:59:59.000Z',
    isActive: true
  }
];

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>(INITIAL_COUPONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formCode, setFormCode] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formType, setFormType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [formValue, setFormValue] = useState('');
  const [formMinOrder, setFormMinOrder] = useState('50000');
  const [formMaxDiscount, setFormMaxDiscount] = useState('25000');
  const [formLimit, setFormLimit] = useState('100');

  // Edit Modal State
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);

  // Toggle Pause / Resume
  const handleTogglePause = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  // Delete Coupon
  const handleDeleteCoupon = (coupon: CouponItem) => {
    if (confirm(`Are you sure you want to permanently delete coupon "${coupon.code}"?`)) {
      setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (coupon: CouponItem) => {
    setEditingCoupon({ ...coupon });
  };

  // Save Edited Coupon
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;

    setCoupons((prev) =>
      prev.map((c) => (c.id === editingCoupon.id ? editingCoupon : c))
    );
    setEditingCoupon(null);
  };

  // Copy Code to Clipboard
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Create New Coupon
  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formValue) return;

    const item: CouponItem = {
      id: `coup-${Date.now().toString().slice(-4)}`,
      code: formCode.toUpperCase().trim(),
      description: formDesc || 'Promotional Concession',
      discountType: formType,
      discountValue: parseFloat(formValue),
      minOrderValue: parseFloat(formMinOrder) || 0,
      maxDiscount: formMaxDiscount ? parseFloat(formMaxDiscount) : undefined,
      usageCount: 0,
      usageLimit: parseInt(formLimit, 10) || 100,
      validUntil: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString(),
      isActive: true
    };

    setCoupons([item, ...coupons]);
    setShowCreateModal(false);
    setFormCode('');
    setFormDesc('');
    setFormValue('');
  };

  const filtered = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-brand-600 border border-brand-500/20 shadow-sm">
              <Tag className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                Coupons & Privilege Codes
                <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[11px] font-mono font-bold text-amber-900">
                  Authoritative Cart Engine
                </span>
              </h1>
              <p className="text-sm text-slate-600">
                Manage promotional discount codes, edit limits, pause/resume active privileges, and configure cart qualifications.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-sm hover:scale-[1.02] transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>+ Create Privilege Code</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search coupon code or description..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
          />
        </div>
        <div className="text-xs font-mono text-slate-500">
          Showing {filtered.length} of {coupons.length} vouchers
        </div>
      </div>

      {/* Grid of Coupons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl border p-5 transition-all bg-white shadow-sm flex flex-col justify-between ${
              item.isActive
                ? 'border-slate-200 hover:border-brand-500/50 hover:shadow-md'
                : 'border-slate-200 bg-slate-50/60 opacity-75'
            }`}
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold tracking-wide text-brand-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
                      {item.code}
                    </span>
                    <button
                      onClick={() => handleCopy(item.code)}
                      className="text-slate-400 hover:text-slate-900 p-1 transition-colors"
                      title="Copy code"
                    >
                      {copiedCode === item.code ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {item.description}
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase ${
                    item.isActive
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {item.isActive ? 'ACTIVE' : 'PAUSED'}
                </span>
              </div>

              {/* Concession Specs */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-700">
                  <span className="text-slate-500">Concession Value:</span>
                  <span className="font-bold text-slate-900">
                    {item.discountType === 'PERCENTAGE' ? `${item.discountValue}% OFF` : `₹${item.discountValue.toLocaleString('en-IN')} OFF`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span className="text-slate-500">Min Order:</span>
                  <span className="text-slate-900 font-semibold">₹{item.minOrderValue.toLocaleString('en-IN')}</span>
                </div>
                {item.maxDiscount && (
                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-500">Max Discount:</span>
                    <span className="text-slate-900 font-semibold">₹{item.maxDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-700">
                  <span className="text-slate-500">Redemptions:</span>
                  <span className="text-slate-900 font-semibold">
                    {item.usageCount} / {item.usageLimit}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Bar (Pause, Edit, Delete) */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              {/* Pause / Resume Button */}
              <button
                onClick={() => handleTogglePause(item.id)}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all ${
                  item.isActive
                    ? 'border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                }`}
                title={item.isActive ? 'Pause Coupon' : 'Resume Coupon'}
              >
                {item.isActive ? (
                  <>
                    <Pause className="h-3.5 w-3.5 text-amber-700" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 text-emerald-700" />
                    <span>Resume</span>
                  </>
                )}
              </button>

              {/* Edit Button */}
              <button
                onClick={() => handleOpenEdit(item)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                title="Edit Coupon Parameters"
              >
                <Edit3 className="h-3.5 w-3.5 text-brand-600" />
                <span>Edit</span>
              </button>

              {/* Delete Button */}
              <button
                onClick={() => handleDeleteCoupon(item)}
                className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition-colors"
                title="Permanently Delete Coupon"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Tag className="h-5 w-5 text-brand-600" />
                Create Privilege Coupon Code
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="text-xs font-mono font-semibold text-slate-700 block mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LUXURY2026"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 uppercase font-mono focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-semibold text-slate-700 block mb-1">Discount Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (₹)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono font-semibold text-slate-700 block mb-1">
                    {formType === 'PERCENTAGE' ? 'Discount %' : 'Amount (₹)'}
                  </label>
                  <input
                    type="number"
                    required
                    placeholder={formType === 'PERCENTAGE' ? 'e.g. 10' : 'e.g. 5000'}
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 font-mono focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono font-semibold text-slate-700 block mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={formMinOrder}
                    onChange={(e) => setFormMinOrder(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 font-mono focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono font-semibold text-slate-700 block mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    value={formMaxDiscount}
                    onChange={(e) => setFormMaxDiscount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 font-mono focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono font-semibold text-slate-700 block mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={formLimit}
                    onChange={(e) => setFormLimit(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 font-mono focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono font-semibold text-slate-700 block mb-1">Voucher Description</label>
                <input
                  type="text"
                  placeholder="e.g. Architectural living suite privilege"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-full border border-slate-300 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 py-2.5 text-xs font-bold text-slate-950 hover:scale-105 transition-all shadow-sm"
                >
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-brand-600" />
                Edit Coupon: {editingCoupon.code}
              </h3>
              <button
                onClick={() => setEditingCoupon(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-xs font-mono font-semibold text-slate-700 block mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={editingCoupon.code}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 uppercase font-mono focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-semibold text-slate-700 block mb-1">Discount Type</label>
                <select
                  value={editingCoupon.discountType}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, discountType: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (₹)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono font-semibold text-slate-700 block mb-1">
                    {editingCoupon.discountType === 'PERCENTAGE' ? 'Discount %' : 'Amount (₹)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={editingCoupon.discountValue}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, discountValue: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 font-mono focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono font-semibold text-slate-700 block mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={editingCoupon.minOrderValue}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, minOrderValue: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 font-mono focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono font-semibold text-slate-700 block mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    value={editingCoupon.maxDiscount || ''}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, maxDiscount: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 font-mono focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono font-semibold text-slate-700 block mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={editingCoupon.usageLimit}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, usageLimit: parseInt(e.target.value, 10) || 100 })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 font-mono focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono font-semibold text-slate-700 block mb-1">Voucher Description</label>
                <input
                  type="text"
                  value={editingCoupon.description}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="couponActiveCheck"
                  checked={editingCoupon.isActive}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="couponActiveCheck" className="text-xs font-mono text-slate-700">
                  Coupon Status: <strong className={editingCoupon.isActive ? 'text-emerald-700' : 'text-amber-700'}>{editingCoupon.isActive ? 'ACTIVE (Can be redeemed)' : 'PAUSED (Cannot be redeemed)'}</strong>
                </label>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCoupon(null)}
                  className="flex-1 rounded-full border border-slate-300 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 py-2.5 text-xs font-bold text-slate-950 hover:scale-105 transition-all shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
