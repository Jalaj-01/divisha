'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  ShieldCheck,
  PackageCheck,
  Navigation,
  Sparkles,
  Phone,
  MessageSquare
} from 'lucide-react';
import { ShipmentStatus } from '@divisha/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ShipmentRecord {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  city: string;
  state: string;
  orderStatus: string;
  shipment: {
    id: string;
    orderId: string;
    carrier: string;
    trackingNumber: string;
    status: ShipmentStatus;
    estimatedDeliveryDate?: string;
    actualDeliveryDate?: string;
    shippedAt?: string;
  };
}

export default function AdminShipmentsPage() {
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const fetchShipments = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch(`${API_BASE}/v1/orders/shipments/all`);
      if (res.ok) {
        const json = await res.json();
        setShipments(json.data || json || []);
      }
    } catch (e) {
      console.error('Failed to load shipments', e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
    const interval = setInterval(() => {
      fetchShipments(true);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const filteredShipments = shipments.filter((s) => {
    if (selectedCarrier !== 'ALL' && !s.shipment.carrier.includes(selectedCarrier)) return false;
    if (selectedStatus !== 'ALL' && s.shipment.status !== selectedStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.orderNumber.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q) ||
        s.customerPhone.includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.shipment.trackingNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalActive = shipments.filter((s) => s.shipment.status !== ShipmentStatus.DELIVERED).length;
  const inTransitCount = shipments.filter((s) => s.shipment.status === ShipmentStatus.IN_TRANSIT).length;
  const outForDeliveryCount = shipments.filter((s) => s.shipment.status === ShipmentStatus.OUT_FOR_DELIVERY).length;
  const deliveredCount = shipments.filter((s) => s.shipment.status === ShipmentStatus.DELIVERED).length;

  const handleSimulateStatus = async (orderId: string, targetStatus: string) => {
    try {
      await fetch(`${API_BASE}/v1/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          notes: `Simulated logistics checkpoint update: ${targetStatus}`
        })
      });
      await fetchShipments();
    } catch (e) {
      console.error('Failed to update shipment status', e);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-700 font-bold">
              ORDER DELIVERY
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync Active
            </span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Customer Shipments & Tracking
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            Track package delivery progress, courier tracking numbers, and delivery dates in real time.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-bold uppercase">
            <span>Active Shipments</span>
            <Truck className="h-4 w-4 text-brand-600" />
          </div>
          <div className="mt-2 font-display text-2xl font-extrabold text-slate-900 font-mono">{totalActive}</div>
          <p className="mt-1 text-[11px] text-slate-500">Currently in logistics pipeline</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-bold uppercase">
            <span>In-Transit Convoys</span>
            <Navigation className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 font-display text-2xl font-extrabold text-blue-700 font-mono">{inTransitCount}</div>
          <p className="mt-1 text-[11px] text-blue-800">Air & road freight in movement</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-bold uppercase">
            <span>Out for Delivery</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 font-display text-2xl font-extrabold text-amber-700 font-mono">{outForDeliveryCount}</div>
          <p className="mt-1 text-[11px] text-amber-800">With technicians for unboxing today</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-bold uppercase">
            <span>Delivered & Signed</span>
            <PackageCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 font-display text-2xl font-extrabold text-emerald-700 font-mono">{deliveredCount}</div>
          <p className="mt-1 text-[11px] text-slate-500">Completed white-glove installations</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between rounded-2xl bg-white p-4 border border-slate-200/90 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by BlueDart Airway Bill (AWB), Order #, client, or destination city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-all font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <select
            value={selectedCarrier}
            onChange={(e) => setSelectedCarrier(e.target.value)}
            className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
          >
            <option value="ALL">All Carrier Partners</option>
            <option value="BlueDart">BlueDart Express</option>
            <option value="Delhivery">Delhivery Cargo</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
          >
            <option value="ALL">All Milestones</option>
            <option value="ORDER_CREATED">Order Created</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
          </select>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-mono uppercase text-slate-500 text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Airway Bill (AWB)</th>
                <th className="py-3.5 px-4 font-semibold">Order Reference</th>
                <th className="py-3.5 px-4 font-semibold">Recipient & City</th>
                <th className="py-3.5 px-4 font-semibold">Carrier</th>
                <th className="py-3.5 px-4 font-semibold">Logistics Status</th>
                <th className="py-3.5 px-4 font-semibold">Est. Arrival</th>
                <th className="py-3.5 px-4 font-semibold text-right">Quick Milestone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-mono">
                    No shipments match your criteria.
                  </td>
                </tr>
              ) : (
                filteredShipments.map((s) => (
                  <tr key={s.shipment.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* AWB */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-brand-700">{s.shipment.trackingNumber}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3 text-emerald-600" /> Insured Transit
                      </div>
                    </td>

                    {/* Order Reference */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {s.orderNumber}
                    </td>

                    {/* Recipient */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{s.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-brand-600" /> {s.city}, {s.state}
                      </div>
                    </td>

                    {/* Carrier */}
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      <span className="rounded-lg bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold">
                        {s.shipment.carrier}
                      </span>
                    </td>

                    {/* Logistics Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase ${
                          s.shipment.status === ShipmentStatus.DELIVERED
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : s.shipment.status === ShipmentStatus.OUT_FOR_DELIVERY
                            ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                            : s.shipment.status === ShipmentStatus.IN_TRANSIT
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {s.shipment.status}
                      </span>
                    </td>

                    {/* Estimated Arrival */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {s.shipment.estimatedDeliveryDate
                        ? new Date(s.shipment.estimatedDeliveryDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short'
                          })
                        : 'Within 3 Days'}
                    </td>

                    {/* Quick Milestone */}
                    <td className="py-3.5 px-4 text-right">
                      {s.shipment.status !== ShipmentStatus.DELIVERED ? (
                        <div className="inline-flex gap-1.5 font-mono">
                          {s.shipment.status !== ShipmentStatus.IN_TRANSIT && (
                            <button
                              onClick={() => handleSimulateStatus(s.orderId, 'SHIPPED')}
                              className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-800 hover:bg-blue-100"
                              title="Mark In Transit"
                            >
                              In Transit
                            </button>
                          )}
                          {s.shipment.status !== ShipmentStatus.OUT_FOR_DELIVERY && (
                            <button
                              onClick={() => handleSimulateStatus(s.orderId, 'OUT_FOR_DELIVERY')}
                              className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-800 hover:bg-amber-100"
                              title="Mark Out for Delivery"
                            >
                              Out for Del
                            </button>
                          )}
                          <button
                            onClick={() => handleSimulateStatus(s.orderId, 'DELIVERED')}
                            className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-800 hover:bg-emerald-100"
                            title="Confirm Completed Delivery"
                          >
                            Delivered
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-emerald-700 font-bold">
                          ✓ Signed & Installed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
