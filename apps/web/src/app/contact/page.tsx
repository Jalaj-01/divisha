'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  CheckCircle2,
  Building2,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'General Question',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setForm({
        name: '',
        email: '',
        phone: '',
        inquiryType: 'General Question',
        message: ''
      });
    }, 700);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500 font-mono">
        <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-brand-700 font-semibold">Contact Us</span>
      </nav>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 px-3.5 py-1 text-xs font-semibold text-brand-800">
          <Building2 className="h-3.5 w-3.5 text-brand-600" />
          <span>CUSTOMER SUPPORT & STORE LOCATION</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
          How Can We Help You?
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Have a question about an OLED TV, home appliance, or an existing order? Get in touch with our team via WhatsApp, phone, email, or visit our flagship store in Indore.
        </p>
      </div>

      {/* Grid: Contact Form + Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Contact Form */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="font-display text-xl font-bold text-slate-900">Send Us a Message</h2>
            <p className="text-xs text-slate-500 mt-1">We typically reply within 1 to 2 business hours.</p>
          </div>

          {submitted ? (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center space-y-3">
              <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
              <h3 className="font-display text-lg font-bold text-emerald-950">Thank You! Your Message Was Sent</h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Our customer support team has received your inquiry and will reach out to you shortly via phone or email.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 inline-block text-xs font-semibold text-emerald-700 underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Inquiry Topic</label>
                  <select
                    value={form.inquiryType}
                    onChange={(e) => setForm({ ...form, inquiryType: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none transition-all"
                  >
                    <option value="General Question">General Question</option>
                    <option value="OLED TV & Audio Consultation">OLED TV & Audio Consultation</option>
                    <option value="Smart Refrigerators & ACs">Smart Refrigerators & ACs</option>
                    <option value="Order Status & Delivery">Order Status & Delivery</option>
                    <option value="Warranty & Service">Warranty & Service</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell us what you are looking for or how we can assist..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-8 py-3.5 text-xs font-bold text-slate-950 shadow-md shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Store & Direct Connect Cards */}
        <div className="lg:col-span-5 space-y-5">
          {/* Quick WhatsApp Support Card */}
          <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900 text-base">Direct WhatsApp Support</h3>
                <p className="text-xs text-emerald-800 font-medium">Instant replies from our product specialists</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Prefer chatting on WhatsApp? Message us directly for real-time photos, best offers, stock availability, and delivery updates.
            </p>
            <a
              href="https://wa.me/919876543210?text=Hello%20Divisha%20Support%2C%20I%20have%20an%20inquiry%20regarding%20products%20and%20orders."
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-500 hover:scale-[1.01] transition-all"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Chat with Support on WhatsApp</span>
            </a>
          </div>

          {/* Location & Store Office Details */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-brand-700 border border-amber-200">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900 text-sm">Indore Store & Head Office</h3>
                <span className="text-[11px] font-mono text-slate-500">Madhya Pradesh, India</span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-2.5">
                <Building2 className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="font-semibold text-slate-900">Address:</strong>
                  <p className="text-slate-600 mt-0.5">
                    Divisha Tower, A.B. Road, Vijay Nagar, Indore, Madhya Pradesh - 452010
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="font-semibold text-slate-900">Working Hours:</strong>
                  <p className="text-slate-600 mt-0.5">Monday to Sunday, 10:00 AM – 9:00 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="font-semibold text-slate-900">Phone Support:</strong>
                  <p className="font-mono text-slate-600 mt-0.5">+91 98765 43210 / +91 731 4001234</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="font-semibold text-slate-900">Email:</strong>
                  <p className="font-mono text-slate-600 mt-0.5">support@divisha.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
