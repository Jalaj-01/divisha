'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building2,
  Lock,
  Phone,
  Save,
  Check,
  Megaphone,
  Sparkles,
  MapPin,
  CheckCircle2
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function StoreSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Storefront Announcement & Badges (Live on Storefront)
  const [announcementText, setAnnouncementText] = useState('Authorized Flagship Partner: Sony • Samsung • LG');
  const [promoText, setPromoText] = useState('Flat 10% Off with Code DIVISHA10 • Free Delivery & Installation');
  const [badgeText, setBadgeText] = useState('DIVISHA SIGNATURE 2026 COLLECTION');
  const [phone, setPhone] = useState('+91 98765 43210');

  // Form State reflecting Indore MP statutory requirements
  const [companyName, setCompanyName] = useState('Divisha Electronics & Living Private Limited');
  const [gstin, setGstin] = useState('23AABCD1234F1Z5');
  const [addressLine, setAddressLine] = useState('Divisha Tower, A.B. Road, Vijay Nagar');
  const [city, setCity] = useState('Indore');
  const [state, setState] = useState('Madhya Pradesh');
  const [pincode, setPincode] = useState('452010');
  const [supportPhone, setSupportPhone] = useState('+91 98765 43210');
  const [supportEmail, setSupportEmail] = useState('support@divishaelectronics.com');

  // Integrations State
  const [razorpayKeyId, setRazorpayKeyId] = useState('rzp_test_divisha_live_sim');
  const [blueDartClientId, setBlueDartClientId] = useState('BD_INDORE_APEX_9812');
  const [whatsappPhone, setWhatsappPhone] = useState('+91 98765 43210');

  // Load existing settings from API
  useEffect(() => {
    fetch(`${API_BASE}/v1/cms/settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          if (data.data.announcementText || data.data.announcementPartnerText) {
            setAnnouncementText(data.data.announcementText || data.data.announcementPartnerText);
          }
          if (data.data.promoText || data.data.announcementPromoText) {
            setPromoText(data.data.promoText || data.data.announcementPromoText);
          }
          if (data.data.badgeText || data.data.heroBadgeText) {
            setBadgeText(data.data.badgeText || data.data.heroBadgeText);
          }
          if (data.data.phone || data.data.supportPhone) {
            setPhone(data.data.phone || data.data.supportPhone);
          }
        }
      })
      .catch((err) => console.log('Could not load live settings', err));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${API_BASE}/v1/cms/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcementText,
          promoText,
          badgeText,
          phone,
          companyName,
          gstin,
          supportEmail
        })
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('Failed to save settings', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-brand-700 border border-amber-200 shadow-sm">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
                  Store Settings & Banners
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync to Website
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Edit the announcement bar, hero collection badge, store address, GSTIN, and customer support contact details.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-sm hover:scale-[1.02] transition-all cursor-pointer self-start md:self-auto"
        >
          {saved ? <Check className="h-4 w-4 text-emerald-950" /> : <Save className="h-4 w-4" />}
          <span>{saved ? 'Changes Saved!' : loading ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {saved && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Settings saved successfully! Announcement bar and badges updated live on your storefront.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* EDITABLE ANNOUNCEMENT BAR & HERO BADGE */}
        <div className="rounded-2xl border border-brand-200 bg-white p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Megaphone className="h-4 w-4 text-brand-600" />
              <span>Storefront Announcement Bar & Hero Badge</span>
            </div>
            <span className="text-[11px] font-semibold text-brand-800 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full w-fit">
              Updates Top of Website & Homepage
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Top Announcement Text (Brand Partners)
              </label>
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Authorized Flagship Partner: Sony • Samsung • LG"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">Shown on top left of the announcement bar</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">
                Special Offer Promo Text
              </label>
              <input
                type="text"
                value={promoText}
                onChange={(e) => setPromoText(e.target.value)}
                placeholder="Flat 10% Off with Code DIVISHA10 • Free Delivery & Installation"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">Shown in the middle of the announcement bar</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Hero Banner Badge Text
              </label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="DIVISHA SIGNATURE 2026 COLLECTION"
                className="mt-1.5 w-full rounded-xl border border-amber-300 bg-amber-50/40 p-2.5 text-xs text-amber-900 font-bold focus:bg-white focus:border-amber-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">Shown in the pill badge on the homepage hero banner</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-emerald-600" />
                Announcement Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:border-brand-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">Shown on top right of website</p>
            </div>
          </div>
        </div>

        {/* Store Location & Statutory Details */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            <Building2 className="h-4 w-4 text-brand-600" />
            <span>Store Details & Address (Indore Store)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Registered Business Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">GSTIN (Madhya Pradesh)</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-brand-300 bg-brand-50/40 p-2.5 text-xs text-brand-900 font-mono font-bold focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Store Address</label>
              <input
                type="text"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">City / Pincode</label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Customer Support Channels */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            <Phone className="h-4 w-4 text-brand-600" />
            <span>Customer Support Contacts</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Customer Helpline Phone</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Customer Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* API Credentials */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            <Lock className="h-4 w-4 text-emerald-600" />
            <span>Payment Gateway & Courier Accounts</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Razorpay Key ID</label>
              <input
                type="text"
                value={razorpayKeyId}
                onChange={(e) => setRazorpayKeyId(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">BlueDart Account Code</label>
              <input
                type="text"
                value={blueDartClientId}
                onChange={(e) => setBlueDartClientId(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">WhatsApp Business Number</label>
              <input
                type="text"
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
