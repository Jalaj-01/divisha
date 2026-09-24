'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Heart,
  Phone,
  Shield,
  Menu,
  X,
  ArrowUpRight,
  User,
  LogOut,
  ChevronDown,
  Package,
  Sparkles,
  Flame,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { db } from '@divisha/database';
import { ProductDTO } from '@divisha/types';

export function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const { user, isLoggedIn, logout } = useAuth();
  const { totalItems } = useCart();

  const [settings, setSettings] = useState({
    announcementPartnerText: 'Authorized Flagship Partner: Sony • Samsung • LG',
    announcementPromoBadge: 'SPECIAL OFFER',
    announcementPromoText: 'Flat 10% Off with Code DIVISHA10 • Free Professional Installation'
  });

  // Track wishlist & dynamic CMS announcement settings
  useEffect(() => {
    fetch('http://localhost:4000/v1/cms/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data || data) {
          const s = data.data || data;
          setSettings((prev) => ({
            ...prev,
            announcementPartnerText: s.announcementPartnerText || prev.announcementPartnerText,
            announcementPromoBadge: s.announcementPromoBadge || prev.announcementPromoBadge,
            announcementPromoText: s.announcementPromoText || prev.announcementPromoText
          }));
        }
      })
      .catch(() => {});

    const updateWishlist = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('divisha_wishlist') || '[]');
        setWishlistCount(Array.isArray(stored) ? stored.length : 0);
      } catch {
        setWishlistCount(0);
      }
    };
    updateWishlist();
    window.addEventListener('wishlist-updated', updateWishlist);
    return () => window.removeEventListener('wishlist-updated', updateWishlist);
  }, []);

  // Handle outside clicks for dropdown and search results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products for live search preview
  const matchingProducts = searchQuery.trim()
    ? db.products.filter((p) => {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand?.name.toLowerCase().includes(q)
        );
      }).slice(0, 5)
    : [];

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchFocused(false);
    router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSuggestionClick = (query: string) => {
    setSearchQuery(query);
    setSearchFocused(false);
    router.push(`/shop?search=${encodeURIComponent(query)}`);
  };

  const initials = user?.profile?.firstName
    ? `${user.profile.firstName[0]}${user.profile.lastName ? user.profile.lastName[0] : ''}`.toUpperCase()
    : 'U';

  const POPULAR_SEARCHES = [
    'Sony 4K OLED',
    'Teak King Bed',
    'French Door Refrigerator',
    'Leather Sofa',
    'Dual Inverter AC'
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-amber-50/90 text-slate-700 px-4 py-1.5 text-center text-xs font-medium border-b border-amber-200/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="hidden sm:flex items-center gap-1.5 text-brand-700 font-mono text-[11px] font-semibold">
            <Shield className="h-3 w-3 text-brand-600" />
            <span>{settings.announcementPartnerText}</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 mx-auto sm:mx-0 text-slate-800">
            <span className="inline-block rounded-full bg-amber-200/70 border border-amber-300/80 text-amber-900 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider">
              {settings.announcementPromoBadge}
            </span>
            <span className="text-[11px] sm:text-xs font-medium">
              {settings.announcementPromoText}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-xs font-mono">
            <a
              href="tel:+919876543210"
              className="flex items-center gap-1 text-slate-700 hover:text-brand-700 transition-colors font-medium"
            >
              <Phone className="h-3 w-3 text-brand-600" />
              <span>+91 98765 43210</span>
            </a>
            <span className="text-slate-300">|</span>
            <Link
              href="http://localhost:3001"
              target="_blank"
              className="flex items-center gap-1 text-xs text-brand-700 font-bold hover:text-brand-900 hover:underline"
            >
              Admin Portal <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header Row: Logo | Prominent Search | User Actions */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 via-brand-500 to-amber-600 p-0.5 shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950 font-display text-base font-black text-brand-300">
                D
              </div>
            </div>
            <div className="flex flex-col">
              <div className="font-display font-extrabold text-lg tracking-tight text-slate-900 flex items-center gap-1.5 leading-none">
                <span>DIVISHA</span>
                <span className="text-brand-600 font-semibold text-xs tracking-widest uppercase">
                  ELECTRONICS
                </span>
              </div>
              <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase mt-0.5">
                Modern Living & Tech
              </span>
            </div>
          </Link>

          {/* Prominent Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl relative" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search products, brands and categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  className="w-full rounded-full border border-slate-300 bg-slate-50/80 px-4 py-2.5 pl-11 pr-24 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all shadow-inner"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-20 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}

                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-brand-600 to-amber-500 px-4 py-1.5 text-xs font-bold text-slate-950 shadow-sm hover:opacity-90 active:scale-95 transition-all"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Live Autocomplete & Suggestion Popover */}
            {searchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-white border border-slate-200 p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                {/* Popular searches suggestions */}
                <div className="mb-3">
                  <div className="text-[11px] font-mono uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                    <Flame className="h-3.5 w-3.5 text-amber-500" />
                    <span>Popular Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SEARCHES.map((query) => (
                      <button
                        key={query}
                        type="button"
                        onClick={() => handleSuggestionClick(query)}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 border border-slate-200/60 transition-colors"
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Matching catalog products */}
                {searchQuery.trim() && (
                  <div className="border-t border-slate-100 pt-3">
                    <div className="text-[11px] font-mono uppercase font-bold tracking-wider text-slate-400 mb-2">
                      Matching Products ({matchingProducts.length})
                    </div>
                    {matchingProducts.length > 0 ? (
                      <div className="space-y-2">
                        {matchingProducts.map((p) => (
                          <Link
                            key={p.id}
                            href={`/product/${p.slug}`}
                            onClick={() => setSearchFocused(false)}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                          >
                            <div className="relative h-11 w-11 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                              <Image
                                src={p.images[0]?.url || 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=200&q=80'}
                                alt={p.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-slate-900 truncate">
                                {p.name}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                ₹{(p.salePrice || p.basePrice).toLocaleString('en-IN')}
                                {p.salePrice && p.salePrice < p.basePrice && (
                                  <span className="ml-2 line-through text-slate-400">
                                    ₹{p.basePrice.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full uppercase">
                              {p.type}
                            </span>
                          </Link>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleSearchSubmit()}
                          className="w-full text-center text-xs font-bold text-brand-600 hover:underline pt-1 flex items-center justify-center gap-1"
                        >
                          <span>View all results for &quot;{searchQuery}&quot;</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 py-2">
                        No direct matches found. Press Enter to search catalog.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons: Account | Wishlist | Cart */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* User Account Capsule */}
            {isLoggedIn && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 rounded-full bg-slate-100 hover:bg-slate-200 pl-2 pr-2.5 py-1 text-xs font-semibold text-slate-700 transition-all border border-slate-200 cursor-pointer"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 font-mono text-[11px] font-bold text-slate-950">
                    {initials}
                  </div>
                  <span className="hidden sm:inline text-xs font-medium text-slate-800 max-w-[90px] truncate">
                    {user.profile?.firstName || 'Account'}
                  </span>
                  <ChevronDown className="h-3 w-3 text-slate-500" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 p-2 shadow-2xl z-50 text-xs animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <div className="font-bold text-slate-900 truncate">
                        {user.profile?.firstName} {user.profile?.lastName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">{user.email}</div>
                    </div>

                    <Link
                      href="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                      <User className="h-3.5 w-3.5 text-brand-600" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      href="/account?tab=orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                      <Package className="h-3.5 w-3.5 text-brand-600" />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      href="/account?tab=wishlist"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                      <Heart className="h-3.5 w-3.5 text-rose-500" />
                      <span>My Wishlist ({wishlistCount})</span>
                    </Link>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/account/login"
                className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all shadow-sm"
              >
                <User className="h-3.5 w-3.5 text-brand-600" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Wishlist Button */}
            <Link
              href="/account?tab=wishlist"
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-rose-600 transition-colors"
              title="My Wishlist"
            >
              <Heart className="h-4 w-4 text-slate-600 hover:text-rose-500" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Bag Pill */}
            <Link
              href="/cart"
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-sm shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
              title="Shopping Cart"
            >
              <ShoppingBag className="h-4 w-4 text-slate-950" />
              <span className="font-mono text-xs font-black">
                Cart · {totalItems}
              </span>
            </Link>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden mt-2.5">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products, brands, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-300 bg-slate-50 px-4 py-2 pl-10 pr-16 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-brand-500 px-3 py-1 text-[11px] font-bold text-slate-950"
            >
              Go
            </button>
          </form>
        </div>
      </div>

      {/* Secondary Category Navigation Bar */}
      <div className="border-t border-slate-100 bg-slate-50/70 overflow-x-auto no-scrollbar">
        <div className="mx-auto max-w-7xl px-4 flex items-center gap-1 sm:gap-2 py-2 whitespace-nowrap text-xs font-semibold text-slate-700">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-brand-600 transition-colors font-bold text-slate-900"
          >
            Home
          </Link>
          <Link
            href="/shop"
            className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-brand-600 transition-colors"
          >
            All Collections
          </Link>
          <Link
            href="/shop?category=oled-tvs"
            className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-brand-600 transition-colors"
          >
            Smart 4K & OLED TVs
          </Link>
          <Link
            href="/shop?category=refrigerators"
            className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-brand-600 transition-colors"
          >
            Refrigerators
          </Link>
          <Link
            href="/shop?category=air-conditioners"
            className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-brand-600 transition-colors"
          >
            Inverter ACs
          </Link>
          <Link
            href="/shop?category=sofas-sectionals"
            className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-brand-600 transition-colors"
          >
            Luxury Sofas
          </Link>
          <Link
            href="/shop?category=beds-mattresses"
            className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-brand-600 transition-colors"
          >
            Solid Teak Beds
          </Link>
          <Link
            href="/shop?category=dining-tables"
            className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-brand-600 transition-colors"
          >
            Dining Sets
          </Link>
          <Link
            href="/#deals"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-amber-700 bg-amber-100/60 font-bold hover:bg-amber-100 transition-colors"
          >
            <Flame className="h-3 w-3 text-amber-600" />
            <span>Deals of the Day</span>
          </Link>
          <Link
            href="/#ask-divisha"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-brand-700 bg-brand-100/60 font-bold hover:bg-brand-100 transition-colors"
          >
            <Sparkles className="h-3 w-3 text-brand-600" />
            <span>Ask Divisha</span>
          </Link>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-5 shadow-2xl animate-in slide-in-from-top-2">
          <div className="flex flex-col space-y-2 text-sm font-semibold text-slate-800">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-50"
            >
              Home
            </Link>
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-50"
            >
              All Collections
            </Link>
            <Link
              href="/shop?category=oled-tvs"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-50"
            >
              4K OLED TVs
            </Link>
            <Link
              href="/shop?category=refrigerators"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-50"
            >
              Smart Refrigerators
            </Link>
            <Link
              href="/shop?category=air-conditioners"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-50"
            >
              Inverter ACs
            </Link>
            <Link
              href="/shop?category=sofas-sectionals"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-50"
            >
              Luxury Sofas
            </Link>
            <Link
              href="/shop?category=beds-mattresses"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-50"
            >
              Solid Teak Beds
            </Link>
            <Link
              href="/shop?category=dining-tables"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-slate-50"
            >
              Dining Sets
            </Link>
            <Link
              href="/#deals"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg text-amber-700 bg-amber-50 font-bold"
            >
              ⚡ Deals of the Day
            </Link>
            <Link
              href="/#ask-divisha"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg text-brand-700 bg-brand-50 font-bold"
            >
              ✨ Ask Divisha (AI Shopping Assistant)
            </Link>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            <a
              href="tel:+919876543210"
              className="flex items-center justify-center gap-2 rounded-full border border-slate-300 py-2.5 text-xs font-semibold text-slate-700"
            >
              <Phone className="h-3.5 w-3.5 text-brand-600" />
              <span>Customer Helpline: +91 98765 43210</span>
            </a>
            <Link
              href="http://localhost:3001"
              target="_blank"
              className="flex items-center justify-center gap-2 rounded-full bg-slate-900 text-white py-2.5 text-xs font-bold"
            >
              <span>Admin Portal</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
