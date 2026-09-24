'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Package,
  Plus,
  Search,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Tag,
  Boxes,
  X,
  Tv,
  Armchair,
  Check,
  Upload,
  Star,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { ProductDTO, CategoryDTO, BrandDTO, ProductCategoryType } from '@divisha/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface UploadedImage {
  id?: string;
  url: string;
  isPrimary: boolean;
  alt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [brands, setBrands] = useState<BrandDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Modal State - Create
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createImages, setCreateImages] = useState<UploadedImage[]>([
    {
      url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
      isPrimary: true,
      alt: 'Product Image'
    }
  ]);
  const [form, setForm] = useState({
    name: '',
    sku: '',
    barcode: '',
    type: ProductCategoryType.ELECTRONICS,
    categoryId: '',
    brandId: '',
    basePrice: 0,
    salePrice: 0,
    taxRate: 18,
    description: '',
    shortDescription: '',
    warrantyInfo: '',
    isFeatured: false,
    variantTitle: 'Standard Edition',
    variantStock: 10
  });

  // Modal State - Edit
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);
  const [editImages, setEditImages] = useState<UploadedImage[]>([]);
  const [editForm, setEditForm] = useState({
    name: '',
    basePrice: 0,
    salePrice: 0,
    description: '',
    warrantyInfo: ''
  });
  const [editSaving, setEditSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const loadCatalog = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [prodsRes, catsRes, brandsRes] = await Promise.all([
        fetch(`${API_BASE}/v1/products/admin/list?limit=50`).then((r) => r.json()),
        fetch(`${API_BASE}/v1/categories`).then((r) => r.json()),
        fetch(`${API_BASE}/v1/brands`).then((r) => r.json())
      ]);

      if (prodsRes.success && prodsRes.data) {
        setProducts(prodsRes.data.items || prodsRes.data || []);
      }
      if (catsRes.success && catsRes.data) {
        setCategories(catsRes.data);
        if (!form.categoryId && catsRes.data[0]) {
          setForm((prev) => ({ ...prev, categoryId: catsRes.data[0].id }));
        }
      }
      if (brandsRes.success && brandsRes.data) {
        setBrands(brandsRes.data);
        if (!form.brandId && brandsRes.data[0]) {
          setForm((prev) => ({ ...prev, brandId: brandsRes.data[0].id }));
        }
      }
    } catch (e) {
      console.error('Failed to load catalog data', e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
    // Auto-sync polling every 4 seconds for live inventory and purchases
    const interval = setInterval(() => {
      loadCatalog(true);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handle direct file uploads for Create Modal
  const handleImageFiles = (files: FileList | null, isEdit = false) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        if (url) {
          if (isEdit) {
            setEditImages((prev) => {
              const hasPrimary = prev.some((img) => img.isPrimary);
              return [...prev, { url, isPrimary: !hasPrimary, alt: file.name }];
            });
          } else {
            setCreateImages((prev) => {
              const hasPrimary = prev.some((img) => img.isPrimary);
              return [...prev, { url, isPrimary: !hasPrimary, alt: file.name }];
            });
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Set primary image
  const setPrimaryImage = (index: number, isEdit = false) => {
    if (isEdit) {
      setEditImages((prev) =>
        prev.map((img, i) => ({
          ...img,
          isPrimary: i === index
        }))
      );
    } else {
      setCreateImages((prev) =>
        prev.map((img, i) => ({
          ...img,
          isPrimary: i === index
        }))
      );
    }
  };

  // Remove image
  const removeImage = (index: number, isEdit = false) => {
    if (isEdit) {
      setEditImages((prev) => {
        const next = prev.filter((_, i) => i !== index);
        if (next.length > 0 && !next.some((img) => img.isPrimary)) {
          next[0].isPrimary = true;
        }
        return next;
      });
    } else {
      setCreateImages((prev) => {
        const next = prev.filter((_, i) => i !== index);
        if (next.length > 0 && !next.some((img) => img.isPrimary)) {
          next[0].isPrimary = true;
        }
        return next;
      });
    }
  };

  // Handle Create Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        sku: form.sku,
        barcode: form.barcode || form.sku,
        type: form.type,
        categoryId: form.categoryId || categories[0]?.id,
        brandId: form.brandId || brands[0]?.id,
        basePrice: Number(form.basePrice),
        salePrice: form.salePrice ? Number(form.salePrice) : undefined,
        taxRate: Number(form.taxRate),
        description: form.description,
        shortDescription: form.shortDescription || form.name,
        warrantyInfo: form.warrantyInfo || '1 Year Comprehensive Warranty',
        isFeatured: form.isFeatured,
        has3DModel: false,
        images: createImages.map((img, idx) => ({
          url: img.url,
          isPrimary: img.isPrimary,
          alt: img.alt || form.name,
          displayOrder: idx
        })),
        variants: [
          {
            title: form.variantTitle || 'Standard Edition',
            sku: `${form.sku}-STD`,
            priceDelta: 0,
            stock: Number(form.variantStock) || 10
          }
        ]
      };

      const res = await fetch(`${API_BASE}/v1/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (json.success && json.data) {
        setProducts([json.data, ...products]);
        setShowAddModal(false);
        setCreateImages([
          {
            url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
            isPrimary: true,
            alt: 'Product Image'
          }
        ]);
        setForm({
          name: '',
          sku: '',
          barcode: '',
          type: ProductCategoryType.ELECTRONICS,
          categoryId: categories[0]?.id || '',
          brandId: brands[0]?.id || '',
          basePrice: 0,
          salePrice: 0,
          taxRate: 18,
          description: '',
          shortDescription: '',
          warrantyInfo: '',
          isFeatured: false,
          variantTitle: 'Standard Edition',
          variantStock: 10
        });
      }
    } catch (e) {
      console.error('Failed to create product', e);
    } finally {
      setSaving(false);
    }
  };

  // Open Edit Product Modal
  const openEditModal = (prod: ProductDTO) => {
    setEditingProduct(prod);
    setEditForm({
      name: prod.name,
      basePrice: prod.basePrice,
      salePrice: prod.salePrice || 0,
      description: prod.description || '',
      warrantyInfo: prod.warrantyInfo || ''
    });
    setEditImages(
      (prod.images || []).map((img) => ({
        id: img.id,
        url: img.url,
        isPrimary: !!img.isPrimary,
        alt: img.altText || prod.name
      }))
    );
  };

  // Save Edit Product & Pictures
  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setEditSaving(true);
    try {
      const payload = {
        name: editForm.name,
        basePrice: Number(editForm.basePrice),
        salePrice: editForm.salePrice ? Number(editForm.salePrice) : undefined,
        description: editForm.description,
        warrantyInfo: editForm.warrantyInfo,
        images: editImages.map((img, idx) => ({
          id: img.id,
          url: img.url,
          isPrimary: img.isPrimary,
          altText: img.alt || editForm.name,
          sortOrder: idx
        }))
      };

      const res = await fetch(`${API_BASE}/v1/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success && json.data) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? json.data : p))
        );
        setEditingProduct(null);
      }
    } catch (e) {
      console.error('Failed to update product', e);
    } finally {
      setEditSaving(false);
    }
  };

  // Toggle status (Show / Hide from Store)
  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/v1/products/${id}/toggle-status`, {
        method: 'PATCH'
      });
      const json = await res.json();
      if (json.success && json.data) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isActive: json.data.isActive } : p))
        );
      }
    } catch (e) {
      console.error('Failed to toggle status', e);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to remove this product from the store?')) return;
    try {
      const res = await fetch(`${API_BASE}/v1/products/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      console.error('Failed to remove product', e);
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesCat = !selectedCategory || p.categoryId === selectedCategory;
    const matchesBrand = !selectedBrand || p.brandId === selectedBrand;
    const matchesType = selectedType === 'ALL' || p.type === selectedType;

    return matchesSearch && matchesCat && matchesBrand && matchesType;
  });

  const totalSKUs = products.reduce((sum, p) => sum + (p.variants?.length || 1), 0);
  const totalValue = products.reduce(
    (sum, p) => sum + p.basePrice * (p.variants?.reduce((vsum, v) => vsum + v.stock, 0) || 10),
    0
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-700 font-bold">
              CATALOG MANAGEMENT
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync Active
            </span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Package className="h-6 w-6 text-brand-600" />
            Products & Catalog
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Manage your store products, upload pictures, set prices, and control storefront visibility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-sm hover:scale-[1.02] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Total Products</p>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{products.length}</p>
          <span className="text-[11px] text-emerald-700 font-medium">In catalog</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Active SKUs</p>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{totalSKUs} SKUs</p>
          <span className="text-[11px] text-slate-500">Tracked in inventory</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Inventory Value</p>
          <p className="text-2xl font-bold font-mono text-brand-700 mt-1">
            ₹{totalValue.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Current stock value</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Live on Store</p>
          <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {products.filter((p) => p.isActive).length} Visible
          </p>
          <span className="text-[11px] text-slate-500 font-medium">
            {products.filter((p) => !p.isActive).length} Hidden
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, SKU, or brand..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 pl-9 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none transition-all"
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
        </div>

        <div className="flex items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Brand Filter */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <div className="flex rounded-xl bg-slate-100 border border-slate-200 p-0.5">
            {['ALL', 'ELECTRONICS', 'FURNITURE'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                  selectedType === t
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'ALL' ? 'All' : t === 'ELECTRONICS' ? 'Electronics' : 'Furniture'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-mono uppercase text-slate-500 text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Product & SKU</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Brand</th>
                <th className="px-6 py-3.5">Price</th>
                <th className="px-6 py-3.5">Stock</th>
                <th className="px-6 py-3.5">Storefront Visibility</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500 font-mono">
                    Loading products...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500 font-mono">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => {
                  const primaryImage =
                    prod.images?.find((img) => img.isPrimary)?.url ||
                    prod.images?.[0]?.url ||
                    'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80';

                  const totalStock = prod.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={primaryImage}
                            alt={prod.name}
                            className="h-12 w-12 rounded-xl object-cover border border-slate-200 bg-slate-50"
                          />
                          <div className="max-w-xs">
                            <p className="font-semibold text-slate-900 line-clamp-1">{prod.name}</p>
                            <span className="font-mono text-[10px] text-slate-500 block mt-0.5">
                              SKU: {prod.sku}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {prod.images?.length || 1} image{prod.images?.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                            {prod.type === ProductCategoryType.ELECTRONICS ? (
                              <Tv className="h-3 w-3 text-cyan-600" />
                            ) : (
                              <Armchair className="h-3 w-3 text-amber-600" />
                            )}
                            {prod.type}
                          </span>
                          <p className="text-[11px] text-slate-500">{prod.category?.name || 'Uncategorized'}</p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-700">
                          {prod.brand?.name || 'Divisha Signature'}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-mono">
                        <p className="font-bold text-slate-900">
                          ₹{(prod.salePrice || prod.basePrice).toLocaleString('en-IN')}
                        </p>
                        {prod.salePrice && (
                          <p className="text-[10px] text-slate-400 line-through">
                            ₹{prod.basePrice.toLocaleString('en-IN')}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-mono text-xs">
                          <span className="text-slate-900 font-semibold">
                            {prod.variants?.length || 1} SKU{prod.variants?.length !== 1 ? 's' : ''}
                          </span>
                          <p className={`text-[10px] font-semibold ${totalStock > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {totalStock > 0 ? `${totalStock} in stock` : 'Out of Stock'}
                          </p>
                        </div>
                      </td>

                      {/* Storefront Hide/Unhide Button */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(prod.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer shadow-sm ${
                            prod.isActive
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
                          }`}
                          title={prod.isActive ? 'Click to Hide from Storefront' : 'Click to Show on Storefront'}
                        >
                          {prod.isActive ? (
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
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 rounded-xl border border-brand-200 bg-brand-50 text-brand-900 hover:bg-brand-100 transition-colors cursor-pointer"
                            title="Edit Product & Pictures"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>

                          <a
                            href={`http://localhost:3000/product/${prod.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Preview on Storefront"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </a>

                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                            title="Delete Product"
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

      {/* CREATE PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="h-5 w-5 text-brand-600" />
                Add New Product
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Product Type Toggle */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Category Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: ProductCategoryType.ELECTRONICS })}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 font-semibold transition-all ${
                      form.type === ProductCategoryType.ELECTRONICS
                        ? 'border-brand-500 bg-amber-50 text-brand-900 ring-1 ring-brand-500 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Tv className="h-4 w-4" />
                    <span>Electronics & Appliances</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: ProductCategoryType.FURNITURE })}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 font-semibold transition-all ${
                      form.type === ProductCategoryType.FURNITURE
                        ? 'border-brand-500 bg-amber-50 text-brand-900 ring-1 ring-brand-500 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Armchair className="h-4 w-4" />
                    <span>Furniture & Living</span>
                  </button>
                </div>
              </div>

              {/* Title & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Sony Bravia 77 Master Series OLED"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product SKU</label>
                  <input
                    type="text"
                    required
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="SNY-XR77-OLED"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-mono focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Category & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand</label>
                  <select
                    value={form.brandId}
                    onChange={(e) => setForm({ ...form, brandId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Regular Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={form.basePrice || ''}
                    onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
                    placeholder="249990"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-mono focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Offer Price (₹, optional)</label>
                  <input
                    type="number"
                    value={form.salePrice || ''}
                    onChange={(e) => setForm({ ...form, salePrice: Number(e.target.value) })}
                    placeholder="219990"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-mono focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GST Tax Rate (%)</label>
                  <input
                    type="number"
                    value={form.taxRate}
                    onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-mono focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Enter product details, specifications, and warranty info..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Initial Variant Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Variant Name</label>
                  <input
                    type="text"
                    value={form.variantTitle}
                    onChange={(e) => setForm({ ...form, variantTitle: e.target.value })}
                    placeholder="e.g. Standard Model"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Stock (Units)</label>
                  <input
                    type="number"
                    value={form.variantStock}
                    onChange={(e) => setForm({ ...form, variantStock: Number(e.target.value) })}
                    placeholder="10"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-mono focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* DIRECT IMAGE UPLOAD & PRIMARY SELECTOR */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block font-bold text-slate-900">Product Pictures</label>
                    <p className="text-[11px] text-slate-500">
                      Upload pictures directly from your computer. Select one as the Primary image.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500 text-slate-950 font-bold hover:bg-brand-400 transition-all cursor-pointer text-xs"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Images</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImageFiles(e.target.files, false)}
                  />
                </div>

                {/* Uploaded Images List */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {createImages.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative rounded-xl border p-2 bg-white flex flex-col items-center group ${
                        img.isPrimary ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`Preview ${idx}`}
                        className="h-24 w-full object-cover rounded-lg"
                      />
                      <div className="flex items-center justify-between w-full mt-2 gap-1">
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(idx, false)}
                          className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                            img.isPrimary
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <Star className={`h-2.5 w-2.5 ${img.isPrimary ? 'fill-amber-500 text-amber-500' : ''}`} />
                          {img.isPrimary ? 'Primary' : 'Set Primary'}
                        </button>

                        <button
                          type="button"
                          onClick={() => removeImage(idx, false)}
                          className="text-rose-500 hover:text-rose-700 p-1 text-[11px]"
                          title="Remove image"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checkbox */}
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Feature on Homepage Banner</span>
                </label>
              </div>

              {/* Submit */}
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
                  className="rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-6 py-2.5 font-bold text-slate-950 shadow-sm hover:scale-[1.02] transition-all cursor-pointer"
                >
                  {saving ? 'Creating Product...' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT & PICTURES MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit className="h-5 w-5 text-brand-600" />
                Edit Product & Pictures
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editForm.basePrice}
                    onChange={(e) => setEditForm({ ...editForm, basePrice: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-mono focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Offer Price (₹)</label>
                  <input
                    type="number"
                    value={editForm.salePrice || ''}
                    onChange={(e) => setEditForm({ ...editForm, salePrice: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-mono focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* DIRECT IMAGE UPLOADER FOR EDIT MODAL */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block font-bold text-slate-900">Product Pictures</label>
                    <p className="text-[11px] text-slate-500">
                      Upload new pictures or change which image is Primary.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500 text-slate-950 font-bold hover:bg-brand-400 transition-all cursor-pointer text-xs"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Picture</span>
                  </button>
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImageFiles(e.target.files, true)}
                  />
                </div>

                {/* Edit Images Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {editImages.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative rounded-xl border p-2 bg-white flex flex-col items-center ${
                        img.isPrimary ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`Preview ${idx}`}
                        className="h-24 w-full object-cover rounded-lg"
                      />
                      <div className="flex items-center justify-between w-full mt-2 gap-1">
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(idx, true)}
                          className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                            img.isPrimary
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <Star className={`h-2.5 w-2.5 ${img.isPrimary ? 'fill-amber-500 text-amber-500' : ''}`} />
                          {img.isPrimary ? 'Primary' : 'Set Primary'}
                        </button>

                        <button
                          type="button"
                          onClick={() => removeImage(idx, true)}
                          className="text-rose-500 hover:text-rose-700 p-1 text-[11px]"
                          title="Remove image"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-6 py-2.5 font-bold text-slate-950 shadow-sm hover:scale-[1.02] transition-all cursor-pointer"
                >
                  {editSaving ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
