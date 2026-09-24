'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@divisha/database';
import { ProductCard } from '@/components/ProductCard';
import { Search, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { ProductCategoryType, ProductDTO, CategoryDTO } from '@divisha/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ShopPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');

  const [liveProducts, setLiveProducts] = useState<ProductDTO[]>(() => db.products);
  const [liveCategories, setLiveCategories] = useState<CategoryDTO[]>(() => db.categories);

  useEffect(() => {
    const fetchLiveCatalog = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`${API_BASE}/v1/products`).then((r) => (r.ok ? r.json() : null)),
          fetch(`${API_BASE}/v1/categories`).then((r) => (r.ok ? r.json() : null))
        ]);
        if (prodRes?.data && Array.isArray(prodRes.data)) {
          setLiveProducts(prodRes.data);
        }
        if (catRes?.data && Array.isArray(catRes.data)) {
          setLiveCategories(catRes.data);
        }
      } catch {
        // Fallback silently to initialized in-memory database
      }
    };
    fetchLiveCatalog();
  }, []);

  const categories = liveCategories;

  // Filter products
  let products = liveProducts.filter((p) => p.isActive && !p.isArchived);

  if (selectedCategory !== 'all') {
    products = products.filter((p) => p.categoryId === selectedCategory || p.category?.slug === selectedCategory);
  }
  if (selectedType !== 'all') {
    products = products.filter((p) => p.type === selectedType);
  }
  if (search.trim()) {
    const q = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand?.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  // Sort
  if (sortBy === 'price_asc') {
    products.sort((a, b) => (a.salePrice || a.basePrice) - (b.salePrice || b.basePrice));
  } else if (sortBy === 'price_desc') {
    products.sort((a, b) => (b.salePrice || b.basePrice) - (a.salePrice || a.basePrice));
  } else if (sortBy === 'rating') {
    products.sort((a, b) => b.ratingAverage - a.ratingAverage);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Page Header */}
      <div className="mb-8 text-center sm:text-left">
        <span className="text-xs font-mono uppercase tracking-widest text-brand-600 font-bold">
          CURATED FLAGSHIPS
        </span>
        <h1 className="mt-1 font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Curated Masterpieces
        </h1>
        <p className="mt-2 text-sm text-slate-600 font-normal max-w-xl leading-relaxed">
          Discover television displays engineered for pure visual precision, and artisanal teak furnishings sculpted for enduring comfort.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between rounded-2xl bg-white border border-slate-200/90 p-3.5 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by model, brand, timber species, or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Domain Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Domains (Electronics & Furniture)</option>
            <option value={ProductCategoryType.ELECTRONICS}>Electronics Only</option>
            <option value={ProductCategoryType.FURNITURE}>Bespoke Furniture Only</option>
          </select>

          {/* Sort Control */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-brand-500 font-mono"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`rounded-full px-4 py-2 font-semibold whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-brand-500 text-slate-950 font-bold shadow-sm'
              : 'border border-slate-200 bg-white text-slate-700 hover:border-brand-500 hover:text-slate-900'
          }`}
        >
          All Collections ({db.products.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`rounded-full px-4 py-2 font-semibold whitespace-nowrap transition-all ${
              selectedCategory === c.id
                ? 'bg-brand-500 text-slate-950 font-bold shadow-sm'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-brand-500 hover:text-slate-900'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
          <p className="text-slate-500 text-sm">No masterpieces match your current filter parameters.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
              setSelectedType('all');
            }}
            className="mt-4 rounded-full bg-brand-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-brand-400"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
