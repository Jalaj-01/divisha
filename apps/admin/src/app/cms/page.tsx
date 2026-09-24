'use client';

import React from 'react';
import Link from 'next/link';
import {
  Layers,
  Image as ImageIcon,
  FileText,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Eye,
  CheckCircle2,
  Sliders
} from 'lucide-react';

export default function ContentManagementHubPage() {
  const sections = [
    {
      title: 'Promotional Hero Banners',
      href: '/banners',
      icon: ImageIcon,
      count: '2 Active Banners',
      description: 'Configure high-impact promotional carousel slides with luxury typography, CTA links, and date ranges.',
      features: ['Desktop & mobile image URLs', 'Active/inactive visibility switch', 'Sort priority sequencing']
    },
    {
      title: 'Homepage Layout Blocks',
      href: '/content-blocks',
      icon: Layers,
      count: '4 Sections Arranged',
      description: 'Visually organize and reorder the dynamic content modules displayed on the customer storefront homepage.',
      features: ['One-click up/down reorder steppers', 'Hero slider & category grids', 'Brand spotlights & lookbooks']
    },
    {
      title: 'Editorial & Statutory Pages',
      href: '/pages',
      icon: FileText,
      count: '4 Published Pages',
      description: 'Manage rich Markdown content pages for About Us, Warranty Coverage, Artisanal Craftsmanship, and Concierge.',
      features: ['Real-time Markdown editor modal', 'SEO title & meta description tags', 'Indore HQ statutory disclosures']
    }
  ];

  const storefrontLiveLinks = [
    { name: 'About Divisha & Heritage', slug: '/about-us' },
    { name: '5-Year Master Warranty Policy', slug: '/warranty' },
    { name: 'Solid Teak & Timber Joinery', slug: '/craftsmanship' },
    { name: 'Private Concierge & Showroom', slug: '/contact-concierge' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-brand-700 border border-amber-200 shadow-sm">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                Content Management Hub
                <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[11px] font-mono font-bold text-amber-900">
                  Dynamic CMS
                </span>
              </h1>
              <p className="text-sm text-slate-600">
                Centralized editorial command for promotional banners, homepage modular sections, and brand governance pages.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main CMS Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((sec) => {
          const Icon = sec.icon;
          return (
            <div
              key={sec.title}
              className="rounded-3xl border border-slate-200/90 bg-white p-6 flex flex-col justify-between hover:border-slate-300 shadow-sm hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-brand-700 group-hover:scale-105 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-mono text-slate-700 font-semibold">
                    {sec.count}
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold text-slate-900 mt-4">{sec.title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{sec.description}</p>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
                  {sec.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-700 font-mono">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href={sec.href}
                className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-slate-50 border border-slate-200 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100 hover:text-slate-950 transition-all"
              >
                <span>Manage {sec.title.split(' ')[0]}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* Live Storefront Editorial Pages Directory */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-brand-600" />
            <h3 className="font-bold text-sm text-slate-900">Live Storefront Editorial Pages</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Rendered on Next.js Storefront</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {storefrontLiveLinks.map((link) => (
            <a
              key={link.slug}
              href={`http://localhost:3000${link.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3 hover:border-slate-300 hover:bg-slate-100 transition-all text-xs"
            >
              <div>
                <div className="font-semibold text-slate-900">{link.name}</div>
                <div className="text-[10px] font-mono text-brand-700 font-bold mt-0.5">{link.slug}</div>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
