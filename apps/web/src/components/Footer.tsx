import React from 'react';
import Link from 'next/link';
import { MessageSquare, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-16 grid grid-cols-1 md:grid-cols-5 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 p-0.5 shadow-md shadow-brand-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950 font-display text-lg font-bold text-brand-300">
                D
              </div>
            </div>
            <div>
              <span className="font-display text-lg font-extrabold tracking-tight text-slate-900">
                DIVISHA <span className="text-brand-600 font-semibold text-sm">ELECTRONICS</span>
              </span>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                Home Electronics & Modern Living
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
            India&apos;s trusted destination for 4K OLED televisions, inverter smart appliances, and premium solid teak furniture.
          </p>

          <div className="mt-6 flex flex-col space-y-2 text-xs">
            <a href="tel:+919876543210" className="flex items-center gap-2 text-slate-700 hover:text-brand-600 font-medium transition-colors">
              <Phone className="h-3.5 w-3.5 text-brand-600" />
              <span>Call Us: +91 98765 43210</span>
            </a>
            <a
              href="https://wa.me/919876543210?text=Hello%20Divisha%20Support"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-emerald-700 font-medium hover:underline transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>WhatsApp Support: Available 9 AM - 9 PM</span>
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 font-mono">
            Flagship Tech
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li><Link href="/shop?category=oled-tvs" className="hover:text-brand-600 transition-colors">Sony Bravia 4K OLED</Link></li>
            <li><Link href="/shop?category=oled-tvs" className="hover:text-brand-600 transition-colors">Samsung Neo QLED 8K</Link></li>
            <li><Link href="/shop?category=refrigerators" className="hover:text-brand-600 transition-colors">Family Hub Refrigerators</Link></li>
            <li><Link href="/shop?category=air-conditioners" className="hover:text-brand-600 transition-colors">Dual Inverter Smart ACs</Link></li>
            <li><Link href="/shop" className="hover:text-brand-600 transition-colors">Master Soundbars & Audio</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 font-mono">
            Bespoke Furniture
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li><Link href="/shop?category=sofas-sectionals" className="hover:text-brand-600 transition-colors">Chesterfield Leather Sofas</Link></li>
            <li><Link href="/shop?category=beds-mattresses" className="hover:text-brand-600 transition-colors">Floating Solid Teak Beds</Link></li>
            <li><Link href="/shop?category=dining-tables" className="hover:text-brand-600 transition-colors">Architectural Dining Sets</Link></li>
            <li><Link href="/shop" className="hover:text-brand-600 transition-colors">Acoustic Lounge Seating</Link></li>
            <li><Link href="/custom-furniture" className="hover:text-brand-600 transition-colors">Custom Timber Inquiries</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 font-mono">
            Support & Help
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li><Link href="/contact" className="hover:text-brand-600 font-semibold text-slate-900 transition-colors">Contact Us & Store Location</Link></li>
            <li><Link href="/about" className="hover:text-brand-600 transition-colors">About Divisha</Link></li>
            <li><Link href="/warranty" className="hover:text-brand-600 transition-colors">Warranty & Registrations</Link></li>
            <li><Link href="/shipping" className="hover:text-brand-600 transition-colors">Order Tracking & Delivery</Link></li>
            <li><Link href="/privacy" className="hover:text-brand-600 transition-colors">Privacy & Security</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50 py-5 text-[12px] text-slate-600">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between px-4 gap-2 text-center sm:text-left">
          <p>© 2026 Divisha Electronics Private Limited. All rights reserved.</p>
          <p className="text-slate-500 font-medium">
            Store Address: Divisha Tower, A.B. Road, Vijay Nagar, Indore, Madhya Pradesh - 452010
          </p>
        </div>
      </div>
    </footer>
  );
}
