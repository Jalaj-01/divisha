'use client';

import React, { useState } from 'react';
import { MessageSquare, Phone, X, Headphones, Armchair, Tv, ArrowRight, ShieldCheck } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  description: string;
  phone: string;
  hours: string;
  icon: any;
}

const DEPARTMENTS: Department[] = [
  {
    id: 'dept-sales',
    name: 'Sales & Orders Support',
    description: 'Product pricing, stock check, EMI assistance & order booking',
    phone: '+919876543210',
    hours: '9:00 AM - 9:00 PM IST',
    icon: Headphones
  },
  {
    id: 'dept-furniture',
    name: 'Furniture Planning',
    description: 'Custom dimensions, wood choices, upholstery & room layout',
    phone: '+919876543211',
    hours: '10:00 AM - 8:00 PM IST',
    icon: Armchair
  },
  {
    id: 'dept-tech',
    name: 'Electronics & Installation',
    description: '4K OLED wall-mounting, audio setup & free professional installation',
    phone: '+919876543212',
    hours: '9:00 AM - 8:00 PM IST',
    icon: Tv
  }
];

export function WhatsAppConcierge() {
  const [isOpen, setIsOpen] = useState(false);

  const handleChat = (dept: Department) => {
    const raw = dept.phone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `Hello Divisha Electronics! I am reaching out to *${dept.name}* regarding an inquiry on the online store.`
    );
    try {
      fetch('http://localhost:4000/v1/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'WHATSAPP_INQUIRY',
          entityType: 'SUPPORT',
          metadata: { departmentId: dept.id, departmentName: dept.name }
        })
      }).catch(() => {});
    } catch (_) {}
    window.open(`https://wa.me/${raw}?text=${msg}`, '_blank');
  };

  const handleCall = (dept: Department) => {
    const raw = dept.phone.replace(/[^0-9]/g, '');
    try {
      fetch('http://localhost:4000/v1/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'WHATSAPP_CALL',
          entityType: 'SUPPORT',
          metadata: { departmentId: dept.id, departmentName: dept.name, phone: dept.phone }
        })
      }).catch(() => {});
    } catch (_) {}
    window.location.href = `tel:${raw}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Support Modal */}
      {isOpen && (
        <div className="mb-4 w-96 rounded-3xl bg-white border border-slate-200/90 p-5 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                <MessageSquare className="h-4 w-4" />
                <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
              </div>
              <div>
                <h4 className="font-display font-bold text-slate-900 text-sm tracking-wide">
                  Divisha Customer Support
                </h4>
                <p className="text-xs text-emerald-700 flex items-center gap-1 font-mono font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Online • Specialists Available
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-3 text-xs text-slate-600 leading-relaxed">
            Connect directly with our acoustic engineers and furniture artisans on WhatsApp or place a direct priority call.
          </p>

          <div className="mt-4 space-y-2.5">
            {DEPARTMENTS.map((dept) => {
              const Icon = dept.icon;
              return (
                <div
                  key={dept.id}
                  className="group rounded-2xl border border-slate-200 bg-slate-50 p-3 hover:border-brand-500/50 hover:bg-white hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-xl bg-brand-50 p-2 text-brand-600 border border-brand-200/60 group-hover:scale-105 transition-transform">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{dept.name}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{dept.description}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between border-t border-slate-200/60 pt-2">
                    <span className="text-[10px] text-slate-500 font-mono">{dept.hours}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCall(dept)}
                        title="Direct Voice Call"
                        className="flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
                      >
                        <Phone className="h-3 w-3 text-brand-600" />
                        Call
                      </button>
                      <button
                        onClick={() => handleChat(dept)}
                        className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-emerald-500 shadow-sm transition-all"
                      >
                        <MessageSquare className="h-3 w-3" />
                        Chat
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1 text-brand-700 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" /> Direct Brand Warranty
            </span>
            <span className="font-mono">Toll-Free: 1800-DIVISHA</span>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex h-14 items-center gap-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-5 text-white shadow-xl shadow-emerald-950/20 hover:from-emerald-500 hover:to-teal-500 hover:scale-105 active:scale-95 transition-all duration-200 border border-emerald-400/30"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <MessageSquare className="h-4 w-4" />
        </div>
        <div className="text-left font-display">
          <div className="text-[10px] uppercase tracking-wider text-emerald-100 font-semibold">Customer Support</div>
          <div className="text-xs font-bold flex items-center gap-1">
            WhatsApp & Call <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </button>
    </div>
  );
}
