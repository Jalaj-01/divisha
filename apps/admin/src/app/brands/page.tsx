'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  ExternalLink,
  Shield,
  Trash2,
  Edit,
  X,
  Search,
  Package,
  CheckCircle2
} from 'lucide-react';
import { BrandDTO } from '@divisha/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<BrandDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    name: '',
    slug: '',
    logoUrl: '',
    websiteUrl: '',
    description: '',
    isPartner: true
  });

  const loadBrands = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/v1/brands`);
      const json = await res.json();
      if (json.success && json.data) {
        setBrands(json.data);
      }
    } catch (e) {
      console.error('Failed to load brands', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/v1/brands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (json.success && json.data) {
        setBrands((prev) => [...prev, json.data]);
        setShowAddModal(false);
        setForm({
          name: '',
          slug: '',
          logoUrl: '',
          websiteUrl: '',
          description: '',
          isPartner: true
        });
      }
    } catch (e) {
      console.error('Failed to create brand', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (!confirm('Are you sure you want to remove this brand partner?')) return;
    try {
      const res = await fetch(`${API_BASE}/v1/brands/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setBrands((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete brand', e);
    }
  };

  const filtered = brands.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const partnerCount = brands.filter((b) => b.isPartner).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-brand-700 font-bold">
            AUTHORIZED OEM NETWORK
          </span>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Award className="h-6 w-6 text-brand-600" />
            Brand Partners & Manufacturers
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Official dealership agreements, global prestige electronics manufacturers, and bespoke architectural woodwork partners.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-sm hover:scale-[1.02] transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Brand Partner</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Total Brands</p>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{brands.length}</p>
          <span className="text-[11px] text-slate-500">Integrated in catalog</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Authorized Partners</p>
          <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">{partnerCount}</p>
          <span className="text-[11px] text-slate-500">Flagship Onsite Warranty</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Catalog SKUs</p>
          <p className="text-2xl font-bold font-mono text-brand-700 mt-1">
            {brands.reduce((sum, b) => sum + (b.productCount || 0), 0)} Linked
          </p>
          <span className="text-[11px] text-slate-500">Distributed across partners</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm flex items-center justify-between">
        <div className="relative w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brands by name..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 pl-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none transition-all"
          />
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
        </div>

        <span className="font-mono text-xs text-slate-600 font-semibold">
          {filtered.length} Brand Profiles
        </span>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-500 font-mono">
            Loading brand partners...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-500 font-mono">
            No brand partners found.
          </div>
        ) : (
          filtered.map((brand) => (
            <div
              key={brand.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 p-2">
                    {brand.logoUrl ? (
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="font-display font-black text-brand-700 text-lg">
                        {brand.name[0]}
                      </span>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="h-3 w-3" /> Flagship Partner
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{brand.name}</h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                  {brand.description || 'Exclusive audio-visual & interior manufacturing partner.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-700 font-semibold">
                  {brand.productCount || 0} Products
                </span>

                <div className="flex items-center gap-2">
                  {brand.websiteUrl && (
                    <a
                      href={brand.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      title="Visit Official Website"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => handleDeleteBrand(brand.id)}
                    className="p-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                    title="Remove Brand"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE BRAND MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="h-5 w-5 text-brand-600" />
                Add Brand Partner
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBrand} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Brand Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Bang & Olufsen, Sony, Herman Miller"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">URL Slug (Optional)</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="bang-olufsen"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-mono focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Brand Logo URL</label>
                <input
                  type="url"
                  value={form.logoUrl}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  placeholder="https://upload.wikimedia.org/.../logo.png"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Website</label>
                <input
                  type="url"
                  value={form.websiteUrl}
                  onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                  placeholder="https://www.sony.co.in"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief heritage, warranty terms, or corporate positioning..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="brandPartnerCheck"
                  checked={form.isPartner}
                  onChange={(e) => setForm({ ...form, isPartner: e.target.checked })}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="brandPartnerCheck" className="text-slate-700 font-medium">
                  Authorized Flagship Partner (Display badge on product pages)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-6 py-2.5 font-bold text-slate-950 shadow-sm hover:scale-[1.02] cursor-pointer"
                >
                  {saving ? 'Registering...' : 'Register Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
