'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  Package,
  MapPin,
  Heart,
  Plus,
  Trash2,
  CheckCircle2,
  Truck,
  ExternalLink,
  Shield,
  MessageSquare,
  LogOut,
  Edit3,
  X,
  Sparkles,
  ArrowRight,
  FileText,
  Printer
} from 'lucide-react';
import { AddressDTO, OrderDTO, WishlistItemDTO } from '@divisha/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function AccountDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';

  const { user, token, isLoggedIn, logout, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'addresses' | 'wishlist'>(
    (initialTab as any) || 'overview'
  );

  // Data states
  const [addresses, setAddresses] = useState<AddressDTO[]>([]);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItemDTO[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [viewInvoiceOrder, setViewInvoiceOrder] = useState<OrderDTO | null>(null);

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    type: 'HOME' as 'HOME' | 'WORK' | 'OTHER',
    isDefault: false
  });
  const [addressSaving, setAddressSaving] = useState(false);

  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'orders', 'addresses', 'wishlist'].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  // Load customer data when authenticated
  useEffect(() => {
    if (!token || !user) return;

    setProfileForm({
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || '',
      phone: user.phone || ''
    });

    const loadCustomerData = async () => {
      setLoadingData(true);
      try {
        const addrRes = await fetch(`${API_BASE}/v1/users/addresses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const addrData = await addrRes.json();
        if (addrData.success) {
          setAddresses(addrData.data || []);
        }

        const ordersRes = await fetch(`${API_BASE}/v1/orders/user/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const ordersData = await ordersRes.json();
        if (ordersData.success) {
          setOrders(ordersData.data || []);
        }

        const wishRes = await fetch(`${API_BASE}/v1/users/wishlist`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const wishData = await wishRes.json();
        if (wishData.success) {
          setWishlist(wishData.data || []);
        }
      } catch (e) {
        console.error('Failed to load user portal data', e);
      } finally {
        setLoadingData(false);
      }
    };

    loadCustomerData();
  }, [token, user]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setAddressSaving(true);
    try {
      const res = await fetch(`${API_BASE}/v1/users/addresses`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addressForm)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAddresses((prev) => [...prev, data.data]);
        setShowAddressModal(false);
        setAddressForm({
          name: '',
          phone: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          type: 'HOME',
          isDefault: false
        });
      }
    } catch (e) {
      console.error('Failed to save address', e);
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to remove this delivery address?')) return;
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/v1/users/addresses/${addressId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== addressId));
      }
    } catch (e) {
      console.error('Failed to delete address', e);
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/v1/users/addresses/${addressId}/default`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setAddresses((prev) =>
          prev.map((a) => ({
            ...a,
            isDefault: a.id === addressId
          }))
        );
      }
    } catch (e) {
      console.error('Failed to set default address', e);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setProfileSaving(true);
    try {
      const res = await fetch(`${API_BASE}/v1/users/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (data.success) {
        await refreshUser();
        setEditingProfile(false);
      }
    } catch (e) {
      console.error('Failed to update profile', e);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleRemoveWishlist = async (productId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/v1/users/wishlist/${productId}/toggle`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setWishlist((prev) => prev.filter((item) => item.productId !== productId));
      }
    } catch (e) {
      console.error('Failed to remove from wishlist', e);
    }
  };

  if (!isLoggedIn || !user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white border border-slate-200 text-brand-600 mb-6 shadow-sm">
          <User className="h-8 w-8" />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
          Client Authentication Required
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Please sign in to view your bespoke orders, privileged delivery status, and personal concierge services.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/account/login"
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-amber-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-md shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <span>Sign In to Account</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/account/signup"
            className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            Enroll in Privilege
          </Link>
        </div>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Client Header */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50/80 via-white to-stone-50 p-6 sm:p-10 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-br from-brand-400 via-brand-500 to-amber-600 p-0.5 shadow-md shadow-brand-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] sm:rounded-[22px] bg-slate-950 font-display text-2xl sm:text-3xl font-black text-brand-300">
                {user.profile?.firstName?.[0] || 'D'}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  {user.profile?.firstName} {user.profile?.lastName}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-mono">{user.email} • {user.phone || '+91 98201 23456'}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hello Divisha Support, I am ${user.profile?.firstName} ${user.profile?.lastName} (Account ID: ${user.id}). I need help.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-all"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Help</span>
            </a>

            <button
              onClick={() => {
                logout();
                router.push('/account/login');
              }}
              className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-all shadow-sm"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-200/80 pt-6">
          <div className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-sm">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">My Orders</p>
            <p className="text-lg sm:text-xl font-bold font-mono text-slate-900 mt-1">
              {orders.length || 1} Orders
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-sm">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Saved Addresses</p>
            <p className="text-lg sm:text-xl font-bold font-mono text-slate-900 mt-1">
              {addresses.length} Destinations
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-sm">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Curated Wishlist</p>
            <p className="text-lg sm:text-xl font-bold font-mono text-slate-900 mt-1">
              {wishlist.length} Products
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar gap-2 sm:gap-4">
        {[
          { id: 'overview', label: 'Client Profile', icon: User },
          { id: 'orders', label: 'Orders & Logistics', icon: Package, badge: orders.length || 1 },
          { id: 'addresses', label: 'Delivery Addresses', icon: MapPin, badge: addresses.length },
          { id: 'wishlist', label: 'Saved Wishlist', icon: Heart, badge: wishlist.length }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-brand-500 text-brand-700 bg-brand-50/60 rounded-t-xl font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                    isActive ? 'bg-brand-100 text-brand-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & PROFILE */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-brand-600" />
                  Personal Information
                </h2>
                <p className="text-xs text-slate-500">Maintain your contact details for white-glove communication</p>
              </div>

              {!editingProfile ? (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-brand-500 hover:text-brand-700 transition-all shadow-sm"
                >
                  <Edit3 className="h-3.5 w-3.5 text-brand-600" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  onClick={() => setEditingProfile(false)}
                  className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-all"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Cancel</span>
                </button>
              )}
            </div>

            {editingProfile ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Contact</label>
                  <input
                    type="tel"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none font-mono"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-sm hover:scale-105 transition-all cursor-pointer"
                  >
                    {profileSaving ? 'Saving Changes...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block font-mono">Full Name</span>
                  <span className="text-slate-900 font-bold mt-0.5 block">
                    {user.profile?.firstName} {user.profile?.lastName}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block font-mono">Registered Email</span>
                  <span className="text-slate-900 font-mono mt-0.5 block">{user.email}</span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block font-mono">WhatsApp Contact</span>
                  <span className="text-slate-900 font-mono mt-0.5 block">{user.phone || '+91 98201 23456'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS & LOGISTICS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-base font-bold text-slate-900">No Orders Found Yet</h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">Explore our curated collections of 4K OLEDs and handcrafted teak furniture.</p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-sm hover:scale-105 transition-all"
              >
                <span>Browse Flagships</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-base font-bold text-slate-900">{order.orderNumber}</span>
                      <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 uppercase tracking-wider font-mono">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-mono">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-500 block font-mono">Total Investment</span>
                    <span className="font-mono text-lg font-extrabold text-slate-900">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="py-6 space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="h-16 w-16 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{item.productName}</h4>
                          <p className="text-xs text-slate-500 mt-0.5 font-mono">{item.variantTitle} • Qty: {item.quantity}</p>
                          <span className="font-mono text-xs text-slate-800 font-semibold mt-1 block">
                            ₹{item.totalAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <a
                        href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi Divisha Logistics, inquiring about installation for Order ${order.orderNumber}: ${item.productName}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs text-emerald-700 font-semibold hover:bg-slate-50 transition-colors shadow-sm"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Schedule Setup</span>
                      </a>
                    </div>
                  ))}
                </div>

                {/* Shipment Tracker Bar */}
                {order.shipment && (
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 text-xs">
                        <Truck className="h-4 w-4 text-brand-600" />
                        <span className="font-medium text-slate-700">
                          {order.shipment.carrier} — Waybill: <strong className="font-mono text-slate-900">{order.shipment.trackingNumber}</strong>
                        </span>
                      </div>

                      <a
                        href={order.shipment.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-brand-700 font-semibold hover:underline"
                      >
                        <span>Live BlueDart Tracking</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Invoice & Order Actions Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="text-slate-500 font-mono">
                    Payment: <strong className="text-emerald-700">{order.paymentStatus}</strong> via {order.paymentMethod}
                  </div>

                  <button
                    onClick={() => setViewInvoiceOrder(order)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs text-slate-800 font-semibold hover:border-brand-500 hover:text-brand-700 hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5 text-brand-600" />
                    <span>Download Tax Invoice</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: SAVED ADDRESSES */}
      {activeTab === 'addresses' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Saved Delivery Destinations</h2>
              <p className="text-xs text-slate-500">Manage residential and workspace addresses for white-glove delivery</p>
            </div>

            <button
              onClick={() => setShowAddressModal(true)}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-sm hover:scale-105 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Address</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`relative rounded-3xl border p-6 transition-all ${
                  addr.isDefault
                    ? 'border-brand-500 bg-brand-50/50 shadow-sm'
                    : 'border-slate-200 bg-white shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700 uppercase">
                      {addr.type}
                    </span>
                    {addr.isDefault && (
                      <span className="flex items-center gap-1 rounded-lg bg-brand-100 border border-brand-200 px-2 py-0.5 text-[10px] font-bold text-brand-800 font-mono">
                        <CheckCircle2 className="h-3 w-3" /> DEFAULT
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className="text-[11px] text-brand-700 font-semibold hover:underline"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Delete Address"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-900">{addr.name}</h4>
                <p className="text-xs text-slate-700 mt-1">{addr.addressLine1}</p>
                {addr.addressLine2 && <p className="text-xs text-slate-500">{addr.addressLine2}</p>}
                <p className="text-xs text-slate-700 mt-0.5">
                  {addr.city}, {addr.state} — {addr.postalCode}
                </p>
                <p className="text-xs text-slate-500 mt-2 font-mono">Contact: {addr.phone}</p>
              </div>
            ))}
          </div>

          {/* Add Address Modal */}
          {showAddressModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
              <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-brand-600" />
                    Add Delivery Destination
                  </h3>
                  <button
                    onClick={() => setShowAddressModal(false)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveAddress} className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Name</label>
                      <input
                        type="text"
                        required
                        value={addressForm.name}
                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                        placeholder="Aarav Mehta"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        placeholder="+91 98201 11222"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Address Line 1 (Flat/House/Building)</label>
                    <input
                      type="text"
                      required
                      value={addressForm.addressLine1}
                      onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                      placeholder="Penthouse 42, Oberoi Sky City"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Address Line 2 (Street/Area)</label>
                    <input
                      type="text"
                      value={addressForm.addressLine2}
                      onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                      placeholder="Western Express Highway, Borivali East"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        placeholder="Mumbai"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        placeholder="Maharashtra"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code</label>
                      <input
                        type="text"
                        required
                        value={addressForm.postalCode}
                        onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                        placeholder="400066"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <label className="flex items-center gap-2 text-xs text-slate-700">
                      <input
                        type="radio"
                        name="addrType"
                        checked={addressForm.type === 'HOME'}
                        onChange={() => setAddressForm({ ...addressForm, type: 'HOME' })}
                      />
                      <span>Home</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-700">
                      <input
                        type="radio"
                        name="addrType"
                        checked={addressForm.type === 'WORK'}
                        onChange={() => setAddressForm({ ...addressForm, type: 'WORK' })}
                      />
                      <span>Work / Office</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-700">
                      <input
                        type="radio"
                        name="addrType"
                        checked={addressForm.type === 'OTHER'}
                        onChange={() => setAddressForm({ ...addressForm, type: 'OTHER' })}
                      />
                      <span>Other</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddressModal(false)}
                      className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addressSaving}
                      className="rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-sm hover:scale-105"
                    >
                      {addressSaving ? 'Saving...' : 'Save Address'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: WISHLIST */}
      {activeTab === 'wishlist' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Curated Wishlist</h2>
              <p className="text-xs text-slate-500">Items saved for your future architectural and acoustic setups</p>
            </div>
          </div>

          {wishlist.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <Heart className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-base font-bold text-slate-900">Your Wishlist is Empty</h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">Browse our flagship catalog and click the heart icon on any design to save it here.</p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:scale-105 transition-all shadow-sm"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-slate-100 border border-slate-200">
                      <img
                        src={item.imageUrl}
                        alt={item.productTitle}
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={() => handleRemoveWishlist(item.productId)}
                        className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-all shadow-sm"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 line-clamp-2">{item.productTitle}</h4>
                    <p className="font-mono text-sm font-bold text-brand-700 mt-2">
                      ₹{(item.salePrice || item.price).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-3">
                    <Link
                      href={`/product/${item.productSlug}`}
                      className="flex-1 text-center rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 py-2.5 text-xs font-bold text-slate-950 hover:scale-105 transition-all shadow-sm"
                    >
                      View Product
                    </Link>
                    <a
                      href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi Divisha Team, I'm interested in ${item.productTitle}. Can you arrange a demonstration?`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-slate-300 bg-white p-2.5 text-emerald-700 hover:bg-emerald-50 transition-colors shadow-sm"
                      title="Inquire on WhatsApp"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Tax Invoice Modal */}
      {viewInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-5">
              <div>
                <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-0.5 text-[10px] font-mono font-bold uppercase text-emerald-800">
                  ORIGINAL TAX INVOICE
                </span>
                <h3 className="font-display text-2xl font-black text-slate-900 mt-2">DIVISHA ELECTRONICS</h3>
                <p className="text-xs text-slate-500 font-mono">
                  Divisha Tower, A.B. Road, Indore (MP) 452010 • GSTIN: 23AABCD1234F1Z5
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print / Save PDF</span>
                </button>

                <button
                  onClick={() => setViewInvoiceOrder(null)}
                  className="rounded-full border border-slate-200 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Invoice Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono">
              <div>
                <span className="text-slate-500 uppercase text-[10px]">Invoice Number</span>
                <p className="font-bold text-slate-900 mt-0.5">INV-{viewInvoiceOrder.orderNumber}</p>
              </div>
              <div>
                <span className="text-slate-500 uppercase text-[10px]">Order Date</span>
                <p className="font-bold text-slate-900 mt-0.5">{new Date(viewInvoiceOrder.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
              <div>
                <span className="text-slate-500 uppercase text-[10px]">Payment Method</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewInvoiceOrder.paymentMethod} ({viewInvoiceOrder.paymentStatus})</p>
              </div>
              <div>
                <span className="text-slate-500 uppercase text-[10px]">Order Status</span>
                <p className="font-bold text-emerald-700 mt-0.5">{viewInvoiceOrder.status}</p>
              </div>
            </div>

            {/* Bill To & Ship To */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                <strong className="text-slate-900 font-semibold block mb-1">Customer / Billed To:</strong>
                <p className="text-slate-800 font-medium">{viewInvoiceOrder.customerName}</p>
                <p className="text-slate-600 font-mono text-[11px]">{viewInvoiceOrder.customerEmail}</p>
                <p className="text-slate-600 font-mono text-[11px]">{viewInvoiceOrder.customerPhone}</p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                <strong className="text-slate-900 font-semibold block mb-1">Shipped To:</strong>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  {viewInvoiceOrder.shippingAddress?.addressLine1}, {viewInvoiceOrder.shippingAddress?.addressLine2}<br />
                  {viewInvoiceOrder.shippingAddress?.city}, {viewInvoiceOrder.shippingAddress?.state} - {viewInvoiceOrder.shippingAddress?.postalCode}
                </p>
                {viewInvoiceOrder.shipment && (
                  <p className="mt-2 text-[10px] font-mono text-slate-500">
                    Carrier: {viewInvoiceOrder.shipment.carrier} • AWB: {viewInvoiceOrder.shipment.trackingNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-mono uppercase text-[10px] text-slate-500">
                  <tr>
                    <th className="p-3">Item Description</th>
                    <th className="p-3">HSN Code</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">GST (18%)</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {viewInvoiceOrder.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3 font-sans font-medium text-slate-900">
                        {it.productName}
                        <span className="block text-[10px] text-slate-500 font-mono">{it.variantTitle}</span>
                      </td>
                      <td className="p-3 text-slate-500">8528</td>
                      <td className="p-3 text-center font-bold">{it.quantity}</td>
                      <td className="p-3 text-right">₹{Math.round(it.unitPrice / 1.18).toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right text-slate-500">₹{Math.round(it.totalAmount - (it.totalAmount / 1.18)).toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right font-bold text-slate-900">₹{it.totalAmount.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="flex justify-end">
              <div className="w-72 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>₹{viewInvoiceOrder.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (IGST 18%):</span>
                  <span>₹{viewInvoiceOrder.taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery & Installation:</span>
                  <span className="text-emerald-700 font-semibold">{viewInvoiceOrder.shippingAmount === 0 ? 'FREE' : `₹${viewInvoiceOrder.shippingAmount}`}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900">
                  <span>Total Amount Paid:</span>
                  <span className="text-brand-700 font-extrabold">₹{viewInvoiceOrder.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Footer Terms */}
            <div className="border-t border-slate-100 pt-4 text-[11px] text-slate-400 font-mono text-center">
              This is a computer generated invoice and requires no physical signature. Registered under Madhya Pradesh GST jurisdiction.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-20 text-slate-500 text-sm">Loading Your Account...</div>}>
      <AccountDashboard />
    </Suspense>
  );
}
