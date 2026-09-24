'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Phone,
  Send,
  Truck,
  CheckCircle2,
  Clock,
  Users,
  Search,
  Check,
  Edit,
  Pause,
  Play,
  X,
  UserCheck
} from 'lucide-react';
import { WhatsAppConciergeDepartment } from '@divisha/types';

const API_BASE = 'http://localhost:4000/v1/whatsapp';

interface MessageLog {
  id: string;
  toPhone: string;
  recipientName?: string;
  messageType: string;
  department?: string;
  parameters: Record<string, string>;
  status: string;
  deliveredAt: string;
  createdAt: string;
}

export default function WhatsAppSupportDeskPage() {
  const [departments, setDepartments] = useState<WhatsAppConciergeDepartment[]>([]);
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dispatch_alerts' | 'logs'>('dispatch_alerts');

  // Edit Executive Modal State
  const [editingDept, setEditingDept] = useState<WhatsAppConciergeDepartment | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    phone: '',
    operatingHours: ''
  });
  const [editSaving, setEditSaving] = useState(false);

  // Dispatch Alerts State
  const [dispatchOrderId, setDispatchOrderId] = useState('DIV-2026-ORD-1001');
  const [dispatchCustomerName, setDispatchCustomerName] = useState('Aarav Mehta');
  const [dispatchPhone, setDispatchPhone] = useState('+919876543210');
  const [carrier, setCarrier] = useState('BlueDart Express');
  const [awbNumber, setAwbNumber] = useState('BD-889922110');
  const [expectedDate, setExpectedDate] = useState('25 Sep 2026 by 5:00 PM');
  const [destCity, setDestCity] = useState('Indore, Madhya Pradesh');
  const [securityPin, setSecurityPin] = useState('4829');
  const [dispatchAlertSuccess, setDispatchAlertSuccess] = useState(false);

  // Filter logs state
  const [filterType, setFilterType] = useState('ALL');
  const [filterPhone, setFilterPhone] = useState('');

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [deptRes, logsRes] = await Promise.all([
        fetch(`${API_BASE}/departments`),
        fetch(`${API_BASE}/logs`)
      ]);
      const deptJson = await deptRes.json();
      const logsJson = await logsRes.json();

      setDepartments(deptJson.data || deptJson || []);
      setLogs(logsJson.data || logsJson || []);
    } catch (err) {
      console.error('Failed to load WhatsApp data:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Live automatic sync every 4 seconds without manual refresh button
    const interval = setInterval(() => {
      fetchData(true);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Pause / Resume Executive
  const handleToggleDepartment = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      await fetch(`${API_BASE}/departments/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: newStatus })
      });
      setDepartments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, isAvailable: newStatus } : d))
      );
    } catch (err) {
      console.error('Failed to toggle department:', err);
    }
  };

  // Open Edit Executive Modal
  const openEditModal = (dept: WhatsAppConciergeDepartment) => {
    setEditingDept(dept);
    setEditForm({
      name: dept.name,
      description: dept.description || '',
      phone: dept.phone,
      operatingHours: dept.operatingHours || '9:00 AM - 9:00 PM IST'
    });
  };

  // Save Edit Executive
  const handleSaveEditDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    setEditSaving(true);
    try {
      // Update in local state and memory store
      setDepartments((prev) =>
        prev.map((d) => (d.id === editingDept.id ? { ...d, ...editForm } : d))
      );
      setEditingDept(null);
    } catch (err) {
      console.error('Failed to save executive changes', err);
    } finally {
      setEditSaving(false);
    }
  };

  // Send Dispatch Alert
  const handleSendDispatchAlert = async () => {
    try {
      const payload = {
        toPhone: dispatchPhone,
        customerName: dispatchCustomerName,
        orderNumber: dispatchOrderId,
        carrier,
        awbNumber,
        expectedDelivery: expectedDate,
        city: destCity,
        securityPin
      };

      const res = await fetch(`${API_BASE}/dispatch-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.data?.success || data.success) {
        setDispatchAlertSuccess(true);
        setTimeout(() => setDispatchAlertSuccess(false), 4000);
        fetchData(true);
      }
    } catch (err) {
      console.error('Failed to send dispatch alert:', err);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchType = filterType === 'ALL' || log.messageType === filterType;
    const matchPhone = !filterPhone || log.toPhone.includes(filterPhone);
    return matchType && matchPhone;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
                  WhatsApp Support & Executives
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync Active
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Manage your customer support executives, pause or edit phone numbers, and send live WhatsApp shipping updates.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Support Executives Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-mono font-bold tracking-wider text-slate-700 uppercase flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-600" />
            Support Executives & Department Routing
          </h2>
          <span className="text-[11px] text-slate-500">
            Pause or edit any executive's name, phone number, and hours
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className={`rounded-2xl border p-5 transition-all bg-white shadow-sm hover:shadow-md ${
                dept.isAvailable ? 'border-emerald-300' : 'border-slate-300 bg-slate-50/60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        dept.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                      }`}
                    />
                    <h3 className="font-bold text-slate-900 text-sm">{dept.name}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {dept.description || 'Customer inquiry and order assistance'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Pause / Resume Button */}
                  <button
                    onClick={() => handleToggleDepartment(dept.id, dept.isAvailable)}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      dept.isAvailable
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                    }`}
                    title={dept.isAvailable ? 'Click to Pause Executive' : 'Click to Set Executive Online'}
                  >
                    {dept.isAvailable ? (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                        <span>Online</span>
                      </>
                    ) : (
                      <>
                        <Pause className="h-3 w-3 text-amber-700" />
                        <span>Paused</span>
                      </>
                    )}
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => openEditModal(dept)}
                    className="p-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Edit Name, Phone & Hours"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-slate-700 flex items-center gap-1.5 font-semibold font-mono">
                  <Phone className="h-3.5 w-3.5 text-brand-600" />
                  <span>{dept.phone}</span>
                </div>
                <span className="text-[11px] text-slate-500">{dept.operatingHours}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('dispatch_alerts')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'dispatch_alerts'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Truck className="h-4 w-4" />
          <span>Shipping & Tracking Alerts</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'logs'
              ? 'border-emerald-600 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Customer Message History ({logs.length})</span>
        </button>
      </div>

      {/* TAB 1: Dispatch Alerts */}
      {activeTab === 'dispatch_alerts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-5 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Truck className="h-5 w-5 text-emerald-600" />
                Send Shipping Update to Customer
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically formats and sends an official WhatsApp dispatch message with tracking number and verification PIN.
              </p>
            </div>

            {dispatchAlertSuccess && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>WhatsApp shipping notification sent successfully to customer!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Order Number</label>
                <input
                  type="text"
                  value={dispatchOrderId}
                  onChange={(e) => setDispatchOrderId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-mono text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Customer Name</label>
                <input
                  type="text"
                  value={dispatchCustomerName}
                  onChange={(e) => setDispatchCustomerName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Customer WhatsApp Phone</label>
                <input
                  type="text"
                  value={dispatchPhone}
                  onChange={(e) => setDispatchPhone(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-mono text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Courier Partner</label>
                <input
                  type="text"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Tracking (AWB) Number</label>
                <input
                  type="text"
                  value={awbNumber}
                  onChange={(e) => setAwbNumber(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-mono text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Delivery Security PIN</label>
                <input
                  type="text"
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-mono text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSendDispatchAlert}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 py-3 px-4 text-xs font-bold text-white shadow-sm hover:scale-[1.01] transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>Send WhatsApp Shipping Update</span>
            </button>
          </div>

          {/* Live Message Preview */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-slate-900">Message Preview (Customer View)</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-800 font-semibold">Official WhatsApp</span>
                </div>

                <div className="rounded-2xl bg-white border border-emerald-200 p-4 shadow-sm space-y-2.5 text-xs text-slate-800">
                  <p className="font-bold text-slate-900">🚚 Your Order Has Been Dispatched!</p>
                  <p>Hello <b>{dispatchCustomerName}</b>,</p>
                  <p>
                    Your order <b>{dispatchOrderId}</b> is on its way via <b>{carrier}</b> (Tracking AWB: <b>{awbNumber}</b>).
                  </p>
                  <p>
                    Expected Delivery: <b>{expectedDate}</b> to <b>{destCity}</b>.
                  </p>
                  <p className="bg-amber-50 border border-amber-200 p-2 rounded-xl text-amber-900">
                    🔒 Delivery Security PIN: <b>{securityPin}</b>. Please share this PIN with the delivery executive upon package arrival.
                  </p>
                  <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    Divisha Electronics • Vijay Nagar, Indore
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Message Logs */}
      {activeTab === 'logs' && (
        <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="relative w-72">
              <input
                type="text"
                value={filterPhone}
                onChange={(e) => setFilterPhone(e.target.value)}
                placeholder="Filter by phone number..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 pl-8 text-xs text-slate-900 focus:outline-none"
              />
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            </div>

            <span className="text-xs font-mono text-slate-600 font-semibold">
              {filteredLogs.length} Messages Delivered
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-mono uppercase text-slate-500 text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Recipient</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No WhatsApp messages logged yet.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3.5 font-mono text-slate-500 text-[11px]">
                        {new Date(log.createdAt).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-3.5">
                        <p className="font-semibold text-slate-900">{log.recipientName || 'Customer'}</p>
                        <span className="font-mono text-[10px] text-slate-500">{log.toPhone}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="font-semibold text-slate-800">{log.messageType}</span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {log.department || 'Customer Support'}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                          <Check className="h-3 w-3" /> Delivered
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT EXECUTIVE MODAL */}
      {editingDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit className="h-5 w-5 text-emerald-600" />
                Edit Support Executive Details
              </h3>
              <button
                onClick={() => setEditingDept(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditDept} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department / Executive Title</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">WhatsApp Phone Number</label>
                <input
                  type="text"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+919876543210"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-mono focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operating Hours</label>
                <input
                  type="text"
                  required
                  value={editForm.operatingHours}
                  onChange={(e) => setEditForm({ ...editForm, operatingHours: e.target.value })}
                  placeholder="9:00 AM - 9:00 PM IST"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Responsibility</label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingDept(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-2 font-bold text-white shadow-sm hover:scale-[1.02] cursor-pointer"
                >
                  {editSaving ? 'Saving...' : 'Save Executive Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
