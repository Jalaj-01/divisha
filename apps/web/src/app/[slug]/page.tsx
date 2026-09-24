'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, redirect } from 'next/navigation';
import {
  Sparkles,
  ChevronRight,
  MessageSquare,
  Phone,
  Clock,
  ArrowRight,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { db } from '@divisha/database';
import { PageDTO } from '@divisha/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function DynamicContentPage() {
  const params = useParams();
  const slug = params?.slug as string;

  if (slug === 'contact-concierge' || slug === 'contact') {
    redirect('/contact');
  }

  const [page, setPage] = useState<PageDTO | null>(() => db.getPageBySlug(slug) || null);
  const [loading, setLoading] = useState(!page);

  useEffect(() => {
    if (!slug) return;
    const fetchPage = async () => {
      try {
        const res = await fetch(`${API_BASE}/v1/cms/pages/${slug}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) setPage(json.data);
        }
      } catch {
        const local = db.getPageBySlug(slug);
        if (local) setPage(local);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl py-32 text-center text-sm font-mono text-slate-500">
        Accessing Divisha Archives...
      </div>
    );
  }

  if (!page || !page.isPublished) {
    return (
      <div className="mx-auto max-w-4xl py-32 text-center px-4">
        <h1 className="font-display text-3xl font-extrabold text-slate-900">Editorial Page Not Found</h1>
        <p className="mt-2 text-sm text-slate-600">
          The requested chronicle or statutory document is currently unavailable in our archives.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-6 py-3 text-xs font-bold text-slate-950 shadow-md shadow-brand-500/20 hover:scale-105 transition-all"
        >
          <span>Return to Storefront</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-16 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-mono text-slate-500">
        <Link href="/" className="hover:text-slate-900 transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <span className="text-slate-500">Editorial & Governance</span>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <span className="text-brand-700 font-bold">{page.title}</span>
      </nav>

      {/* Hero Header */}
      <header className="border-b border-slate-200 pb-8 space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1 text-xs font-mono font-bold text-amber-900 shadow-sm">
          <Sparkles className="h-3 w-3 text-amber-600" />
          <span>DIVISHA LIVING ARCHIVE</span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          {page.title}
        </h1>

        <div className="flex items-center gap-6 text-xs font-mono text-slate-500 pt-2">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>Updated {new Date(page.updatedAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Authoritative Statement</span>
          </span>
        </div>
      </header>

      {/* Content Body */}
      <article className="max-w-none text-slate-700 leading-relaxed font-normal text-base space-y-6">
        <div className="whitespace-pre-wrap font-sans text-sm md:text-base leading-relaxed text-slate-700">
          {page.content}
        </div>
      </article>

      {/* Concierge Hotline Card */}
      <section className="rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50/80 via-white to-stone-50 p-8 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-600" />
              <span className="text-xs font-mono uppercase tracking-wider text-brand-700 font-bold">
                STORE & HEAD OFFICE
              </span>
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              Indore Store & Support Desk
            </h3>
            <p className="text-xs text-slate-600 max-w-lg leading-relaxed">
              Divisha Tower, A.B. Road, Vijay Nagar, Indore, Madhya Pradesh - 452010. Direct assistance for OLED TVs, appliances, and home furniture consultations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`https://wa.me/919876543210?text=Hello%20Divisha%20Support,%20I%20have%20an%20inquiry%20regarding%20${encodeURIComponent(page.title)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all"
            >
              <MessageSquare className="h-4 w-4" />
              <span>WhatsApp Support</span>
            </a>

            <a
              href="tel:+919876543210"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Phone className="h-4 w-4 text-brand-600" />
              <span>Direct Calling</span>
            </a>
          </div>
        </div>
      </section>

      {/* Related Reading Navigation */}
      <footer className="border-t border-slate-200 pt-8">
        <div className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-4">
          EXPLORE OTHER PILLARS
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'The Divisha Legacy', slug: 'about-us', label: 'Company Heritage' },
            { title: 'Teakwood Craftsmanship', slug: 'craftsmanship', label: 'Artisanal Joinery' },
            { title: 'Warranty & Protection', slug: 'warranty', label: '10-Yr Guarantee' }
          ]
            .filter((item) => item.slug !== slug)
            .map((item) => (
              <Link
                key={item.slug}
                href={`/${item.slug}`}
                className="group rounded-2xl border border-slate-200 bg-white p-5 hover:border-brand-500/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="text-[10px] font-mono text-brand-600 uppercase tracking-wider font-bold">
                    {item.label}
                  </div>
                  <div className="font-display text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors mt-1">
                    {item.title}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs text-slate-500 group-hover:text-brand-600 transition-colors font-medium">
                  <span>Read Article</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
        </div>
      </footer>
    </div>
  );
}
