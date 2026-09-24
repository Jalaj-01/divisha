'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Edit3,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Trash2,
  Save,
  X,
  Sparkles,
  Calendar,
  Globe
} from 'lucide-react';
import { PageDTO } from '@divisha/types';

const API_BASE = 'http://localhost:4000/v1';

export default function PagesManagementPage() {
  const [pages, setPages] = useState<PageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [previewTab, setPreviewTab] = useState<'edit' | 'preview'>('edit');

  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/cms/pages`);
      const json = await res.json();
      setPages(json.data || json || []);
    } catch (err) {
      console.error('Failed to fetch pages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const openCreateModal = () => {
    setEditingPageId(null);
    setTitle('');
    setSlug('');
    setContent('# New Content Page\n\nEnter luxurious markdown copy here...');
    setMetaTitle('');
    setMetaDescription('');
    setIsPublished(true);
    setPreviewTab('edit');
    setShowModal(true);
  };

  const openEditModal = (page: PageDTO) => {
    setEditingPageId(page.id);
    setTitle(page.title);
    setSlug(page.slug);
    setContent(page.content);
    setMetaTitle(page.metaTitle || '');
    setMetaDescription(page.metaDescription || '');
    setIsPublished(page.isPublished);
    setPreviewTab('edit');
    setShowModal(true);
  };

  const handleTogglePublish = async (page: PageDTO) => {
    try {
      await fetch(`${API_BASE}/cms/pages/${page.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !page.isPublished })
      });
      fetchPages();
    } catch (err) {
      console.error('Failed to toggle page status:', err);
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;
    try {
      await fetch(`${API_BASE}/cms/pages/${id}`, { method: 'DELETE' });
      fetchPages();
    } catch (err) {
      console.error('Failed to delete page:', err);
    }
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) return;

    try {
      setSaving(true);
      const payload = {
        title,
        slug,
        content,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        isPublished
      };

      if (editingPageId) {
        await fetch(`${API_BASE}/cms/pages/${editingPageId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch(`${API_BASE}/cms/pages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      setShowModal(false);
      fetchPages();
    } catch (err) {
      console.error('Failed to save page:', err);
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
              INFORMATIONAL & EDITORIAL PAGES
            </span>
          </div>
          <h1 className="mt-1 font-display text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Pages & Editorial Stories
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Publish and edit luxury brand stories, warranty policies, teak craftsmanship articles, and concierge guidelines.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-md shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Content Page</span>
        </button>
      </div>

      {/* Pages Table */}
      {loading ? (
        <div className="p-12 text-center text-sm font-mono text-slate-500 bg-white rounded-2xl border border-slate-200">
          Loading editorial pages...
        </div>
      ) : pages.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
          No content pages created yet.
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50/80 font-mono text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-6">Page Title & Slug</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Last Updated</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-display font-bold text-slate-900 text-base">
                      {page.title}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs font-mono text-brand-600">
                      <span>/{page.slug}</span>
                      <a
                        href={`http://localhost:3000/${page.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-slate-600"
                        title="View Live Page on Storefront"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleTogglePublish(page)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur transition-all ${
                        page.isPublished
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                          : 'bg-slate-100 border border-slate-200 text-slate-600'
                      }`}
                    >
                      {page.isPublished ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Draft</span>
                        </>
                      )}
                    </button>
                  </td>

                  <td className="py-4 px-6 text-xs text-slate-500 font-mono">
                    {new Date(page.updatedAt || Date.now()).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(page)}
                        className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:text-brand-600 hover:bg-brand-50 hover:border-brand-200 transition-colors"
                        title="Edit Page"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePage(page.id)}
                        className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                        title="Delete Page"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Editor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-600" />
                <h3 className="font-display text-lg font-bold text-slate-900">
                  {editingPageId ? 'Edit Editorial Page' : 'Create New Editorial Page'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePage} className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Page Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Artisanal Joinery & Timber Care"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. timber-care"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none shadow-sm font-mono text-xs"
                  />
                </div>
              </div>

              {/* Markdown Editor / Preview Tabs */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Content Body (Markdown Format) *
                  </label>
                  <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setPreviewTab('edit')}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        previewTab === 'edit'
                          ? 'bg-white text-slate-900 font-bold shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Markdown Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('preview')}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        previewTab === 'preview'
                          ? 'bg-white text-slate-900 font-bold shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Preview HTML
                    </button>
                  </div>
                </div>

                {previewTab === 'edit' ? (
                  <textarea
                    rows={12}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 font-mono text-xs leading-relaxed text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
                    placeholder="# Heading&#10;&#10;Paragraph text here..."
                  />
                ) : (
                  <div className="min-h-[288px] max-h-[360px] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-5 prose prose-slate text-xs">
                    <div className="whitespace-pre-wrap font-sans leading-relaxed text-slate-800">
                      {content}
                    </div>
                  </div>
                )}
              </div>

              {/* SEO Meta Fields */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-brand-600">
                  <Globe className="h-3.5 w-3.5" />
                  <span>SEO METADATA SETTINGS</span>
                </div>
                <div>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Meta Title tag..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none shadow-sm"
                  />
                </div>
                <div>
                  <textarea
                    rows={2}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Meta Description snippet for Google search previews..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none shadow-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="pagePublishCheck"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="pagePublishCheck" className="text-sm font-medium text-slate-700">
                  Publish page to live storefront
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
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
                  <span>{saving ? 'Saving...' : 'Save Page'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
