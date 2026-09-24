'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  Award,
  Boxes,
  ShoppingCart,
  Truck,
  CreditCard,
  RotateCcw,
  Tag,
  Users,
  Star,
  FileText,
  Image as ImageIcon,
  BarChart3,
  Shield,
  History,
  Settings,
  MessageSquare,
  Sliders
} from 'lucide-react';

interface NavSection {
  title: string;
  items: { name: string; href: string; icon: any }[];
}

const NAVIGATION: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [{ name: 'Dashboard', href: '/', icon: LayoutDashboard }]
  },
  {
    title: 'COMMERCE',
    items: [
      { name: 'Products & Variants', href: '/products', icon: Package },
      { name: 'Categories', href: '/categories', icon: Layers },
      { name: 'Brands', href: '/brands', icon: Award },
      { name: 'Inventory & Stock', href: '/inventory', icon: Boxes },
      { name: 'Orders & Fulfillment', href: '/orders', icon: ShoppingCart },
      { name: 'Shipments', href: '/shipments', icon: Truck },
      { name: 'Payments & Payouts', href: '/payments', icon: CreditCard },
      { name: 'Refunds', href: '/refunds', icon: RotateCcw },
      { name: 'Coupons & Promos', href: '/coupons', icon: Tag }
    ]
  },
  {
    title: 'CUSTOMERS & SUPPORT',
    items: [
      { name: 'Customer Accounts', href: '/customers', icon: Users },
      { name: 'WhatsApp Support', href: '/whatsapp', icon: MessageSquare },
      { name: 'Incomplete Orders', href: '/carts', icon: ShoppingCart },
      { name: 'Customer Reviews', href: '/reviews', icon: Star }
    ]
  },
  {
    title: 'WEBSITE CONTENT',
    items: [
      { name: 'Content Overview', href: '/cms', icon: Layers },
      { name: 'Promotional Banners', href: '/banners', icon: ImageIcon },
      { name: 'Homepage Blocks', href: '/content-blocks', icon: Sliders },
      { name: 'Policy & About Pages', href: '/pages', icon: FileText }
    ]
  },
  {
    title: 'SECURITY & SETTINGS',
    items: [
      { name: 'Sales Analytics', href: '/analytics', icon: BarChart3 },
      { name: 'Staff Activity Log', href: '/audit-logs', icon: History },
      { name: 'Roles & Permissions', href: '/roles', icon: Shield },
      { name: 'Staff Team & Logins', href: '/admin-users', icon: Users },
      { name: 'Store Settings', href: '/settings', icon: Settings }
    ]
  }
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col h-screen sticky top-0 overflow-y-auto shadow-sm">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center space-x-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 via-brand-500 to-amber-600 p-0.5 shadow-md shadow-brand-500/20">
          <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950 font-display text-sm font-bold text-brand-300">
            D
          </div>
        </div>
        <div>
          <div className="font-display text-sm font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
            DIVISHA <span className="text-brand-600 font-semibold text-xs">OPERATIONS</span>
          </div>
          <div className="text-[10px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Super Admin Session</span>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-3 py-4 space-y-6">
        {NAVIGATION.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-3 text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-slate-950' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Profile Info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <div className="flex items-center justify-between text-xs">
          <div>
            <div className="font-bold text-slate-900">Divisha Executive</div>
            <div className="text-[10px] text-slate-500 font-mono">admin@divisha.com</div>
          </div>
          <span className="rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-mono text-amber-900 font-bold">
            ROOT
          </span>
        </div>
      </div>
    </aside>
  );
}
