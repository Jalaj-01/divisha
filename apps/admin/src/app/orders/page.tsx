'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  AlertCircle,
  FileText,
  Phone,
  MessageSquare,
  X,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Printer,
  Copy,
  ExternalLink,
  Ban
} from 'lucide-react';
import { OrderDTO, OrderStatus, PaymentStatus, ShipmentStatus } from '@divisha/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Selected Order for Slide-over Drawer
  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);
  const [transitionNotes, setTransitionNotes] = useState('');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [carrierInput, setCarrierInput] = useState('BlueDart Express White-Glove');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Invoice Modal State
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch(`${API_BASE}/v1/orders?limit=100`);
      if (res.ok) {
        const json = await res.json();
        const data = json.data?.items || json.data || json.items || [];
        setOrders(data);
        if (selectedOrder) {
          const updated = data.find((o: OrderDTO) => o.id === selectedOrder.id);
          if (updated) setSelectedOrder(updated);
        }
      }
    } catch (e) {
      console.error('Failed to load orders', e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Auto-sync polling every 4 seconds for new customer orders
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (selectedStatus !== 'ALL' && o.status !== selectedStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNumber = o.orderNumber.toLowerCase().includes(q);
      const matchCustomer = o.customerName.toLowerCase().includes(q);
      const matchPhone = o.customerPhone.includes(q);
      const matchTracking = o.shipment?.trackingNumber?.toLowerCase().includes(q);
      return matchNumber || matchCustomer || matchPhone || matchTracking;
    }
    return true;
  });

  // KPI Calculations
  const totalOrdersCount = orders.length;
  const pendingDispatchCount = orders.filter((o) =>
    ['CONFIRMED', 'PROCESSING', 'PACKED'].includes(o.status)
  ).length;
  const inTransitCount = orders.filter((o) =>
    ['SHIPPED', 'OUT_FOR_DELIVERY'].includes(o.status)
  ).length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  // Status transition handler
  const handleTransitionStatus = async (nextStatus: OrderStatus) => {
    if (!selectedOrder) return;
    setIsUpdatingStatus(true);
    setStatusMessage(null);

    try {
      const payload: any = {
        status: nextStatus,
        notes: transitionNotes || `Order transitioned to ${nextStatus} via fulfillment console`,
        carrier: carrierInput,
        trackingNumber: trackingNumberInput,
        adminId: 'admin-fulfillment-lead'
      };

      const res = await fetch(`${API_BASE}/v1/orders/${selectedOrder.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (res.ok) {
        setStatusMessage(`Order successfully advanced to ${nextStatus}!`);
        setTransitionNotes('');
        await fetchOrders();
      } else {
        setStatusMessage(`Error: ${json.message || 'Transition rejected by state machine'}`);
      }
    } catch (e: any) {
      setStatusMessage(`Network error: ${e.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Open GST Invoice
  const handleViewInvoice = async (orderId: string) => {
    setLoadingInvoice(true);
    setShowInvoiceModal(true);
    try {
      const res = await fetch(`${API_BASE}/v1/orders/${orderId}/invoice`);
      const json = await res.json();
      if (res.ok && json.invoice) {
        setInvoiceData(json.invoice);
      }
    } catch (e) {
      console.error('Failed to load invoice', e);
    } finally {
      setLoadingInvoice(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case OrderStatus.CONFIRMED:
        return 'bg-sky-100 text-sky-900 border-sky-300';
      case OrderStatus.PROCESSING:
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      case OrderStatus.PACKED:
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case OrderStatus.SHIPPED:
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case OrderStatus.OUT_FOR_DELIVERY:
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 animate-pulse';
      case OrderStatus.DELIVERED:
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
      case OrderStatus.CANCELLED:
        return 'bg-rose-100 text-rose-900 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-700 font-bold">
              CUSTOMER ORDERS
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync (Auto-refreshes every 4s)
            </span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Orders & Shipments
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            Track customer orders in real-time, update shipping status, and generate GST invoices.
          </p>
        </div>
      </div>

      {/* KPI Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-bold uppercase">
            <span>Total Orders</span>
            <ShoppingCart className="h-4 w-4 text-brand-600" />
          </div>
          <div className="mt-2 font-display text-2xl font-extrabold text-slate-900 font-mono">{totalOrdersCount}</div>
          <p className="mt-1 text-[11px] text-slate-500">Across all catalog categories</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-bold uppercase">
            <span>Pending Dispatch</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 font-display text-2xl font-extrabold text-amber-700 font-mono">{pendingDispatchCount}</div>
          <p className="mt-1 text-[11px] text-amber-800">Requires warehouse packing/pick</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-bold uppercase">
            <span>In-Transit Shipments</span>
            <Truck className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 font-display text-2xl font-extrabold text-blue-700 font-mono">{inTransitCount}</div>
          <p className="mt-1 text-[11px] text-blue-800">With BlueDart White-Glove Air</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-bold uppercase">
            <span>Fulfilled Revenue</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 font-display text-2xl font-extrabold text-emerald-800 font-mono">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Excludes cancelled orders</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between rounded-2xl bg-white p-4 border border-slate-200/90 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order # (e.g. DIV-2026-98326), client, mobile, or BlueDart AWB..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-all font-mono"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          {['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`rounded-xl px-3 py-1.5 font-medium transition-all ${
                selectedStatus === st
                  ? 'bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-mono uppercase text-slate-500 text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Order Reference</th>
                <th className="py-3.5 px-4 font-semibold">Client</th>
                <th className="py-3.5 px-4 font-semibold">Items</th>
                <th className="py-3.5 px-4 font-semibold">Total Amount</th>
                <th className="py-3.5 px-4 font-semibold">Payment</th>
                <th className="py-3.5 px-4 font-semibold">Order Status</th>
                <th className="py-3.5 px-4 font-semibold">Logistics</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-mono">
                    {loading ? 'Retrieving authoritative order ledger...' : 'No orders found matching the filter.'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const initials = o.customerName
                    ? o.customerName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                    : 'CL';

                  return (
                    <tr
                      key={o.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedOrder(o)}
                    >
                      {/* Order Number */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-brand-700">{o.orderNumber}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {new Date(o.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-800 border border-slate-200">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{o.customerName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{o.customerPhone}</div>
                          </div>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {o.items.slice(0, 2).map((item, idx) => (
                            <div
                              key={idx}
                              className="relative h-8 w-10 rounded bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0"
                              title={`${item.productName} (${item.variantTitle}) × ${item.quantity}`}
                            >
                              {item.imageUrl ? (
                                <Image src={item.imageUrl} alt="Item" fill unoptimized={true} className="object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-[8px] text-slate-500 font-bold">
                                  D
                                </div>
                              )}
                            </div>
                          ))}
                          {o.items.length > 2 && (
                            <span className="text-[11px] text-slate-500 font-mono">
                              +{o.items.length - 2} more
                            </span>
                          )}
                          <span className="text-slate-600 text-[11px] font-mono ml-1">
                            ({o.items.reduce((acc, i) => acc + i.quantity, 0)} pcs)
                          </span>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        ₹{o.totalAmount.toLocaleString('en-IN')}
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                            o.paymentStatus === PaymentStatus.SUCCESSFUL
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {o.paymentStatus}
                        </span>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase">
                          {o.paymentMethod}
                        </div>
                      </td>

                      {/* Order Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase ${getStatusBadge(
                            o.status
                          )}`}
                        >
                          {o.status}
                        </span>
                      </td>

                      {/* Logistics */}
                      <td className="py-3.5 px-4">
                        {o.shipment ? (
                          <div className="text-[11px] font-mono">
                            <span className="text-slate-900 font-semibold">{o.shipment.carrier}</span>
                            <div className="text-slate-500">{o.shipment.trackingNumber || 'Pending AWB'}</div>
                          </div>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400">Not Dispatched</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(o);
                          }}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 px-3 py-1.5 text-slate-700 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5 text-brand-600" />
                          <span>Fulfill</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SLIDE-OVER ORDER DETAIL DRAWER */}
      {/* ======================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-white border-l border-slate-200 h-full overflow-y-auto flex flex-col shadow-2xl">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-brand-700 font-bold">
                  ORDER FULFILLMENT CONTROLLER
                </span>
                <h3 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                  <span>{selectedOrder.orderNumber}</span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase ${getStatusBadge(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status}
                  </span>
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewInvoice(selectedOrder.id)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-mono font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  title="View GST Tax Invoice"
                >
                  <FileText className="h-3.5 w-3.5 text-brand-600" />
                  <span>Invoice</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6 flex-1 text-xs">
              {/* Status Message Toast */}
              {statusMessage && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-amber-900 font-mono">
                  {statusMessage}
                </div>
              )}

              {/* Client & Communication Shortcuts */}
              <div className="rounded-2xl p-4 border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 border border-amber-200 text-xs font-bold text-amber-900">
                      {selectedOrder.customerName[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{selectedOrder.customerName}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">{selectedOrder.customerEmail}</p>
                    </div>
                  </div>

                  {/* WhatsApp & Call Direct Action Buttons */}
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/${selectedOrder.customerPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                        selectedOrder.customerName
                      )}%2C%20this%20is%20Divisha%20Electronics%20Fulfillment%20Desk%20regarding%20your%20order%20${selectedOrder.orderNumber}.`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 rounded-xl bg-emerald-100 border border-emerald-300 px-3 py-1.5 font-bold text-emerald-900 hover:bg-emerald-200 transition-colors"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-700" />
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href={`tel:${selectedOrder.customerPhone}`}
                      className="flex items-center gap-1 rounded-xl bg-white border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5 text-brand-600" />
                      <span>Call</span>
                    </a>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-slate-600">
                  <span className="font-mono text-slate-500 uppercase text-[10px] font-bold">Delivery Destination:</span>
                  <p className="text-slate-800 mt-0.5">
                    {selectedOrder.shippingAddress?.addressLine1}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.postalCode}
                  </p>
                </div>
              </div>

              {/* State Machine Transition Controls */}
              <div className="rounded-2xl p-4 border border-slate-200 bg-white space-y-3">
                <span className="font-mono text-xs uppercase text-slate-500 font-bold block">
                  Authoritative State Machine Action
                </span>

                <div className="flex flex-wrap gap-2">
                  {selectedOrder.status === OrderStatus.PENDING && (
                    <button
                      onClick={() => handleTransitionStatus(OrderStatus.CONFIRMED)}
                      disabled={isUpdatingStatus}
                      className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
                    >
                      Advance: Confirm Order & Reserve Stock
                    </button>
                  )}

                  {selectedOrder.status === OrderStatus.CONFIRMED && (
                    <button
                      onClick={() => handleTransitionStatus(OrderStatus.PROCESSING)}
                      disabled={isUpdatingStatus}
                      className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors"
                    >
                      Advance: Mark in Processing
                    </button>
                  )}

                  {selectedOrder.status === OrderStatus.PROCESSING && (
                    <button
                      onClick={() => handleTransitionStatus(OrderStatus.PACKED)}
                      disabled={isUpdatingStatus}
                      className="rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-purple-500 transition-colors"
                    >
                      Advance: Mark Packed & Ready
                    </button>
                  )}

                  {selectedOrder.status === OrderStatus.PACKED && (
                    <button
                      onClick={() => handleTransitionStatus(OrderStatus.SHIPPED)}
                      disabled={isUpdatingStatus}
                      className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-colors"
                    >
                      Dispatch: BlueDart Express Air Ride
                    </button>
                  )}

                  {selectedOrder.status === OrderStatus.SHIPPED && (
                    <button
                      onClick={() => handleTransitionStatus(OrderStatus.OUT_FOR_DELIVERY)}
                      disabled={isUpdatingStatus}
                      className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
                    >
                      Advance: Out for Delivery
                    </button>
                  )}

                  {selectedOrder.status === OrderStatus.OUT_FOR_DELIVERY && (
                    <button
                      onClick={() => handleTransitionStatus(OrderStatus.DELIVERED)}
                      disabled={isUpdatingStatus}
                      className="rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition-colors"
                    >
                      Finalize: Confirm Delivery
                    </button>
                  )}

                  {/* Cancel Button if eligible */}
                  {!['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(selectedOrder.status) && (
                    <button
                      onClick={() => handleTransitionStatus(OrderStatus.CANCELLED)}
                      disabled={isUpdatingStatus}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                    >
                      Cancel & Restore Stock
                    </button>
                  )}
                </div>

                {/* Input for Notes and Logistics Tracking */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[10px] font-mono text-slate-500 block mb-1">Carrier Name</label>
                    <input
                      type="text"
                      value={carrierInput}
                      onChange={(e) => setCarrierInput(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-500 block mb-1">AWB Tracking Number</label>
                    <input
                      type="text"
                      placeholder="e.g. BD-982149812-IN"
                      value={trackingNumberInput}
                      onChange={(e) => setTrackingNumberInput(e.target.value)}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500 block mb-1">Audit Ledger Transition Note</label>
                  <input
                    type="text"
                    placeholder="e.g. Cleared security check at Indore Central Hub"
                    value={transitionNotes}
                    onChange={(e) => setTransitionNotes(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Order Items Breakdown */}
              <div className="rounded-2xl p-4 border border-slate-200 bg-white space-y-3">
                <span className="font-mono text-xs uppercase text-slate-500 font-bold">
                  Ordered Masterpieces ({selectedOrder.items.length})
                </span>

                <div className="divide-y divide-slate-100">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                          {item.imageUrl ? (
                            <Image src={item.imageUrl} alt="Item" fill unoptimized={true} className="object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs font-bold text-slate-400">
                              D
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{item.productName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {item.variantTitle} • SKU: {item.sku}
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <div className="font-bold text-slate-900">
                          ₹{item.totalAmount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Qty: {item.quantity} × ₹{item.unitPrice.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financial Summary */}
                <div className="pt-2 border-t border-slate-200 space-y-1 font-mono text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount ({selectedOrder.couponCode || 'PROMO'}):</span>
                      <span>-₹{selectedOrder.discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>18% GST (Calculated):</span>
                    <span>₹{selectedOrder.taxAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Freight / Shipping:</span>
                    <span className="text-emerald-700 font-semibold">
                      {selectedOrder.shippingAmount === 0 ? 'COMPLIMENTARY' : `₹${selectedOrder.shippingAmount}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-sm font-sans font-bold text-slate-900">
                    <span>Total Order Value:</span>
                    <span className="font-display text-lg text-brand-700 font-mono font-bold">
                      ₹{selectedOrder.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Timeline Audit */}
              <div className="rounded-2xl p-4 border border-slate-200 bg-slate-50/60 space-y-3">
                <span className="font-mono text-xs uppercase text-slate-500 font-bold">
                  Chronological Audit Timeline ({selectedOrder.timeline.length} Events)
                </span>

                <div className="relative pl-5 space-y-4 border-l border-slate-300 text-xs">
                  {selectedOrder.timeline.map((event, idx) => (
                    <div key={event.id || idx} className="relative">
                      <div className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-brand-500 ring-4 ring-white" />
                      <div className="font-bold text-slate-900">{event.title}</div>
                      <p className="text-slate-600 mt-0.5">{event.description}</p>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                        {new Date(event.createdAt).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* GST TAX INVOICE MODAL */}
      {/* ======================================================== */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-600" />
                <h3 className="font-display text-lg font-bold text-slate-900">
                  GST Tax Invoice — Divisha Electronics
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-mono text-slate-700 hover:text-slate-900"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {loadingInvoice ? (
              <div className="py-12 text-center text-xs font-mono text-slate-500">
                Generating authoritative tax invoice from ledger...
              </div>
            ) : !invoiceData ? (
              <div className="py-12 text-center text-xs font-mono text-rose-600">
                Unable to compile invoice for this order record.
              </div>
            ) : (
              <div className="space-y-6 text-xs">
                {/* Invoice Header Details */}
                <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-4 font-mono">
                  <div>
                    <div className="font-display text-base font-bold text-slate-900">
                      {invoiceData.companyDetails.legalName}
                    </div>
                    <p className="text-slate-600">{invoiceData.companyDetails.registeredAddress}</p>
                    <p className="text-slate-600">GSTIN: {invoiceData.companyDetails.gstin}</p>
                    <p className="text-slate-600">PAN: {invoiceData.companyDetails.pan}</p>
                  </div>

                  <div className="text-right space-y-1 text-slate-600">
                    <p>
                      <strong className="text-slate-900">Invoice Number:</strong> {invoiceData.invoiceNumber}
                    </p>
                    <p>
                      <strong>Date:</strong> {new Date(invoiceData.invoiceDate).toLocaleDateString('en-IN')}
                    </p>
                    <p>
                      <strong>State of Supply:</strong> {invoiceData.companyDetails.stateOfSupply}
                    </p>
                    <p>
                      <strong>Reverse Charge:</strong> No
                    </p>
                  </div>
                </div>

                {/* Bill to / Ship to */}
                <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-4 font-mono text-xs">
                  <div>
                    <span className="font-bold text-slate-900 uppercase text-[11px]">Billed To:</span>
                    <p className="font-semibold text-slate-900 mt-0.5">{invoiceData.billTo.name}</p>
                    <p className="text-slate-600">{invoiceData.billTo.address}</p>
                    <p className="text-slate-500">Phone: {invoiceData.billTo.phone}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 uppercase text-[11px]">Shipped To:</span>
                    <p className="font-semibold text-slate-900 mt-0.5">{invoiceData.shipTo.name}</p>
                    <p className="text-slate-600">{invoiceData.shipTo.address}</p>
                    <p className="text-slate-500">Phone: {invoiceData.shipTo.phone}</p>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-left font-mono text-[11px]">
                  <thead className="border-b border-slate-200 bg-slate-50 uppercase text-slate-600">
                    <tr>
                      <th className="py-2 px-2">#</th>
                      <th className="py-2 px-2">Item Description</th>
                      <th className="py-2 px-2">HSN</th>
                      <th className="py-2 px-2">Qty</th>
                      <th className="py-2 px-2">Taxable Value</th>
                      <th className="py-2 px-2">CGST</th>
                      <th className="py-2 px-2">SGST</th>
                      <th className="py-2 px-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoiceData.items.map((i: any) => (
                      <tr key={i.serialNo}>
                        <td className="py-2 px-2 text-slate-500">{i.serialNo}</td>
                        <td className="py-2 px-2 font-sans font-medium text-slate-900">{i.description}</td>
                        <td className="py-2 px-2 text-slate-600">{i.hsnCode}</td>
                        <td className="py-2 px-2 text-slate-600">{i.quantity}</td>
                        <td className="py-2 px-2 text-slate-900">₹{i.taxableValue.toLocaleString('en-IN')}</td>
                        <td className="py-2 px-2 text-slate-600">₹{i.cgst.toLocaleString('en-IN')}</td>
                        <td className="py-2 px-2 text-slate-600">₹{i.sgst.toLocaleString('en-IN')}</td>
                        <td className="py-2 px-2 text-right font-bold text-slate-900">
                          ₹{i.totalAmount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Invoice Totals */}
                <div className="flex justify-end pt-2 border-t border-slate-200 font-mono text-xs">
                  <div className="w-72 space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                      <span>Total Taxable Amount:</span>
                      <span>₹{invoiceData.summary.taxableAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>CGST (9%):</span>
                      <span>₹{invoiceData.summary.cgstAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>SGST (9%):</span>
                      <span>₹{invoiceData.summary.sgstAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Freight & Installation:</span>
                      <span className="text-emerald-700 font-semibold">{invoiceData.summary.shippingCharge === 0 ? 'FREE' : `₹${invoiceData.summary.shippingCharge}`}</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 font-bold text-slate-900 text-sm font-sans">
                      <span>Grand Total:</span>
                      <span className="text-brand-700 font-mono text-base">
                        ₹{invoiceData.summary.grandTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Digital Verification */}
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-[10px] font-mono text-slate-600">
                  <span className="text-brand-700 block font-bold mb-0.5">AUTHORITATIVE DIGITAL SIGNATURE HASH:</span>
                  <span className="break-all">{invoiceData.digitalVerificationHash}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
