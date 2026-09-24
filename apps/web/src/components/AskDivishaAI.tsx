'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Sparkles, MessageSquare, ArrowRight, Search, CheckCircle2, Shield } from 'lucide-react';
import { db } from '@divisha/database';
import { ProductDTO } from '@divisha/types';

export function AskDivishaAI() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [matchedProducts, setMatchedProducts] = useState<ProductDTO[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const SUGGESTED_QUERIES = [
    { label: '₹2,00,000 ke andar best OLED TV', query: 'OLED TV' },
    { label: 'Solid teak king bed with warranty', query: 'Teak Bed' },
    { label: 'Italian leather 3-seater sofa', query: 'Leather Sofa' },
    { label: 'Multi-door inverter refrigerator', query: 'Refrigerator' }
  ];

  const handleSearch = (searchStr: string) => {
    const q = searchStr.toLowerCase().trim();
    if (!q) {
      setMatchedProducts([]);
      setHasSearched(false);
      return;
    }
    setQuery(searchStr);
    setHasSearched(true);

    const results = db.products.filter((p) => {
      const name = p.name.toLowerCase();
      const desc = p.description.toLowerCase();
      const brand = p.brand?.name?.toLowerCase() || '';
      const cat = p.category?.name?.toLowerCase() || '';

      if (q.includes('oled') || q.includes('tv')) {
        return cat.includes('tv') || name.includes('oled') || name.includes('tv');
      }
      if (q.includes('teak') || q.includes('bed')) {
        return cat.includes('bed') || name.includes('bed') || desc.includes('teak');
      }
      if (q.includes('sofa') || q.includes('leather')) {
        return cat.includes('sofa') || name.includes('sofa') || desc.includes('leather');
      }
      if (q.includes('fridge') || q.includes('refrigerator')) {
        return cat.includes('refrigerator') || name.includes('refrigerator');
      }
      return name.includes(q) || desc.includes(q) || brand.includes(q);
    }).slice(0, 3);

    setMatchedProducts(results);
  };

  const handleWhatsAppAdvisor = () => {
    const userPrompt = query.trim() || 'I need personalized assistance finding the right electronics or furniture.';
    const text = encodeURIComponent(
      `Hello Divisha AI Specialist, I am looking for assistance:\n\n"${userPrompt}"\n\nCould you please suggest the best options and current promotional offers?`
    );
    window.open(`https://wa.me/919876543210?text=${text}`, '_blank');
  };

  return (
    <section id="ask-divisha" className="mx-auto max-w-7xl px-4 w-full">
      <div className="relative overflow-hidden rounded-3xl border border-amber-200/90 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 p-6 sm:p-12 shadow-sm">
        {/* Subtle Decorative Ambient Glow */}
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-amber-300/20 to-brand-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 border border-amber-300 px-3.5 py-1 text-xs font-bold text-amber-900 font-mono shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>AI SHOPPING ASSISTANT</span>
          </div>

          <h2 className="mt-3 font-display text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Not sure what to buy? Tell us what you&apos;re looking for.
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-slate-600 font-normal">
            Divisha AI understands <span className="font-semibold text-slate-800">English • हिंदी • Hinglish</span>. Describe your space, budget, or preferred dimensions, and get instant curated recommendations.
          </p>

          {/* Interactive AI Search Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(query);
            }}
            className="mt-6 flex flex-col sm:flex-row gap-2.5"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder='e.g. "Find me a TV under ₹2,00,000" or "Solid teak bed for master bedroom"'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 pl-11 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-6 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Ask Divisha</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Prompt Chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase text-slate-400 mr-1">
              Try asking:
            </span>
            {SUGGESTED_QUERIES.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSearch(item.query)}
                className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs text-slate-700 hover:border-brand-400 hover:text-brand-700 hover:bg-white shadow-2xs transition-all cursor-pointer"
              >
                &ldquo;{item.label}&rdquo;
              </button>
            ))}
          </div>

          {/* Matching Recommendations Results */}
          {hasSearched && (
            <div className="mt-8 pt-6 border-t border-amber-200/80">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold uppercase text-slate-600">
                  Curated Matches for &ldquo;{query}&rdquo;
                </span>
                <button
                  onClick={() => router.push(`/shop?search=${encodeURIComponent(query)}`)}
                  className="text-xs font-semibold text-brand-700 hover:underline flex items-center gap-1"
                >
                  <span>Explore full catalog results</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {matchedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {matchedProducts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.slug}`}
                      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm hover:border-brand-500/50 hover:shadow-md transition-all"
                    >
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                        <Image
                          src={p.images[0]?.url || 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80'}
                          alt={p.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <span className="text-[10px] font-mono text-brand-600 font-bold uppercase">
                        {p.brand?.name || 'Divisha'}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                        {p.name}
                      </h4>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-slate-900">
                          ₹{(p.salePrice || p.basePrice).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Verified Fit
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-white p-5 border border-slate-200 text-center">
                  <p className="text-xs text-slate-600">
                    No immediate match found for that specific phrasing. Connect with our concierge specialist directly on WhatsApp!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Direct WhatsApp Specialist Action */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleWhatsAppAdvisor}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-all cursor-pointer"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Ask an Electronics & Teak Specialist on WhatsApp</span>
            </button>
            <span className="text-[11px] text-slate-500 font-mono">
              ⚡ Typical response time: Under 5 minutes
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
