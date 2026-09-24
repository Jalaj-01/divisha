'use client';

import React, { useState } from 'react';
import {
  Star,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Check,
  X,
  Filter
} from 'lucide-react';

interface ReviewItem {
  id: string;
  category: string;
  productName: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  createdAt: string;
}

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-01',
    category: 'Electronics',
    productName: 'Sony Bravia XR 65" Master Series OLED',
    customerName: 'Aarav Mehta',
    rating: 5,
    title: 'Superb picture quality and smooth delivery',
    comment:
      'The pure black contrast and picture quality are fantastic. The store team in Indore delivered and installed it perfectly with zero hassle.',
    verifiedPurchase: true,
    status: 'APPROVED',
    createdAt: '2026-09-22T16:00:00.000Z'
  },
  {
    id: 'rev-02',
    category: 'Furniture',
    productName: 'Royal Chesterfield Top-Grain Leather Sofa',
    customerName: 'Rhea Singhania',
    rating: 5,
    title: 'Solid teak frame and high-quality leather',
    comment:
      'The leather feels amazing and the cushions are very comfortable. Fits our living room perfectly. Great service by the team.',
    verifiedPurchase: true,
    status: 'APPROVED',
    createdAt: '2026-09-21T14:30:00.000Z'
  },
  {
    id: 'rev-03',
    category: 'Electronics',
    productName: 'Samsung 653L French Door Smart Refrigerator',
    customerName: 'Devendra Parekh',
    rating: 4,
    title: 'Large capacity fridge with quiet cooling',
    comment:
      'Large interior space and very quiet compressor. Delivery team in Ahmedabad unboxed and leveled it neatly.',
    verifiedPurchase: true,
    status: 'PENDING',
    createdAt: '2026-09-23T11:00:00.000Z'
  },
  {
    id: 'rev-04',
    category: 'Furniture',
    productName: 'Royal 8-Seater Solid Teak Dining Table',
    customerName: 'Manish Agarwal',
    rating: 5,
    title: 'Outstanding teak wood finish',
    comment:
      'Solid timber build with heavy chairs. Looks even better in person than in the pictures.',
    verifiedPurchase: true,
    status: 'APPROVED',
    createdAt: '2026-09-20T10:00:00.000Z'
  }
];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterProduct, setFilterProduct] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const handleUpdateStatus = (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const productOptions = Array.from(new Set(reviews.map((r) => r.productName)));

  const filtered = reviews.filter((r) => {
    const matchCategory = filterCategory === 'ALL' || r.category === filterCategory;
    const matchProduct = filterProduct === 'ALL' || r.productName === filterProduct;
    const matchStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchSearch =
      r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchProduct && matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-brand-700 border border-amber-200 shadow-sm">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
                Customer Product Reviews
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync Active
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Browse reviews submitted by buyers. Filter easily by category and product, and approve reviews to show on your store.
            </p>
          </div>
        </div>
      </div>

      {/* EXPLANATION OF PENDING APPROVAL */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 flex items-start gap-3.5">
        <HelpCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 space-y-1">
          <p className="font-bold text-sm text-blue-950">
            What does "New Review (Needs Approval)" mean?
          </p>
          <p className="text-blue-800 leading-relaxed">
            When a customer submits a review, it stays in <b>"Needs Approval"</b> so you can review it first. This protects your store from spam.
          </p>
          <p className="text-blue-800 leading-relaxed">
            Click <b>"Approve & Show on Store"</b> to display the review on the product page, or click <b>"Reject"</b> to hide it.
          </p>
        </div>
      </div>

      {/* Filter Bar with Category and Product Dropdowns */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white"
          >
            <option value="ALL">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
          </select>

          {/* Product Filter */}
          <select
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white max-w-[200px] truncate"
          >
            <option value="ALL">All Products</option>
            {productOptions.map((prod) => (
              <option key={prod} value={prod}>
                {prod}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white"
          >
            <option value="ALL">All Reviews</option>
            <option value="PENDING">New Reviews (Needs Approval)</option>
            <option value="APPROVED">Approved (Visible on Store)</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search review text or customer..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white"
          />
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
            No reviews found matching the selected category and product filters.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{item.productName}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    By <b>{item.customerName}</b> • {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>

                  {item.status === 'APPROVED' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-300">
                      <Check className="h-3 w-3" /> Live on Store
                    </span>
                  ) : item.status === 'PENDING' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-300">
                      Needs Approval
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800 border border-rose-300">
                      <X className="h-3 w-3" /> Rejected
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-900 text-xs">{item.title}</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  "{item.comment}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-1">
                {item.status !== 'REJECTED' && (
                  <button
                    onClick={() => handleUpdateStatus(item.id, 'REJECTED')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <X className="h-3 w-3" />
                    <span>Reject</span>
                  </button>
                )}

                {item.status !== 'APPROVED' && (
                  <button
                    onClick={() => handleUpdateStatus(item.id, 'APPROVED')}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Approve & Show on Store</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
