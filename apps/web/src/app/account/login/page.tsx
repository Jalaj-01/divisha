'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/account';

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login({ email, password });
    setLoading(false);

    if (result.success) {
      router.push(returnUrl);
    } else {
      setError(result.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const fillDemoAccount = () => {
    setEmail('aarav.mehta@example.com');
    setPassword('Customer@2026');
    setError(null);
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 p-0.5 shadow-md shadow-brand-500/20 mb-4">
          <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950">
            <Lock className="h-5 w-5 text-brand-300" />
          </div>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Client Privilege Portal
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600">
          Sign in to access your bespoke orders, curated wishlist, and white-glove logistics.
        </p>
      </div>

      {/* Demo Credentials Helper Pill */}
      <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-900 font-bold">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span>Fast Preview Demo Credentials</span>
          </div>
          <button
            type="button"
            onClick={fillDemoAccount}
            className="rounded-full bg-amber-200/80 border border-amber-300 px-3 py-1 font-mono text-[11px] font-bold text-amber-900 hover:bg-amber-300/80 transition-colors"
          >
            Auto-Fill
          </button>
        </div>
        <div className="mt-2 flex flex-col gap-0.5 font-mono text-[11px] text-slate-700">
          <span>Email: <strong className="text-slate-900 font-bold">aarav.mehta@example.com</strong></span>
          <span>Password: <strong className="text-slate-900 font-bold">Customer@2026</strong></span>
        </div>
      </div>

      {/* Login Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-mono">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider font-mono">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@luxury.in"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none transition-all font-mono"
              />
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider font-mono">
                Password
              </label>
              <button
                type="button"
                onClick={() => alert('For password resets, contact your VIP concierge on WhatsApp at +91 98765 43210.')}
                className="text-xs text-brand-700 font-semibold hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none transition-all"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 py-3.5 text-sm font-bold text-slate-950 shadow-md shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <span>Authenticating Credentials...</span>
            ) : (
              <>
                <span>Sign In Securely</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-6 text-center text-xs text-slate-600">
          <span>New to Divisha Electronics? </span>
          <Link
            href={`/account/signup${returnUrl !== '/account' ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`}
            className="font-bold text-brand-700 hover:underline"
          >
            Create an exclusive account
          </Link>
        </div>
      </div>

      {/* Security Assurance Badge */}
      <div className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-slate-500 font-mono">
        <Shield className="h-3.5 w-3.5 text-emerald-600" />
        <span>256-bit TLS encrypted session • Authorized Flagship Client Authentication</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-slate-500 text-sm">Loading client security portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
