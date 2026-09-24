'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  ArrowRight,
  MessageSquare,
  FileText
} from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'ORD-IND-2026-9021';

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Success Hero Header */}
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-8 sm:p-12 text-center shadow-sm space-y-4">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
            Payment Successful & Verified
          </span>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Thank You! Your Order is Confirmed
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-lg mx-auto">
            We have received your order and our team has started preparing your items for delivery and installation.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-2xl bg-white border border-emerald-200 px-5 py-2.5 font-mono text-xs shadow-sm">
          <span className="text-slate-500">Order Reference:</span>
          <span className="font-bold text-slate-900">{orderId}</span>
        </div>
      </div>

      {/* Delivery Steps Timeline */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
        <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
          <Truck className="h-5 w-5 text-emerald-600" />
          Delivery Status Tracker
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
            <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">Step 1</span>
            <p className="font-bold text-emerald-950 text-xs mt-0.5">Order Confirmed</p>
            <p className="text-[11px] text-emerald-800 mt-1">Payment verified & locked</p>
          </div>

          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
            <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block">Step 2</span>
            <p className="font-bold text-amber-950 text-xs mt-0.5">Packing & Prep</p>
            <p className="text-[11px] text-amber-800 mt-1">Warehouse inspection</p>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 opacity-75">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Step 3</span>
            <p className="font-bold text-slate-900 text-xs mt-0.5">Dispatched</p>
            <p className="text-[11px] text-slate-500 mt-1">Courier tracking sent</p>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 opacity-75">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Step 4</span>
            <p className="font-bold text-slate-900 text-xs mt-0.5">Delivered</p>
            <p className="text-[11px] text-slate-500 mt-1">Setup at your address</p>
          </div>
        </div>
      </div>

      {/* Order Details Summary Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4 text-xs">
        <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Package className="h-5 w-5 text-brand-600" />
          Order Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
              <Calendar className="h-3.5 w-3.5" />
              <span>Expected Delivery</span>
            </div>
            <p className="font-bold text-slate-900 text-sm">Within 2 - 3 Business Days</p>
            <p className="text-slate-500 text-[11px]">Free delivery & installation</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
              <CreditCard className="h-3.5 w-3.5" />
              <span>Payment Mode</span>
            </div>
            <p className="font-bold text-slate-900 text-sm">Online Payment</p>
            <p className="text-emerald-700 font-medium text-[11px]">Razorpay 100% Verified</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
              <MapPin className="h-3.5 w-3.5" />
              <span>Delivery Address</span>
            </div>
            <p className="font-bold text-slate-900 text-sm">Aarav Mehta</p>
            <p className="text-slate-600 text-[11px]">Vijay Nagar, Indore, MP - 452010</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <Link
          href="/account?tab=orders"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-amber-500 px-6 py-3 text-xs font-bold text-slate-950 shadow-md hover:scale-105 transition-all"
        >
          <FileText className="h-4 w-4" />
          <span>View My Orders & Invoices</span>
        </Link>

        <a
          href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hello Divisha Support, I have a question regarding my order ${orderId}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-6 py-3 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-all"
        >
          <MessageSquare className="h-4 w-4 text-emerald-600" />
          <span>WhatsApp Support for this Order</span>
        </a>

        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading order confirmation...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
