'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MessageSquare, ShoppingBag, ArrowRight, Check, Heart, Truck } from 'lucide-react';
import { ProductDTO } from '@divisha/types';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: ProductDTO;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const list = JSON.parse(localStorage.getItem('divisha_wishlist') || '[]');
      return Array.isArray(list) && list.some((item: any) => (item.id || item) === product.id);
    } catch {
      return false;
    }
  });

  const primaryImg = product.images[0]?.url || 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80';
  const displayPrice = product.salePrice || product.basePrice;
  const hasDiscount = product.salePrice && product.salePrice < product.basePrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.basePrice - product.salePrice!) / product.basePrice) * 100)
    : 0;

  const defaultVariant = product.variants[0];

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
          image: primaryImg,
          sku: product.sku
        });
        setIsWishlisted(true);
      }
      localStorage.setItem('divisha_wishlist', JSON.stringify(list));
      window.dispatchEvent(new Event('wishlist-updated'));
    } catch (err) {
      console.error('Failed to update wishlist', err);
    }
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!defaultVariant) return;
    const res = await addItem(product.id, defaultVariant.id, 1);
    if (res.success) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  const handleWhatsAppInquiry = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const phone = '919876543210';
    const msg = encodeURIComponent(
      `Hello Divisha Support, I am interested in inquiring about:\n\n*${product.name}*\nSKU: ${product.sku}\nPrice: ₹${displayPrice.toLocaleString('en-IN')}\n\nCould you please confirm current delivery timeframe and offers?`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-brand-500/50 transition-all duration-300">
      {/* Image Container */}
      <Link href={`/product/${product.slug}`} className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <Image
          src={primaryImg}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 z-10">
            <span className="rounded-full bg-brand-500 px-2.5 py-0.5 text-[10px] font-bold text-slate-950 shadow-sm">
              {discountPercent}% OFF
            </span>
          </div>
        )}

        {/* Wishlist Heart Button */}
        <button
          onClick={handleToggleWishlist}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-sm hover:scale-110 active:scale-95 transition-all"
        >
          <Heart className={`h-4 w-4 transition-colors ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-600 hover:text-rose-500'}`} />
        </button>

        {/* Quick WhatsApp Inquiry Float on Hover */}
        <button
          onClick={handleWhatsAppInquiry}
          title="Inquire on WhatsApp"
          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md hover:bg-emerald-500 hover:scale-110 active:scale-95 transition-all opacity-90 sm:opacity-0 group-hover:opacity-100"
        >
          <MessageSquare className="h-4 w-4" />
        </button>
      </Link>

      {/* Card Info */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-mono">
          <span className="text-brand-600 font-semibold">{product.brand?.name || 'Divisha'}</span>
          <span>{product.sku}</span>
        </div>

        <Link href={`/product/${product.slug}`} className="group-hover:text-brand-600 transition-colors">
          <h3 className="font-display font-semibold text-slate-900 text-sm leading-snug line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Ratings */}
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <div className="flex items-center text-amber-500">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="ml-1 font-semibold text-slate-800">{product.ratingAverage}</span>
          </div>
          <span className="text-slate-300">•</span>
          <span className="text-[11px]">{product.reviewCount} Reviews</span>
        </div>

        {/* Delivery Info */}
        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 font-mono">
          <Truck className="h-3 w-3 flex-shrink-0" />
          <span>Free Express Delivery & Setup</span>
        </div>

        {/* Pricing & Actions */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-end justify-between">
          <div>
            <div className="text-base font-bold text-slate-900 font-mono">
              ₹{displayPrice.toLocaleString('en-IN')}
            </div>
            {hasDiscount && (
              <div className="text-xs text-slate-400 line-through font-mono">
                ₹{product.basePrice.toLocaleString('en-IN')}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickAdd}
              disabled={isAdded}
              title="Add directly to shopping bag"
              className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                isAdded
                  ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30'
                  : 'bg-brand-500 text-slate-950 font-bold hover:bg-brand-400 shadow-sm'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="h-3 w-3" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-3 w-3" />
                  <span>Add</span>
                </>
              )}
            </button>
            <Link
              href={`/product/${product.slug}`}
              className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Explore <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
