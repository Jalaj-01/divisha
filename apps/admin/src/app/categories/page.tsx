'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Plus,
  Tv,
  Armchair,
  Edit,
  Trash2,
  X,
  Search,
  FolderTree,
  Eye,
  EyeOff,
  Upload,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { CategoryDTO, ProductCategoryType } from '@divisha/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  // Add Form
  const [form, setForm] = useState({
    name: '',
    slug: '',
    type: ProductCategoryType.ELECTRONICS,
    parentId: '',
    description: '',
    imageUrl: '',
    sortOrder: 1
  });

  // Edit Category Modal
  const [editingCategory, setEditingCategory] = useState<CategoryDTO | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    slug: '',
    type: ProductCategoryType.ELECTRONICS,
    description: '',
    imageUrl: ''
  });
  const [editSaving, setEditSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const loadCategories = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/v1/categories`);
      const json = await res.json();
      if (json.success && json.data) {
        setCategories(json.data);
      }
    } catch (e) {
      console.error('Failed to load categories', e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    // Auto-sync polling every 4 seconds
    const interval = setInterval(() => {
      loadCategories(true);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handle direct file upload for Add modal
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const url = uploadEvent.target?.result as string;
      if (url) {
        if (isEdit) {
          setEditForm((prev) => ({ ...prev, imageUrl: url }));
        } else {
          setForm((prev) => ({ ...prev, imageUrl: url }));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Create Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug || undefined,
        type: form.type,
        parentId: form.parentId || null,
        description: form.description,
        imageUrl: form.imageUrl || undefined,
        sortOrder: Number(form.sortOrder) || categories.length + 1,
        isActive: true
      };

      const res = await fetch(`${API_BASE}/v1/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCategories((prev) => [...prev, json.data]);
        setShowAddModal(false);
        setForm({
          name: '',
          slug: '',
          type: ProductCategoryType.ELECTRONICS,
          parentId: '',
          description: '',
          imageUrl: '',
          sortOrder: categories.length + 2
        });
      }
    } catch (e) {
      console.error('Failed to create category', e);
    } finally {
      setSaving(false);
    }
  };

  // Open Edit Category
  const openEditModal = (cat: CategoryDTO) => {
    setEditingCategory(cat);
    setEditForm({
      name: cat.name,
      slug: cat.slug,
      type: cat.type,
      description: cat.description || '',
      imageUrl: cat.imageUrl || ''
    });
  };

  // Save Edit Category
  const handleSaveEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setEditSaving(true);
    try {
      const res = await fetch(`${API_BASE}/v1/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? json.data : c))
        );
        setEditingCategory(null);
      }
    } catch (e) {
      console.error('Failed to update category', e);
    } finally {
      setEditSaving(false);
    }
  };

  // Toggle Category Storefront Visibility
  const handleToggleStatus = async (cat: CategoryDTO) => {
    const newStatus = cat.isActive === false ? true : false;
    try {
      const res = await fetch(`${API_BASE}/v1/categories/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, isActive: newStatus } : c))
        );
      }
    } catch (e) {
      console.error('Failed to toggle category status', e);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to remove this category?')) return;
    try {
      const res = await fetch(`${API_BASE}/v1/categories/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete category', e);
    }
  };

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase())
  );

  const electronicsCount = categories.filter((c) => c.type === ProductCategoryType.ELECTRONICS).length;
  const furnitureCount = categories.filter((c) => c.type === ProductCategoryType.FURNITURE).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-700 font-bold">
              CATEGORY MANAGEMENT
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync Active
            </span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Layers className="h-6 w-6 text-brand-600" />
            Store Categories
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Manage your categories, upload pictures, and easily show or hide categories from the storefront.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-sm hover:scale-[1.02] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Total Categories</p>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{categories.length}</p>
          <span className="text-[11px] text-slate-500">In catalog</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Electronics</p>
          <p className="text-2xl font-bold font-mono text-cyan-700 mt-1">{electronicsCount}</p>
          <span className="text-[11px] text-slate-500">TVs, Refrigerators, ACs</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Furniture & Living</p>
          <p className="text-2xl font-bold font-mono text-amber-700 mt-1">{furnitureCount}</p>
          <span className="text-[11px] text-slate-500">Sofas, Teak Beds, Dining</span>
        </div>
      </div>

      {/* Categories Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="relative w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories by name, slug, domain..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 pl-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none transition-all"
            />
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          </div>

          <span className="font-mono text-xs text-slate-600 font-semibold">
            {filtered.length} Categories
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-mono uppercase text-slate-500 text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Category Title & Picture</th>
                <th className="px-6 py-3.5">URL Slug</th>
                <th className="px-6 py-3.5">Domain</th>
                <th className="px-6 py-3.5">Description</th>
                <th className="px-6 py-3.5">Storefront Visibility</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-mono">
                    Loading categories...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-mono">
                    No categories found.
                  </td>
                </tr>
              ) : (
                filtered.map((cat) => {
                  const isVisible = cat.isActive !== false;
                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {cat.imageUrl ? (
                            <img
                              src={cat.imageUrl}
                              alt={cat.name}
                              className="h-11 w-11 rounded-xl object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-brand-700">
                              <FolderTree className="h-5 w-5" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900">{cat.name}</p>
                            <span className="font-mono text-[10px] text-slate-400">Order #{cat.sortOrder}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono text-slate-700">
                        /{cat.slug}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-800">
                          {cat.type === ProductCategoryType.ELECTRONICS ? (
                            <Tv className="h-3 w-3 text-cyan-600" />
                          ) : (
                            <Armchair className="h-3 w-3 text-amber-600" />
                          )}
                          {cat.type}
                        </span>
                      </td>

                      <td className="px-6 py-4 max-w-xs text-slate-600 truncate">
                        {cat.description || '—'}
                      </td>

                      {/* Storefront Hide / Unhide Button */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(cat)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer shadow-sm ${
                            isVisible
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
                          }`}
                          title={isVisible ? 'Click to Hide from Storefront' : 'Click to Show on Storefront'}
                        >
                          {isVisible ? (
                            <>
                              <Eye className="h-3.5 w-3.5 text-emerald-700" />
                              <span>Visible (Show)</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3.5 w-3.5 text-slate-500" />
                              <span>Hidden (Hide)</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="p-1.5 rounded-xl border border-brand-200 bg-brand-50 text-brand-900 hover:bg-brand-100 transition-colors cursor-pointer"
                            title="Edit Category & Picture"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE CATEGORY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="h-5 w-5 text-brand-600" />
                Add Store Category
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Domain</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: ProductCategoryType.ELECTRONICS })}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 font-semibold transition-all ${
                      form.type === ProductCategoryType.ELECTRONICS
                        ? 'border-brand-500 bg-amber-50 text-brand-900 ring-1 ring-brand-500 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Tv className="h-4 w-4" />
                    <span>Electronics</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: ProductCategoryType.FURNITURE })}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 font-semibold transition-all ${
                      form.type === ProductCategoryType.FURNITURE
                        ? 'border-brand-500 bg-amber-50 text-brand-900 ring-1 ring-brand-500 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Armchair className="h-4 w-4" />
                    <span>Furniture</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Smart Refrigerators"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">URL Slug (Optional)</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="smart-refrigerators"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-mono focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description of the category..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Direct Image Upload */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-slate-700">Category Picture</label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-500 text-slate-950 font-bold hover:bg-brand-400 transition-all text-xs cursor-pointer"
                  >
                    <Upload className="h-3 w-3" />
                    <span>Upload Image</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageFile(e, false)}
                  />
                </div>

                {form.imageUrl && (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 h-24 bg-white">
                    <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, imageUrl: '' })}
                      className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 hover:bg-black"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-6 py-2.5 font-bold text-slate-950 shadow-sm hover:scale-[1.02] cursor-pointer"
                >
                  {saving ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit className="h-5 w-5 text-brand-600" />
                Edit Category & Picture
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCategory} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Direct Image Upload for Edit */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-slate-700">Category Picture</label>
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-500 text-slate-950 font-bold hover:bg-brand-400 transition-all text-xs cursor-pointer"
                  >
                    <Upload className="h-3 w-3" />
                    <span>Upload New Image</span>
                  </button>
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageFile(e, true)}
                  />
                </div>

                {editForm.imageUrl && (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 h-28 bg-white">
                    <img src={editForm.imageUrl} alt="Category" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, imageUrl: '' })}
                      className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 hover:bg-black"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-6 py-2.5 font-bold text-slate-950 shadow-sm hover:scale-[1.02] cursor-pointer"
                >
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
