import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Sparkles,
  Shield,
  Truck,
  RotateCcw,
  Lock,
  ChevronRight,
  Flame,
  Award,
  Layers,
  Heart,
  Star,
  CheckCircle2
} from 'lucide-react';
import { db } from '@divisha/database';
import { ProductCard } from '@/components/ProductCard';
import { AskDivishaAI } from '@/components/AskDivishaAI';
import { RecentlyViewed } from '@/components/RecentlyViewed';

export default function HomePage() {
  const products = db.products.filter((p) => p.isActive && !p.isArchived);
  const categories = db.categories.filter((c) => c.isActive);
  const brands = db.brands;

  // Filter products for each section
  const dealsProducts = products.filter((p) => p.salePrice && p.salePrice < p.basePrice).slice(0, 4);
  const trendingProducts = [...products].sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0)).slice(0, 4);
  const recommendedProducts = [...products].sort((a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0)).slice(0, 4);
  const furnitureProducts = products.filter((p) => p.type === 'FURNITURE').slice(0, 3);

  // Featured Hero Product
  const heroProduct = products.find((p) => p.slug === 'sony-bravia-xr-65-master-series-oled') || products[0];

  return (
    <div className="flex flex-col space-y-16 sm:space-y-24 pb-20 overflow-x-hidden">
      {/* 1. HERO SECTION: Upgrade Your Everyday Technology & Living */}
      <section className="relative bg-gradient-to-b from-amber-50/60 via-white to-[#faf9f6] border-b border-slate-200/80 pt-6 pb-12 sm:pb-16 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headlines & Call to Actions */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50/90 px-3.5 py-1 text-xs font-bold text-amber-900 shadow-2xs font-mono">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>UPGRADE YOUR EVERYDAY TECHNOLOGY</span>
              </div>

              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Smart Technology.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-amber-600 to-brand-500">
                  Better Living.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Explore cinema-grade 4K OLED televisions, inverter smart home appliances, and handcrafted solid teak timber furniture with authorized 10-year brand warranties and complimentary white-glove installation.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
                <Link
                  href="/shop"
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-7 py-3.5 text-xs sm:text-sm font-bold text-slate-950 shadow-md shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <span>Shop Electronics & Furniture</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href="#categories"
                  className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-3.5 text-xs sm:text-sm font-semibold text-slate-700 hover:border-brand-500 hover:text-brand-700 hover:bg-slate-50 transition-all duration-200 shadow-2xs"
                >
                  <span>Explore Categories</span>
                </a>
              </div>

              {/* Key Trust Highlights */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-slate-600 font-mono">
                <span className="flex items-center gap-1.5 font-medium text-slate-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Authorized Flagship Tech
                </span>
                <span className="hidden sm:inline text-slate-300">•</span>
                <span className="flex items-center gap-1.5 font-medium text-slate-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> 100% Solid Teak Joinery
                </span>
                <span className="hidden sm:inline text-slate-300">•</span>
                <span className="flex items-center gap-1.5 font-medium text-slate-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Free Onsite Setup
                </span>
              </div>
            </div>

            {/* Right Column: Hero Product Showcase Visual */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-xl shadow-slate-900/5 group">
                <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-100 mb-4">
                  <Image
                    src={heroProduct?.images[0]?.url || 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1000&q=85'}
                    alt={heroProduct?.name || 'Divisha Flagship Master Series'}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Floating Promo Tag */}
                  <div className="absolute top-3 left-3 rounded-full bg-brand-500 px-3 py-1 text-[11px] font-bold text-slate-950 shadow-sm flex items-center gap-1">
                    <Flame className="h-3 w-3" />
                    <span>Flagship Deal · Save ₹30,000</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-1">
                  <span className="text-brand-600 font-bold uppercase">{heroProduct?.brand?.name || 'Sony'}</span>
                  <div className="flex items-center text-amber-500 gap-1 font-sans">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="font-bold text-slate-800">4.9</span>
                    <span className="text-slate-400 text-[11px]">(42 Reviews)</span>
                  </div>
                </div>

                <h3 className="font-display text-base font-bold text-slate-900 line-clamp-1">
                  {heroProduct?.name}
                </h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                  {heroProduct?.shortDescription || heroProduct?.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 line-through font-mono block">
                      ₹{heroProduct?.basePrice?.toLocaleString('en-IN')}
                    </span>
                    <span className="text-lg font-bold font-mono text-slate-900">
                      ₹{(heroProduct?.salePrice || heroProduct?.basePrice)?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <Link
                    href={`/product/${heroProduct?.slug}`}
                    className="rounded-full bg-slate-900 hover:bg-brand-600 px-5 py-2 text-xs font-bold text-white transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SHOP BY CATEGORY */}
      <section id="categories" className="mx-auto max-w-7xl px-4 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-widest text-brand-600 font-bold">
              <span>EXPLORE BY DOMAIN</span>
            </div>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Shop by Category
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Explore cinema televisions, intelligent appliances, and bespoke solid timber collections.
            </p>
          </div>
          <Link
            href="/shop"
            className="mt-3 sm:mt-0 flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            <span>View All Categories</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 text-center shadow-2xs hover:shadow-md hover:border-brand-500/50 transition-all duration-300"
            >
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100 mb-3">
                <Image
                  src={cat.imageUrl || 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80'}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <h3 className="font-display text-xs sm:text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <span className="mt-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                {cat.type}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. ⚡ DEALS OF THE DAY */}
      <section id="deals" className="mx-auto max-w-7xl px-4 w-full">
        <div className="rounded-3xl border border-amber-200/90 bg-gradient-to-r from-amber-50/50 via-white to-orange-50/30 p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20">
                <Flame className="h-5 w-5 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                    Deals of the Day
                  </h2>
                  <span className="hidden sm:inline-block rounded-full bg-rose-500 text-white px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase">
                    Up to 25% Off
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Exclusive seasonal pricing on verified flagships with zero-cost EMI options.
                </p>
              </div>
            </div>

            <Link
              href="/shop"
              className="flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-900 hover:underline"
            >
              <span>View All Deals</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dealsProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. 🔥 TRENDING PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-slate-500 font-bold">
              <span>CUSTOMER FAVORITES</span>
            </div>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Trending Now
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Top-selling televisions and artisan furniture suites ordered this week.
            </p>
          </div>
          <Link
            href="/shop"
            className="mt-3 sm:mt-0 flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            <span>Explore All Trending</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. ✨ ASK DIVISHA (AI SHOPPING ASSISTANT) */}
      <AskDivishaAI />

      {/* 6. RECOMMENDED FOR YOU */}
      <section className="mx-auto max-w-7xl px-4 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-slate-500 font-bold">
              <span>CURATED DISCOVERY</span>
            </div>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Recommended for You
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Handpicked selections based on highest customer ratings and craftsmanship standards.
            </p>
          </div>
          <Link
            href="/shop"
            className="mt-3 sm:mt-0 flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            <span>Browse Full Catalog</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. CONTINUE SHOPPING (RECENTLY VIEWED - CLIENT HYDRATED) */}
      <RecentlyViewed />

      {/* 8. HOME & FURNITURE SECTION — UPGRADE YOUR HOME */}
      <section className="mx-auto max-w-7xl px-4 w-full">
        <div className="rounded-3xl border border-amber-200/90 bg-gradient-to-br from-amber-50/80 via-white to-stone-50 p-6 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-900 border border-amber-500/30 font-mono">
                <Award className="h-3.5 w-3.5 text-amber-600" />
                <span>ARTISANAL TEAK HERITAGE</span>
              </div>

              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Upgrade Your Home: Handcrafted Malabar Teak Meets Cinema Design
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Every furniture piece at Divisha is seasoned for over 180 days in Madhya Pradesh, hand-planed by master woodworkers using traditional mortise-and-tenon joinery, and dimensioned to elevate OLED displays and soundstages.
              </p>

              {/* Timber & Construction Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                  <div className="font-mono text-xs sm:text-sm font-bold text-slate-900">100% Solid Teak</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Zero particle board</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                  <div className="font-mono text-xs sm:text-sm font-bold text-slate-900">Italian Leather</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Full-grain upholstery</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                  <div className="font-mono text-xs sm:text-sm font-bold text-slate-900">10-Year Warranty</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Direct frame protection</div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/shop?category=beds-mattresses"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-xs font-bold text-white hover:bg-brand-600 transition-colors shadow-sm"
                >
                  <span>Explore Teak Furniture</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/shop?category=sofas-sectionals"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-xs font-semibold text-slate-700 hover:border-slate-400 transition-colors"
                >
                  <span>View Leather Sofas</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative aspect-[4/3] rounded-3xl overflow-hidden border border-slate-200 shadow-md">
              <Image
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80"
                alt="Divisha Royal Chesterfield Teak Sofa"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 9. SMART BUNDLES — COMPLETE YOUR SETUP */}
      <section className="mx-auto max-w-7xl px-4 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-brand-600 font-bold">
              <span>CURATED HARMONY</span>
            </div>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Complete Your Setup & Save
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Harmonized combinations of cinema electronics and artisanal teak furniture with bundle savings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bundle 1 */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-brand-500/50 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-brand-50 text-brand-700 px-3 py-1 rounded-full border border-brand-200">
                  Master Cinema Suite
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-mono">
                  Save ₹35,000
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Sony 4K OLED + Dolby Atmos Soundbar + Teak TV Unit
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Precision calibrated 65-inch visual masterpiece paired with room-tuned acoustic immersion and floating seasoned teak console.
              </p>

              <div className="mt-5 space-y-2 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-600 flex-shrink-0" />
                  <span>Sony Bravia XR 65&quot; Master Series 4K OLED TV</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-600 flex-shrink-0" />
                  <span>Dolby Atmos Spatial Soundstage Integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-600 flex-shrink-0" />
                  <span>Hand-Finished Floating Teak Media Credenza</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 line-through font-mono block">₹2,84,990</span>
                <span className="text-xl font-bold font-mono text-slate-900">₹2,49,990</span>
              </div>
              <Link
                href="/shop?category=oled-tvs"
                className="rounded-full bg-slate-900 hover:bg-brand-600 text-white px-5 py-2.5 text-xs font-bold transition-colors"
              >
                Explore Setup
              </Link>
            </div>
          </div>

          {/* Bundle 2 */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-brand-500/50 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
                  Royal Master Bedroom Suite
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-mono">
                  Save ₹22,000
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Nordica Solid Teak King Bed + Orthopedic Mattress + Nightstands
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Floating Scandinavian teak king bed with integrated ambient LED lighting, dual drawers, and orthopedic dual-density mattress.
              </p>

              <div className="mt-5 space-y-2 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Divisha Nordica 100% Solid Teak King Bed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Warm Floating LED Underglow & Bouclé Headboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>Dual Matching Teak Floating Nightstands</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 line-through font-mono block">₹1,72,000</span>
                <span className="text-xl font-bold font-mono text-slate-900">₹1,50,000</span>
              </div>
              <Link
                href="/shop?category=beds-mattresses"
                className="rounded-full bg-slate-900 hover:bg-brand-600 text-white px-5 py-2.5 text-xs font-bold transition-colors"
              >
                Explore Setup
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 10. TOP BRANDS (AUTHORIZED BRAND PARTNERS) */}
      <section className="mx-auto max-w-7xl px-4 w-full">
        <div className="text-center mb-8">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold block mb-1">
            OFFICIAL DISTRIBUTOR & CERTIFIED WARRANTY
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
            Authorized Flagship Brand Partners
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center justify-center">
          {brands.map((b) => (
            <Link
              key={b.id}
              href={`/shop?brand=${b.slug}`}
              className="flex flex-col items-center justify-center rounded-2xl bg-white border border-slate-200 p-5 transition-all hover:border-brand-500/50 hover:shadow-sm group text-center"
            >
              <span className="font-display font-black text-slate-900 text-xl tracking-wider group-hover:text-brand-600 transition-colors">
                {b.name}
              </span>
              <span className="mt-1 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                Official Warranty Partner
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 11. WHY SHOP WITH DIVISHA? (TRUST SECTION) */}
      <section className="mx-auto max-w-7xl px-4 w-full">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Why Shop With Divisha?
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
              Reliable e-commerce backed by authorized OEM partnerships, skilled technicians, and master teak artisans.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 border border-brand-500/20 mb-3">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="font-display text-sm font-bold text-slate-900">
                Fast & Free Delivery
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Complimentary room placement and expert unboxing across 100+ cities in India.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 mb-3">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="font-display text-sm font-bold text-slate-900">
                100% Secure Payments
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                256-Bit SSL encryption, Razorpay, zero-cost EMI on major credit cards & verified COD.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 mb-3">
                <RotateCcw className="h-6 w-6" />
              </div>
              <h3 className="font-display text-sm font-bold text-slate-900">
                Easy 7-Day Returns
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Hassle-free replacement policy for transit damages or certified technical discrepancies.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 border border-brand-500/20 mb-3">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="font-display text-sm font-bold text-slate-900">
                Genuine Brand Warranty
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Direct manufacturer warranties on electronics and 10-year structural warranty on teak.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
