'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, ShoppingBag } from 'lucide-react';
import { db } from '@divisha/database';
import { ProductDTO } from '@divisha/types';

export function RecentlyViewed() {
  const [recentItems, setRecentItems] = useState<ProductDTO[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('divisha_recently_viewed') || '[]');
      if (Array.isArray(stored) && stored.length > 0) {
        // Resolve stored IDs against products
        const resolved = stored
          .map((idOrObj: any) => {
            const id = typeof idOrObj === 'string' ? idOrObj : idOrObj.id;
            return db.products.find((p) => p.id === id);
          })
          .filter(Boolean) as ProductDTO[];
        setRecentItems(resolved.slice(0, 4));
      }
    } catch {
      setRecentItems([]);
    }
  }, []);

  // Per user specification: Only show this section when relevant data exists. Do not show an empty section.
  if (recentItems.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-brand-600" />
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
            Continue Shopping (Recently Viewed)
          </h2>
        </div>
        <Link
          href="/shop"
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {recentItems.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.slug}`}
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md hover:border-brand-500/50 transition-all"
          >
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 mb-2.5">
              <Image
                src={product.images[0]?.url || 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80'}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="text-[10px] font-mono text-brand-600 font-bold uppercase">
              {product.brand?.name || 'Divisha'}
            </span>
            <h3 className="text-xs font-semibold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
            <div className="mt-2 text-xs font-bold font-mono text-slate-900">
              ₹{(product.salePrice || product.basePrice).toLocaleString('en-IN')}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
