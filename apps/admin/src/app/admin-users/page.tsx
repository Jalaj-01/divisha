'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Shield,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  Lock,
  X,
  Search,
  Check,
  UserCheck,
  UserX
} from 'lucide-react';
import { AdminUserDTO, AdminRoleDTO } from '@divisha/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  const [roles, setRoles] = useState<AdminRoleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    roleId: '',
    password: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load staff & roles
  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetch(`${API_BASE}/v1/admin/admin-users`).then((r) => r.json()),
        fetch(`${API_BASE}/v1/admin/roles`).then((r) => r.json())
      ]);

      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data);
      }
      if (rolesRes.success && rolesRes.data) {
        setRoles(rolesRes.data);
        if (!form.roleId && rolesRes.data[0]) {
          setForm((prev) => ({ ...prev, roleId: rolesRes.data[0].id }));
        }
      }
    } catch (e) {
      console.error('Failed to load admin staff', e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Live auto-polling every 4 seconds without manual refresh button
    const interval = setInterval(() => {
      loadData(true);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handle Add Staff
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/v1/admin/admin-users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (json.success && json.data) {
        setUsers((prev) => [...prev, json.data]);
        setShowAddModal(false);
        setForm({
          name: '',
          email: '',
          phone: '',
          roleId: roles[0]?.id || '',
          password: ''
        });
      } else {
        setError(json.error?.message || 'Failed to create staff member');
      }
    } catch (e: any) {
      setError(e.message || 'Error communicating with server');
    } finally {
      setSaving(false);
    }
  };

  // Toggle user active status
  const handleToggleStatus = async (user: AdminUserDTO) => {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/admin-users/${user.id}/toggle-status`, {
        method: 'PATCH'
      });
      const json = await res.json();
      if (json.success && json.data) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: json.data.isActive } : u))
        );
      }
    } catch (e) {
      console.error('Failed to toggle status', e);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-brand-700 border border-amber-200 shadow-sm">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
                  Staff Team & Admin Logins
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync Active
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Add store staff members, assign their roles, and manage their login access.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-sm hover:scale-[1.02] transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="relative w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff by name, email, or role..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 pl-8 text-xs text-slate-900 focus:outline-none"
            />
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          </div>

          <span className="text-xs text-slate-500 font-mono">
            {filteredUsers.length} Staff Members
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-mono uppercase text-slate-500 text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Staff Member</th>
                <th className="px-6 py-3.5">Assigned Role</th>
                <th className="px-6 py-3.5">Contact Phone</th>
                <th className="px-6 py-3.5">Login Access</th>
                <th className="px-6 py-3.5">Joined Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Loading staff accounts...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No staff members found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-brand-900 font-bold text-xs border border-amber-200">
                          {member.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{member.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{member.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-800">
                        <Shield className="h-3 w-3 text-brand-600" />
                        {member.role?.name || 'Administrator'}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono text-slate-700">
                      {member.phone || '+91 98765 43210'}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(member)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                          member.isActive
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                        title={member.isActive ? 'Click to Disable Access' : 'Click to Enable Access'}
                      >
                        {member.isActive ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                            <span>Active (Allowed)</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 text-rose-600" />
                            <span>Disabled (Blocked)</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-6 py-4 font-mono text-slate-500 text-[11px]">
                      {new Date(member.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(member)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                      >
                        {member.isActive ? 'Disable Access' : 'Enable Access'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD STAFF MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="h-5 w-5 text-brand-600" />
                Add New Staff Member
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-900 mt-4">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="ramesh@divishaelectronics.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-mono focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={form.roleId}
                  onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-5 py-2 font-bold text-slate-950 shadow-sm hover:scale-[1.02] cursor-pointer"
                >
                  {saving ? 'Creating...' : 'Create Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
