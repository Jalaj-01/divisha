'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Trash2,
  ShieldCheck,
  Truck,
  ArrowRight,
  MessageSquare,
  Tag,
  Check,
  Sparkles,
  ShoppingBag,
  Plus,
  Minus,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { cart, isLoading, updateQuantity, removeItem, applyCoupon, totalItems } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [modifyingItemId, setModifyingItemId] = useState<string | null>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError(null);
    setCouponSuccess(null);

    const res = await applyCoupon(couponInput.trim());
    setIsApplyingCoupon(false);
    if (res.success) {
      setCouponSuccess(`Coupon '${couponInput.toUpperCase()}' applied! Saved ₹${(res.discount || 0).toLocaleString('en-IN')}`);
      setCouponInput('');
    } else {
      setCouponError(res.error || 'Invalid or expired promotional code');
    }
  };

  const handleQtyChange = async (itemId: string, newQty: number) => {
    setModifyingItemId(itemId);
    await updateQuantity(itemId, newQty);
    setModifyingItemId(null);
  };

  const handleRemove = async (itemId: string) => {
    setModifyingItemId(itemId);
    await removeItem(itemId);
    setModifyingItemId(null);
  };

  const handleWhatsAppCartInquiry = () => {
    if (!cart || cart.items.length === 0) return;
    const itemList = cart.items
      .map(
        (i, idx) =>
          `${idx + 1}. *${i.product?.name || 'Product'}* (${i.variant?.title || 'Edition'}) × ${i.quantity} = ₹${i.totalPrice.toLocaleString('en-IN')}`
      )
      .join('\n');

    const text = encodeURIComponent(
      `Hello Divisha Support,\n\nI would like to inquire about my current Shopping Bag:\n\n${itemList}\n\n• *Estimated Total:* ₹${cart.summary.totalAmount.toLocaleString('en-IN')}\n\nCould you please assist me with delivery and payment options?`
    );
    window.open(`https://wa.me/919876543210?text=${text}`, '_blank');
  };

  if (isLoading && !cart) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mx-auto mb-4" />
        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
          Updating Cart...
        </p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white border border-slate-200 text-slate-400 mb-6 shadow-sm">
          <ShoppingBag className="h-10 w-10 text-brand-600" />
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-brand-600 font-bold mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>YOUR SHOPPING CART IS EMPTY</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold text-slate-900">
          Find Great Electronics & Appliances
        </h1>
        <p className="mt-3 text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Explore smart 4K OLED TVs, modern inverter refrigerators, energy-efficient air conditioners, and premium home furniture.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/shop"
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-amber-500 px-6 py-3.5 text-xs font-bold text-slate-950 shadow-md shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <span>Browse Products</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="https://wa.me/919876543210?text=Hello%20Divisha%20Support%2C%20I%20would%20like%20assistance%20choosing%20products."
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <MessageSquare className="h-4 w-4 text-emerald-600" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    );
  }

  const { summary } = cart;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-brand-600 font-bold">
            SECURE COMMERCE CHECKOUT
          </span>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Your Shopping Bag
          </h1>
        </div>
        <p className="mt-2 sm:mt-0 text-xs text-slate-500 font-mono">
          {totalItems} {totalItems === 1 ? 'Masterpiece' : 'Masterpieces'} Selected • Server-Verified Pricing
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.items.map((item) => {
            const product = item.product;
            const variant = item.variant;
            const imgUrl =
              variant?.images?.[0]?.url ||
              product?.images?.[0]?.url ||
              'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80';
            const isModifying = modifyingItemId === item.id;

            return (
              <div
                key={item.id}
                className="relative rounded-2xl bg-white p-5 sm:p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start">
                  {/* Thumbnail */}
                  <Link
                    href={`/product/${product?.slug || ''}`}
                    className="relative h-28 w-full sm:w-36 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200 group"
                  >
                    <Image
                      src={imgUrl}
                      alt={product?.name || 'Masterpiece'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  {/* Item Info */}
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-mono text-brand-600 uppercase font-bold">
                          {product?.brand?.name || 'Divisha Signature'}
                        </span>
                        <Link href={`/product/${product?.slug || ''}`}>
                          <h3 className="font-display text-base font-bold text-slate-900 hover:text-brand-600 transition-colors">
                            {product?.name || 'Masterpiece'}
                          </h3>
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5 font-mono">
                          Edition: <span className="text-slate-800 font-medium">{variant?.title || 'Standard'}</span> • SKU:{' '}
                          <span className="text-slate-600">{variant?.sku || product?.sku}</span>
                        </p>
                      </div>

                      {/* Total Item Price */}
                      <div className="text-right">
                        <div className="font-display text-lg font-bold text-slate-900 font-mono">
                          ₹{item.totalPrice.toLocaleString('en-IN')}
                        </div>
                        {item.unitSalePrice && item.unitSalePrice < item.unitPrice && (
                          <div className="text-[11px] text-slate-400 line-through font-mono">
                            ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stock Alert if limited */}
                    {!item.isAvailable && (
                      <div className="flex items-center gap-1.5 text-xs text-rose-600 font-mono">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>Insufficient stock. Maximum available: {item.availableStock}</span>
                      </div>
                    )}

                    {/* Quantity Stepper & Removal */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-slate-500 font-mono">Quantity:</span>
                        <div className="flex items-center rounded-xl bg-slate-100 border border-slate-200 p-0.5">
                          <button
                            onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                            disabled={isModifying || item.quantity <= 1}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-700 hover:bg-white disabled:opacity-40 transition-colors"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-mono font-bold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                            disabled={isModifying || item.quantity >= (item.availableStock || 99)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-700 hover:bg-white disabled:opacity-40 transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={isModifying}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Logistics Highlight Box */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 flex items-center gap-3 text-xs text-slate-700">
            <Truck className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-900">Complimentary White-Glove Logistics:</span> Each shipment includes insured transit, multi-tier protective timber crating, room-of-choice placement, and certified technician installation.
            </div>
          </div>
        </div>

        {/* Order Summary & Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl bg-white p-6 border border-slate-200/90 shadow-sm space-y-5">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Financial Breakdown
            </h2>

            {/* Price Calculations */}
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Catalog Subtotal:</span>
                <span className="text-slate-900 font-bold">₹{summary.subtotal.toLocaleString('en-IN')}</span>
              </div>

              {summary.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Coupon ({summary.couponCode}):
                  </span>
                  <span>-₹{summary.couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  Applicable 18% GST:
                  <span title="GST is calculated on final discounted amount" className="cursor-help">
                    <HelpCircle className="h-3 w-3 text-slate-400" />
                  </span>
                </span>
                <span className="text-slate-900">₹{summary.taxAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Insured White-Glove Freight:</span>
                <span className="text-emerald-700 font-bold">
                  {summary.shippingAmount === 0 ? 'COMPLIMENTARY' : `₹${summary.shippingAmount}`}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline text-sm font-sans">
                <span className="font-bold text-slate-900">Total Investment:</span>
                <span className="font-display text-2xl font-extrabold text-slate-900 font-mono">
                  ₹{summary.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-sans">
                All applicable taxes and direct brand warranties included.
              </p>
            </div>

            {/* Coupon Application Widget */}
            <div className="pt-4 border-t border-slate-100">
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold block">
                  Promotional / Privilege Code:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. DIVISHA10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplyingCoupon || !couponInput.trim()}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
                  >
                    {isApplyingCoupon ? '...' : 'Apply'}
                  </button>
                </div>
                {couponSuccess && (
                  <p className="text-xs text-emerald-700 font-mono flex items-center gap-1 font-semibold">
                    <Check className="h-3.5 w-3.5" /> {couponSuccess}
                  </p>
                )}
                {couponError && (
                  <p className="text-xs text-rose-600 font-mono flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> {couponError}
                  </p>
                )}
              </form>

              {/* Privilege suggestions */}
              <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-slate-500">
                <span>Active codes:</span>
                <button
                  type="button"
                  onClick={() => setCouponInput('DIVISHA10')}
                  className="rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-amber-800 font-bold hover:bg-amber-100"
                >
                  DIVISHA10 (10% Off)
                </button>
                <button
                  type="button"
                  onClick={() => setCouponInput('FESTIVE5000')}
                  className="rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-amber-800 font-bold hover:bg-amber-100"
                >
                  FESTIVE5000
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 py-3.5 px-6 text-sm font-bold text-slate-950 shadow-md shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <button
                type="button"
                onClick={handleWhatsAppCartInquiry}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-emerald-600 py-3.5 px-6 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-all"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Ask Question on WhatsApp</span>
              </button>
            </div>

            {/* Assurances */}
            <div className="pt-2 text-[11px] text-slate-500 space-y-1.5 font-mono">
              <div className="flex items-center gap-1.5 text-slate-700">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
                <span>100% Genuine Brand Warranty</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>Zero-Cost EMI Available on Cards at Payment Step</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
