'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle2,
  Lock,
  Save,
  Key,
  Users,
  Check,
  Package,
  ShoppingCart,
  Boxes,
  MessageSquare,
  Settings
} from 'lucide-react';
import { AdminRoleDTO, AdminPermissionDTO, PermissionCode } from '@divisha/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function RolesPage() {
  const [roles, setRoles] = useState<AdminRoleDTO[]>([]);
  const [permissions, setPermissions] = useState<AdminPermissionDTO[]>([]);
  const [selectedRole, setSelectedRole] = useState<AdminRoleDTO | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');

  useEffect(() => {
    const loadRbacData = async () => {
      setLoading(true);
      try {
        const [rolesRes, permsRes] = await Promise.all([
          fetch(`${API_BASE}/v1/admin/roles`).then((r) => r.json()),
          fetch(`${API_BASE}/v1/admin/permissions`).then((r) => r.json())
        ]);

        if (rolesRes.success && rolesRes.data) {
          setRoles(rolesRes.data);
          const initialRole = rolesRes.data[0];
          setSelectedRole(initialRole);
          setSelectedPermissions(initialRole.permissions?.map((p: any) => p.code) || []);
        }

        if (permsRes.success && permsRes.data) {
          setPermissions(permsRes.data);
        }
      } catch (e) {
        console.error('Failed to load roles and permissions', e);
      } finally {
        setLoading(false);
      }
    };

    loadRbacData();
  }, []);

  const handleSelectRole = (role: AdminRoleDTO) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions?.map((p) => p.code) || []);
    setStatusMessage(null);
  };

  const handleTogglePermission = (code: PermissionCode) => {
    if (selectedRole?.code === 'SUPER_ADMIN') {
      setStatusMessage({
        type: 'error',
        text: 'The Administrator role has full master permissions and cannot be modified.'
      });
      return;
    }

    setSelectedPermissions((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleToggleModule = (mod: string) => {
    if (selectedRole?.code === 'SUPER_ADMIN') return;
    const modulePerms = permissions.filter((p) => p.module === mod).map((p) => p.code);
    const allSelected = modulePerms.every((p) => selectedPermissions.includes(p));

    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((p) => !modulePerms.includes(p)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...modulePerms])));
    }
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`${API_BASE}/v1/admin/roles/${selectedRole.id}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissionCodes: selectedPermissions })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setStatusMessage({
          type: 'success',
          text: `Permissions for "${selectedRole.name}" updated successfully!`
        });

        setRoles((prev) =>
          prev.map((r) => (r.id === selectedRole.id ? { ...r, permissions: json.data.permissions } : r))
        );
        setSelectedRole(json.data);
      } else {
        setStatusMessage({
          type: 'error',
          text: json.error?.message || 'Failed to update role permissions'
        });
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e.message || 'Connection error while saving' });
    } finally {
      setSaving(false);
    }
  };

  const modules = Array.from(new Set(permissions.map((p) => p.module)));
  const filteredPermissions =
    moduleFilter === 'ALL' ? permissions : permissions.filter((p) => p.module === moduleFilter);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-brand-700 border border-amber-200 shadow-sm">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
                  Staff Roles & Permissions
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync Active
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Control what each staff role is allowed to see and edit in your store (products, orders, stock, or settings).
              </p>
            </div>
          </div>
        </div>

        {selectedRole && selectedRole.code !== 'SUPER_ADMIN' && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-sm hover:scale-[1.02] transition-all cursor-pointer"
          >
            {saving ? <Lock className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{saving ? 'Saving...' : 'Save Permissions'}</span>
          </button>
        )}
      </div>

      {statusMessage && (
        <div
          className={`rounded-2xl p-4 text-xs font-semibold flex items-center gap-2.5 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <Lock className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Grid: Roles List (Left) and Permissions Matrix (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Roles List */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">
            Available Roles ({roles.length})
          </h2>

          <div className="space-y-2">
            {roles.map((role) => {
              const isSelected = selectedRole?.id === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => handleSelectRole(role)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/70 border-brand-500 ring-2 ring-brand-500/20 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900 text-sm">{role.name}</p>
                    <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {role.permissions?.length || 0} permissions
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{role.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Permissions Checkbox Grid */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Key className="h-4 w-4 text-brand-600" />
                Permissions for {selectedRole?.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Check or uncheck the actions this role can perform.
              </p>
            </div>

            {/* Module Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setModuleFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  moduleFilter === 'ALL'
                    ? 'bg-brand-500 text-slate-950 font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Modules
              </button>
              {modules.map((mod) => (
                <button
                  key={mod}
                  onClick={() => setModuleFilter(mod)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    moduleFilter === mod
                      ? 'bg-brand-500 text-slate-950 font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>

          {/* Permissions List Grouped by Module */}
          <div className="space-y-4">
            {modules
              .filter((mod) => moduleFilter === 'ALL' || moduleFilter === mod)
              .map((mod) => {
                const modPerms = permissions.filter((p) => p.module === mod);
                const allSelected = modPerms.every((p) => selectedPermissions.includes(p.code));

                return (
                  <div key={mod} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                        {mod === 'CATALOG' ? <Package className="h-4 w-4 text-cyan-600" /> : null}
                        {mod === 'ORDERS' ? <ShoppingCart className="h-4 w-4 text-emerald-600" /> : null}
                        {mod === 'INVENTORY' ? <Boxes className="h-4 w-4 text-amber-600" /> : null}
                        {mod === 'CUSTOMERS' ? <Users className="h-4 w-4 text-indigo-600" /> : null}
                        {mod === 'SETTINGS' ? <Settings className="h-4 w-4 text-purple-600" /> : null}
                        {mod}
                      </span>

                      {selectedRole?.code !== 'SUPER_ADMIN' && (
                        <button
                          type="button"
                          onClick={() => handleToggleModule(mod)}
                          className="text-[11px] text-brand-700 hover:text-brand-900 font-semibold cursor-pointer"
                        >
                          {allSelected ? 'Unselect All' : 'Select All'}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {modPerms.map((perm) => {
                        const isChecked = selectedPermissions.includes(perm.code);
                        const isSuper = selectedRole?.code === 'SUPER_ADMIN';

                        return (
                          <label
                            key={perm.code}
                            className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-white border-brand-300 shadow-sm'
                                : 'bg-slate-100/60 border-slate-200 opacity-70'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={isSuper}
                              onChange={() => handleTogglePermission(perm.code)}
                              className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                            />
                            <div>
                              <p className="font-semibold text-slate-900 text-xs">{perm.name}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{perm.description}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
