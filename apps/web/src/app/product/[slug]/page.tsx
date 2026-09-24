'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Star, ShieldCheck, Truck, MessageSquare, Phone, Check, ArrowRight, Heart } from 'lucide-react';
import { db } from '@divisha/database';
import { ProductDTO, ProductVariantDTO } from '@divisha/types';
import { useCart } from '@/context/CartContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<ProductDTO | null>(() => db.getProductBySlug(slug) || null);
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantDTO | null>(
    () => db.getProductBySlug(slug)?.variants[0] || null
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(() => {
    if (typeof window === 'undefined' || !product) return false;
    try {
      const list = JSON.parse(localStorage.getItem('divisha_wishlist') || '[]');
      return Array.isArray(list) && list.some((item: any) => (item.id || item) === product.id);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!slug) return;
    const fetchLiveProduct = async () => {
      try {
        const res = await fetch(`${API_BASE}/v1/products/${slug}`).then((r) => (r.ok ? r.json() : null));
        if (res?.data) {
          setProduct(res.data);
          if (res.data.variants && res.data.variants.length > 0) {
            setSelectedVariant((prev) => prev || res.data.variants[0]);
          }
        }
      } catch {
        // Fallback silently to initialized in-memory database
      }
    };
    fetchLiveProduct();
  }, [slug]);

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl py-32 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Product Not Found</h1>
        <p className="mt-2 text-slate-500">The requested product is not available in our catalog.</p>
        <Link href="/shop" className="mt-6 inline-block rounded-xl bg-brand-500 px-6 py-2.5 text-xs font-bold text-slate-950">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const displayPrice = selectedVariant?.salePrice || selectedVariant?.price || product.salePrice || product.basePrice;
  const availableStock = selectedVariant ? db.getStock(selectedVariant.id) : 10;
  const isOutOfStock = availableStock <= 0;

  const currentImg = product.images[selectedImageIndex]?.url || product.images[0]?.url;

  const handleToggleWishlist = () => {
    try {
      let list = JSON.parse(localStorage.getItem('divisha_wishlist') || '[]');
      if (!Array.isArray(list)) list = [];
      const index = list.findIndex((item: any) => (item.id || item) === product.id);
      if (index >= 0) {
        list.splice(index, 1);
        setIsWishlisted(false);
      } else {
        list.push({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: displayPrice,
          image: currentImg,
          sku: product.sku
        });
        setIsWishlisted(true);
      }
      localStorage.setItem('divisha_wishlist', JSON.stringify(list));
      window.dispatchEvent(new Event('wishlist-updated'));
    } catch (err) {
      console.error('Failed to toggle wishlist', err);
    }
  };

  const handleWhatsAppInquiry = () => {
    try {
      fetch('http://localhost:4000/v1/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'WHATSAPP_INQUIRY',
          entityType: 'PRODUCT',
          entityId: product.id,
          metadata: {
            sku: selectedVariant?.sku || product.sku,
            price: displayPrice
          }
        })
      }).catch(() => {});
    } catch (_) {}

    const text = encodeURIComponent(
      `Hello Divisha Support,\n\nI am inquiring about:\n• *${product.name}*\n• *SKU:* ${selectedVariant?.sku || product.sku}\n• *Variant:* ${selectedVariant?.title || 'Standard'}\n• *Price:* ₹${displayPrice.toLocaleString('en-IN')}\n\nCould you please confirm delivery timeframe and zero-cost EMI plans?`
    );
    window.open(`https://wa.me/919876543210?text=${text}`, '_blank');
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    setAddError(null);
    const res = await addItem(product.id, selectedVariant.id, 1);
    if (res.success) {
      setIsAddedToCart(true);
      setTimeout(() => setIsAddedToCart(false), 3000);
    } else {
      setAddError(res.error || 'Failed to add item to bag');
      setTimeout(() => setAddError(null), 4000);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-8 font-mono">
        <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-slate-900 transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-brand-600 font-semibold">{product.category?.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Media Gallery Column */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md">
            <Image
              src={currentImg}
              alt={product.name}
              fill
              priority
              className="object-cover transition-all duration-300"
            />
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    selectedImageIndex === idx ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img.thumbnailUrl || img.url} alt="Thumbnail" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Specifications Table */}
          <div className="mt-8 rounded-2xl bg-white p-6 border border-slate-200/90 shadow-sm">
            <h3 className="font-display text-lg font-bold text-slate-900 mb-4">
              Technical Specifications & Craftsmanship
            </h3>
            <div className="space-y-4">
              {product.specifications.map((group, gIdx) => (
                <div key={gIdx} className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-brand-600 font-mono">
                    {group.group}
                  </div>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    {group.items.map((item, iIdx) => (
                      <div key={iIdx} className="flex justify-between border-b border-slate-100 pb-1.5">
                        <dt className="text-slate-500">{item.key}:</dt>
                        <dd className="font-semibold text-slate-900">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Details & Purchase Controls */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-brand-600 mb-2">
              <span className="font-bold">{product.brand?.name}</span>
              <span className="text-slate-500">SKU: {selectedVariant?.sku || product.sku}</span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <div className="flex items-center text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="ml-1 font-bold text-slate-900">{product.ratingAverage}</span>
              </div>
              <span>•</span>
              <span>{product.reviewCount} Verified Client Reviews</span>
              <span>•</span>
              <span className="text-emerald-700 font-medium">100% Genuine Direct Warranty</span>
            </div>
          </div>

          {/* Price Box */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-3xl font-extrabold text-slate-900 font-mono">
                ₹{displayPrice.toLocaleString('en-IN')}
              </span>
              {selectedVariant?.salePrice && selectedVariant.salePrice < selectedVariant.price && (
                <span className="text-sm text-slate-400 line-through font-mono">
                  ₹{selectedVariant.price.toLocaleString('en-IN')}
                </span>
              )}
              <span className="text-xs text-slate-500 font-mono">(Incl. 18% GST)</span>
            </div>

            <p className="mt-2 text-xs text-brand-700 font-medium flex items-center gap-1.5 font-mono">
              <span>Or starting at ₹{Math.round(displayPrice / 12).toLocaleString('en-IN')}/mo with 0% No-Cost EMI</span>
            </p>

            {/* Authoritative Stock Status */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Inventory Status:</span>
              {isOutOfStock ? (
                <span className="text-rose-600 font-semibold">Temporarily Out of Stock</span>
              ) : (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> In Stock ({availableStock} units ready for dispatch)
                </span>
              )}
            </div>
          </div>

          {/* Variant Selector */}
          {product.variants.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 font-mono">
                Select Edition / Dimension:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      selectedVariant?.id === v.id
                        ? 'border-brand-500 bg-brand-50/80 text-slate-950 font-bold shadow-sm ring-1 ring-brand-500/30'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <div className="text-xs font-bold">{v.title}</div>
                    <div className="text-[11px] font-mono mt-0.5 text-brand-700 font-semibold">
                      ₹{(v.salePrice || v.price).toLocaleString('en-IN')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 py-3.5 px-6 text-sm font-bold text-slate-950 shadow-md shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isAddedToCart ? (
                  <>
                    <Check className="h-4 w-4" /> Added to Bag!
                  </>
                ) : (
                  <>
                    <span>Add to Bag</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <button
                onClick={handleToggleWishlist}
                title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
                className={`flex items-center gap-2 rounded-xl border px-4 py-3.5 text-xs font-bold transition-all ${
                  isWishlisted
                    ? 'border-rose-300 bg-rose-50 text-rose-600 shadow-sm'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
                <span className="hidden sm:inline">{isWishlisted ? 'Saved' : 'Wishlist'}</span>
              </button>
            </div>

            {addError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-center text-xs text-rose-700 font-mono">
                {addError}
              </div>
            )}

            {/* WhatsApp Direct Inquire CTA */}
            <button
              onClick={handleWhatsAppInquiry}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 px-6 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-all"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Inquire / Order on WhatsApp</span>
            </button>

            {/* Direct Priority Voice Call */}
            <a
              href="tel:+919876543210"
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-3 px-6 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
            >
              <Phone className="h-3.5 w-3.5 text-brand-600" />
              <span>Priority Calling: +91 98765 43210</span>
            </a>
          </div>

          {/* Guarantees Box */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-2.5 text-slate-800">
              <Truck className="h-4 w-4 text-brand-600" />
              <span>Free insured white-glove logistics across all tier-1 & tier-2 cities.</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-800">
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              <span>{product.warrantyInfo || 'Comprehensive Brand Warranty with prioritized onsite engineer visits.'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
