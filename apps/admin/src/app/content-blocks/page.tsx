'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Save,
  X,
  Sparkles,
  Box,
  LayoutGrid,
  FileText
} from 'lucide-react';
import { ContentBlockDTO, ContentBlockType } from '@divisha/types';

const API_BASE = 'http://localhost:4000/v1';

const BLOCK_TYPE_LABELS: Record<ContentBlockType, { label: string; icon: any; color: string }> = {
  [ContentBlockType.HERO_SLIDER]: { label: 'Hero Carousel', icon: Sparkles, color: 'text-brand-700 bg-brand-50 border-brand-200' },
  [ContentBlockType.THREE_D_SHOWCASE]: { label: 'Interactive 3D Stage', icon: Box, color: 'text-sky-700 bg-sky-50 border-sky-200' },
  [ContentBlockType.CATEGORY_GRID]: { label: 'Category Grid', icon: LayoutGrid, color: 'text-purple-700 bg-purple-50 border-purple-200' },
  [ContentBlockType.FEATURED_PRODUCTS]: { label: 'Curated Collection', icon: Layers, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  [ContentBlockType.VALUE_PROPOSITIONS]: { label: 'Trust & Guarantees', icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  [ContentBlockType.PROMOTIONAL_BANNER]: { label: 'Promo Banner Strip', icon: Layers, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  [ContentBlockType.ROOM_INSPIRATION]: { label: 'Room Lookbook', icon: Box, color: 'text-pink-700 bg-pink-50 border-pink-200' },
  [ContentBlockType.TESTIMONIALS]: { label: 'VIP Testimonials', icon: Sparkles, color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  [ContentBlockType.BRAND_CAROUSEL]: { label: 'Brand Alliance Strip', icon: LayoutGrid, color: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
  [ContentBlockType.FAQ_ACCORDION]: { label: 'FAQ Accordion', icon: FileText, color: 'text-slate-700 bg-slate-100 border-slate-200' },
  [ContentBlockType.RICH_TEXT]: { label: 'Rich Editorial', icon: FileText, color: 'text-rose-700 bg-rose-50 border-rose-200' }
};

export default function ContentBlocksPage() {
  const [blocks, setBlocks] = useState<ContentBlockDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [type, setType] = useState<ContentBlockType>(ContentBlockType.FEATURED_PRODUCTS);
  const [isActive, setIsActive] = useState(true);

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/cms/homepage-blocks`);
      const json = await res.json();
      setBlocks(json.data || json || []);
    } catch (err) {
      console.error('Failed to fetch content blocks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  const handleToggleStatus = async (block: ContentBlockDTO) => {
    try {
      await fetch(`${API_BASE}/cms/homepage-blocks/${block.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !block.isActive })
      });
      fetchBlocks();
    } catch (err) {
      console.error('Failed to toggle block status:', err);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;
    setBlocks(newBlocks);

    try {
      await fetch(`${API_BASE}/cms/homepage-blocks/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: newBlocks.map((b) => b.id) })
      });
    } catch (err) {
      console.error('Failed to save block reordering:', err);
      fetchBlocks();
    }
  };

  const handleDeleteBlock = async (id: string) => {
    if (!confirm('Are you sure you want to remove this layout block?')) return;
    try {
      await fetch(`${API_BASE}/cms/homepage-blocks/${id}`, { method: 'DELETE' });
      fetchBlocks();
    } catch (err) {
      console.error('Failed to delete content block:', err);
    }
  };

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setSaving(true);
      await fetch(`${API_BASE}/cms/homepage-blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: 'HOME',
          type,
          title,
          subtitle: subtitle || undefined,
          isActive,
          sortOrder: blocks.length,
          content: {}
        })
      });
      setShowModal(false);
      setTitle('');
      setSubtitle('');
      fetchBlocks();
    } catch (err) {
      console.error('Failed to create content block:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-500" />
            <span className="text-xs font-mono uppercase tracking-widest text-brand-600 font-semibold">
              DYNAMIC LAYOUT ENGINE
            </span>
          </div>
          <h1 className="mt-1 font-display text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Homepage Content Blocks
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Control the visual sequence, featured collection slots, 3D stages, and trust guarantees of the storefront.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-md shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add Layout Block</span>
        </button>
      </div>

      {/* Blocks List */}
      {loading ? (
        <div className="p-12 text-center text-sm font-mono text-slate-500 bg-white rounded-2xl border border-slate-200">
          Loading layout blocks...
        </div>
      ) : blocks.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
          No homepage blocks configured. Click &quot;Add Layout Block&quot; to configure one.
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block, index) => {
            const meta = BLOCK_TYPE_LABELS[block.type] || {
              label: block.type,
              icon: Layers,
              color: 'text-slate-700 bg-slate-100 border-slate-200'
            };
            const IconComponent = meta.icon;

            return (
              <div
                key={block.id}
                className="group rounded-2xl border border-slate-200/90 bg-white p-4 md:p-5 flex items-center justify-between gap-4 hover:border-brand-500/40 transition-all shadow-sm"
              >
                {/* Left: Reorder Steppers & Slot */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded-md border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === blocks.length - 1}
                      className="p-1 rounded-md border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>

                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 font-mono text-xs font-bold text-slate-700">
                    {index + 1}
                  </span>
                </div>

                {/* Center: Block Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${meta.color}`}
                    >
                      <IconComponent className="h-3.5 w-3.5" />
                      <span>{meta.label}</span>
                    </span>
                    <span className="font-display text-sm md:text-base font-bold text-slate-900 truncate">
                      {block.title || 'Untitled Section'}
                    </span>
                  </div>
                  {block.subtitle && (
                    <p className="mt-1 text-xs text-slate-500 line-clamp-1 font-light">
                      {block.subtitle}
                    </p>
                  )}
                </div>

                {/* Right: Status Switch & Delete */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleStatus(block)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur transition-all ${
                      block.isActive
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                        : 'bg-slate-100 border border-slate-200 text-slate-600'
                    }`}
                  >
                    {block.isActive ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Hidden</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteBlock(block.id)}
                    className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                    title="Remove Block"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Content Block Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-brand-600" />
                <h3 className="font-display text-lg font-bold text-slate-900">Add Homepage Section</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBlock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Section Type *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ContentBlockType)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none shadow-sm"
                >
                  <option value={ContentBlockType.FEATURED_PRODUCTS}>Featured Collection Carousel</option>
                  <option value={ContentBlockType.HERO_SLIDER}>Hero Spotlight Carousel</option>
                  <option value={ContentBlockType.THREE_D_SHOWCASE}>Interactive 3D Stage</option>
                  <option value={ContentBlockType.CATEGORY_GRID}>Curated Categories Grid</option>
                  <option value={ContentBlockType.VALUE_PROPOSITIONS}>Trust Guarantees & White-Glove</option>
                  <option value={ContentBlockType.ROOM_INSPIRATION}>Room Design Lookbook</option>
                  <option value={ContentBlockType.BRAND_CAROUSEL}>Authorized Brand Alliances</option>
                  <option value={ContentBlockType.TESTIMONIALS}>VIP Client Testimonials</option>
                  <option value={ContentBlockType.RICH_TEXT}>Rich Editorial / Craft Story</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Section Headline *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Atelier Living Room Suites"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Sub-Headline
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Hand-selected for luxury residential estates"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none shadow-sm"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="activeBlockCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="activeBlockCheck" className="text-sm font-medium text-slate-700">
                  Enable and show on storefront immediately
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-md shadow-brand-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Adding...' : 'Add Section'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
