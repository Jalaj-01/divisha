'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Image as ImageIcon,
  Plus,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Sparkles,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { BannerDTO } from '@divisha/types';

const API_BASE = 'http://localhost:4000/v1';

export default function BannersPage() {
  const [banners, setBanners] = useState<BannerDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('DIVISHA SIGNATURE 2026');
  const [ctaText, setCtaText] = useState('Explore Masterpieces');
  const [ctaLink, setCtaLink] = useState('/shop');
  const [desktopImageUrl, setDesktopImageUrl] = useState(
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=85'
  );
  const [mobileImageUrl, setMobileImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/cms/banners`);
      const json = await res.json();
      setBanners(json.data || json || []);
    } catch (err) {
      console.error('Failed to fetch banners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleToggleStatus = async (banner: BannerDTO) => {
    try {
      await fetch(`${API_BASE}/cms/banners/${banner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !banner.isActive })
      });
      fetchBanners();
    } catch (err) {
      console.error('Failed to toggle banner status:', err);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to remove this promotional banner?')) return;
    try {
      await fetch(`${API_BASE}/cms/banners/${id}`, { method: 'DELETE' });
      fetchBanners();
    } catch (err) {
      console.error('Failed to delete banner:', err);
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desktopImageUrl.trim()) return;

    try {
      setSaving(true);
      await fetch(`${API_BASE}/cms/banners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subtitle,
          badge,
          ctaText,
          ctaLink,
          desktopImageUrl,
          mobileImageUrl: mobileImageUrl || undefined,
          isActive,
          sortOrder: banners.length
        })
      });
      setShowModal(false);
      resetForm();
      fetchBanners();
    } catch (err) {
      console.error('Failed to create banner:', err);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setBadge('DIVISHA SIGNATURE 2026');
    setCtaText('Explore Masterpieces');
    setCtaLink('/shop');
    setDesktopImageUrl(
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=85'
    );
    setMobileImageUrl('');
    setIsActive(true);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-500" />
            <span className="text-xs font-mono uppercase tracking-widest text-brand-700 font-bold">
              CONTENT MANAGEMENT SYSTEM
            </span>
          </div>
          <h1 className="mt-1 font-display text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            Promotional Hero Banners
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Schedule and configure luxury storefront hero carousels and promotional campaign spotlights.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Hero Banner</span>
        </button>
      </div>

      {/* Banners Grid */}
      {loading ? (
        <div className="p-12 text-center text-sm font-mono text-slate-500">
          Loading promotional banners...
        </div>
      ) : banners.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-600 shadow-sm">
          No promotional banners configured yet. Click &quot;New Hero Banner&quot; above to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className="group relative rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Media Preview Box */}
              <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                <Image
                  src={banner.desktopImageUrl}
                  alt={banner.title}
                  fill
                  unoptimized={true}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

                {/* Badges on preview */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="rounded-full bg-slate-900/90 border border-slate-700/80 px-2.5 py-0.5 text-[10px] font-mono text-brand-300 font-bold">
                    Slot #{index + 1}
                  </span>
                  {banner.badge && (
                    <span className="rounded-full bg-amber-400/90 border border-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-slate-950">
                      {banner.badge}
                    </span>
                  )}
                </div>

                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => handleToggleStatus(banner)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold backdrop-blur transition-all ${
                      banner.isActive
                        ? 'bg-emerald-500/90 text-white shadow-sm'
                        : 'bg-slate-900/80 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {banner.isActive ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Inactive</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Title overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-display text-lg font-bold text-white drop-shadow-md">
                    {banner.title}
                  </h3>
                  {banner.subtitle && (
                    <p className="mt-1 text-xs text-slate-200 line-clamp-1 font-light">
                      {banner.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Details & Actions Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-4 text-slate-600">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <ExternalLink className="h-3.5 w-3.5 text-brand-700" />
                    <span>CTA: {banner.ctaLink || '/shop'}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteBanner(banner.id)}
                    className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-300 transition-colors"
                    title="Remove Banner"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Banner Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-600" />
                <h3 className="font-display text-lg font-bold text-slate-900">Create Hero Banner</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBanner} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                  Banner Headline *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Living Room Showcase"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                  Sub-Headline
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Handcrafted Solid Teakwood & Sony Bravia OLED Displays"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                    Badge Pill
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. LIMITED EDITION"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="e.g. Explore Collection"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                  Destination URL
                </label>
                <input
                  type="text"
                  value={ctaLink}
                  onChange={(e) => setCtaLink(e.target.value)}
                  placeholder="/shop?category=oled-tvs"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                  Desktop Image URL (High-Resolution) *
                </label>
                <input
                  type="url"
                  required
                  value={desktopImageUrl}
                  onChange={(e) => setDesktopImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none font-mono text-xs"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="activeCheck" className="text-sm font-medium text-slate-700">
                  Publish to storefront immediately
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-full border border-slate-300 px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-sm hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Creating...' : 'Save Banner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
