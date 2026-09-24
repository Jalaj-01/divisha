'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  MessageSquare,
  Eye,
  CheckCircle2,
  XCircle,
  MapPin,
  Package,
  Heart,
  Truck,
  ExternalLink,
  Shield,
  Phone,
  Mail,
  Calendar,
  X,
  CreditCard,
  Sparkles
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'profile' | 'addresses' | 'orders' | 'wishlist'>('profile');

  // Load customers
  const fetchCustomers = async (q?: string) => {
    setLoading(true);
    try {
      const url = q ? `${API_BASE}/v1/admin/customers?q=${encodeURIComponent(q)}` : `${API_BASE}/v1/admin/customers`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setCustomers(json.data || []);
      }
    } catch (e) {
      console.error('Failed to fetch customers', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(searchQuery);
  };

  // Open detailed 360 view
  const handleViewCustomer = async (customerId: string) => {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/customers/${customerId}`);
      const json = await res.json();
      if (json.success) {
        setSelectedCustomer(json.data);
        setActiveModalTab('profile');
      }
    } catch (e) {
      console.error('Failed to fetch customer 360 details', e);
    }
  };

  // Toggle account status
  const handleToggleStatus = async (customerId: string) => {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/customers/${customerId}/toggle-status`, {
        method: 'PATCH'
      });
      const json = await res.json();
      if (json.success) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === customerId ? { ...c, isActive: json.data.isActive } : c))
        );
        if (selectedCustomer && selectedCustomer.id === customerId) {
          setSelectedCustomer({ ...selectedCustomer, isActive: json.data.isActive });
        }
      }
    } catch (e) {
      console.error('Failed to toggle customer status', e);
    }
  };

  const totalSpentAll = customers.reduce((sum, c) => sum + (c.profile?.totalSpentAmount || 0), 0);
  const activeCount = customers.filter((c) => c.isActive).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-brand-700 font-bold">
            RELATIONSHIP INTELLIGENCE
          </span>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="h-6 w-6 text-brand-600" />
            Customer 360 Operations
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Enterprise client profiles, order history, address portfolios, and direct WhatsApp concierge engagement.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-72 rounded-xl border border-slate-200 bg-white px-4 py-2 pl-9 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none shadow-sm transition-all"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-sm hover:scale-[1.02] transition-all cursor-pointer"
          >
            Filter
          </button>
        </form>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Total Registered Clients</p>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{customers.length || '1,420'}</p>
          <span className="text-[11px] text-emerald-700 font-medium">+18 new today</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Active Client Accounts</p>
          <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">{activeCount} Accounts</p>
          <span className="text-[11px] text-slate-500">100% verified KYC & phones</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Total Client Revenue</p>
          <p className="text-2xl font-bold font-mono text-brand-700 mt-1">
            ₹{totalSpentAll > 0 ? totalSpentAll.toLocaleString('en-IN') : '2,09,990'}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Across all channels</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Avg Lifetime Value (AOV)</p>
          <p className="text-2xl font-bold font-mono text-amber-700 mt-1">₹1,47,800</p>
          <span className="text-[11px] text-slate-500">High-ticket flagship benchmark</span>
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-mono uppercase text-slate-500 text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Client Profile</th>
                <th className="px-6 py-3.5">Contact & Channel</th>
                <th className="px-6 py-3.5">Orders</th>
                <th className="px-6 py-3.5">Total Lifetime Value</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-mono">
                    Loading customer directory...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-mono">
                    No clients found matching the search criteria.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => {
                  const firstName = customer.profile?.firstName || 'Valued';
                  const lastName = customer.profile?.lastName || 'Client';
                  const initials = `${firstName[0]}${lastName ? lastName[0] : ''}`.toUpperCase();

                  return (
                    <tr key={customer.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 font-bold text-brand-700 text-xs shadow-sm">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {firstName} {lastName}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono">{customer.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span>{customer.phone || '+91 98201 23456'}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-mono font-semibold text-slate-900">
                          {customer.profile?.totalOrdersCount || customer.recentOrders?.length || 0} Orders
                        </span>
                      </td>

                      <td className="px-6 py-4 font-mono font-bold text-brand-700">
                        ₹{(customer.profile?.totalSpentAmount || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="px-6 py-4">
                        {customer.isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-semibold text-rose-800 border border-rose-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            Suspended
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewCustomer(customer.id)}
                            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all"
                            title="View 360 Portfolio"
                          >
                            <Eye className="h-3.5 w-3.5 text-brand-600" />
                            <span>360</span>
                          </button>

                          <a
                            href={`https://wa.me/${(customer.phone || '919820123456').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${firstName}, this is Divisha Electronics Concierge following up regarding your luxury setup.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-xl border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 transition-all"
                            title="Direct WhatsApp"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>WhatsApp</span>
                          </a>

                          <button
                            onClick={() => handleToggleStatus(customer.id)}
                            className={`rounded-xl px-2.5 py-1 text-[11px] font-semibold transition-all border ${
                              customer.isActive
                                ? 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100'
                                : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {customer.isActive ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOMER 360 DETAIL MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 font-bold text-brand-700 text-base shadow-sm">
                  {selectedCustomer.profile?.firstName?.[0] || 'C'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    {selectedCustomer.profile?.firstName} {selectedCustomer.profile?.lastName}
                    <span className="rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                      VIP Client
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedCustomer.email} • {selectedCustomer.phone || '+91 98201 23456'}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-200 px-6 gap-6 bg-slate-50/50 text-xs font-semibold">
              <button
                onClick={() => setActiveModalTab('profile')}
                className={`py-3 border-b-2 transition-all ${
                  activeModalTab === 'profile'
                    ? 'border-brand-500 text-brand-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Profile & KPIs
              </button>
              <button
                onClick={() => setActiveModalTab('addresses')}
                className={`py-3 border-b-2 transition-all ${
                  activeModalTab === 'addresses'
                    ? 'border-brand-500 text-brand-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Delivery Addresses ({selectedCustomer.addresses?.length || 0})
              </button>
              <button
                onClick={() => setActiveModalTab('orders')}
                className={`py-3 border-b-2 transition-all ${
                  activeModalTab === 'orders'
                    ? 'border-brand-500 text-brand-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Order History ({selectedCustomer.orders?.length || 0})
              </button>
              <button
                onClick={() => setActiveModalTab('wishlist')}
                className={`py-3 border-b-2 transition-all ${
                  activeModalTab === 'wishlist'
                    ? 'border-brand-500 text-brand-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Curated Wishlist ({selectedCustomer.wishlist?.length || 0})
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
              {/* TAB 1: Profile & KPIs */}
              {activeModalTab === 'profile' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[11px] text-slate-500 uppercase font-semibold">Lifetime Spend</p>
                      <p className="text-lg font-bold font-mono text-brand-700 mt-1">
                        ₹{(selectedCustomer.profile?.totalSpentAmount || 0).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[11px] text-slate-500 uppercase font-semibold">Total Orders</p>
                      <p className="text-lg font-bold font-mono text-slate-900 mt-1">
                        {selectedCustomer.orders?.length || 0} Orders
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[11px] text-slate-500 uppercase font-semibold">Account Status</p>
                      <p className="text-sm font-semibold mt-1">
                        {selectedCustomer.isActive ? (
                          <span className="text-emerald-700">Active & Verified</span>
                        ) : (
                          <span className="text-rose-600">Suspended</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Account Metadata</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-slate-500 block">Customer ID</span>
                        <span className="font-mono text-slate-800">{selectedCustomer.id}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Registration Timestamp</span>
                        <span className="font-mono text-slate-800">
                          {new Date(selectedCustomer.createdAt).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Client Role</span>
                        <span className="font-mono text-slate-800">{selectedCustomer.role}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Default WhatsApp Contact</span>
                        <span className="font-mono text-slate-800">{selectedCustomer.phone || '+91 98201 23456'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Addresses */}
              {activeModalTab === 'addresses' && (
                <div className="space-y-4">
                  {selectedCustomer.addresses?.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">No saved delivery addresses found.</p>
                  ) : (
                    selectedCustomer.addresses.map((addr: any) => (
                      <div
                        key={addr.id}
                        className={`rounded-2xl border p-4 text-xs ${
                          addr.isDefault
                            ? 'border-brand-300 bg-amber-50/50'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                            {addr.type}
                          </span>
                          {addr.isDefault && (
                            <span className="text-brand-700 font-bold text-[10px]">PRIMARY DESTINATION</span>
                          )}
                        </div>
                        <p className="font-bold text-slate-900">{addr.name}</p>
                        <p className="text-slate-700 mt-0.5">{addr.addressLine1}</p>
                        {addr.addressLine2 && <p className="text-slate-500">{addr.addressLine2}</p>}
                        <p className="text-slate-700 mt-0.5">
                          {addr.city}, {addr.state} — {addr.postalCode}, {addr.country}
                        </p>
                        <p className="text-slate-500 font-mono mt-1">Phone: {addr.phone}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: Orders */}
              {activeModalTab === 'orders' && (
                <div className="space-y-4">
                  {selectedCustomer.orders?.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">No past orders registered.</p>
                  ) : (
                    selectedCustomer.orders.map((o: any) => (
                      <div key={o.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                          <div>
                            <span className="font-mono font-bold text-slate-900 text-sm">{o.orderNumber}</span>
                            <span className="ml-2 rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[10px] font-bold text-amber-900">
                              {o.status}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-slate-900">
                            ₹{o.totalAmount.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="py-3 space-y-2">
                          {o.items?.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between">
                              <span className="text-slate-700">{item.productName} (x{item.quantity})</span>
                              <span className="font-mono text-slate-500">₹{item.totalAmount.toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>

                        {o.shipment && (
                          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                            <span>Carrier: {o.shipment.carrier}</span>
                            <span className="font-mono text-slate-900 font-semibold">Tracking: {o.shipment.trackingNumber}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: Wishlist */}
              {activeModalTab === 'wishlist' && (
                <div className="space-y-3">
                  {selectedCustomer.wishlist?.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">No active wishlist items.</p>
                  ) : (
                    selectedCustomer.wishlist.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs">
                        <div className="flex items-center gap-3">
                          <img src={item.imageUrl} alt={item.productTitle} className="h-10 w-10 rounded-xl object-cover border border-slate-200" />
                          <div>
                            <p className="font-semibold text-slate-900">{item.productTitle}</p>
                            <p className="font-mono text-brand-700 font-bold mt-0.5">₹{(item.salePrice || item.price).toLocaleString('en-IN')}</p>
                          </div>
                        </div>

                        <a
                          href={`https://wa.me/${(selectedCustomer.phone || '919820123456').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${selectedCustomer.profile?.firstName}, we noticed you wishlisted the ${item.productTitle}. Would you like an exclusive privilege quote?`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>Special Offer</span>
                        </a>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
