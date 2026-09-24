'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Check,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Lock,
  MessageSquare,
  Copy,
  ExternalLink,
  AlertCircle,
  Building,
  Home as HomeIcon,
  Phone,
  Mail,
  User
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { PaymentMethod, OrderDTO } from '@divisha/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, totalItems } = useCart();
  const { user, isLoggedIn } = useAuth();

  // Step state (1: Address, 2: Logistics, 3: Review & Payment)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Address Selection State
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string>('addr-01');
  const [customAddress, setCustomAddress] = useState({
    name: 'Aarav Mehta',
    phone: '+919820123456',
    email: 'aarav.mehta@example.com',
    addressLine1: 'Penthouse 42, Oberoi Sky City',
    addressLine2: 'Western Express Highway, Borivali East',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400066',
    country: 'India',
    type: 'HOME' as 'HOME' | 'WORK'
  });
  const [isUsingNewAddress, setIsUsingNewAddress] = useState(false);

  // Logistics Options
  const [whiteGloveSetup, setWhiteGloveSetup] = useState(true);
  const [deliveryNotes, setDeliveryNotes] = useState('Please call 1 hour before arrival. Service elevator available.');

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.RAZORPAY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Payment Modal State (Razorpay Simulator)
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [razorpayTab, setRazorpayTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [simulatedUpiId, setSimulatedUpiId] = useState('aarav.mehta@okhdfcbank');
  const [activePendingOrder, setActivePendingOrder] = useState<OrderDTO | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Confirmed Order State
  const [confirmedOrder, setConfirmedOrder] = useState<OrderDTO | null>(null);
  const [copiedOrderNumber, setCopiedOrderNumber] = useState(false);

  // Auto-fill from user profile if logged in
  useEffect(() => {
    if (user) {
      setCustomAddress((prev) => ({
        ...prev,
        name: user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName || ''}`.trim() : prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone
      }));
    }
  }, [user]);

  // If cart is empty and no confirmed order, redirect to cart
  useEffect(() => {
    if (!confirmedOrder && cart && cart.items.length === 0) {
      router.push('/cart');
    }
  }, [cart, confirmedOrder, router]);

  // Determine current active address
  const activeShippingAddress = isUsingNewAddress
    ? customAddress
    : user?.addresses?.find((a) => a.id === selectedSavedAddressId) || {
        name: 'Aarav Mehta',
        phone: '+919820123456',
        addressLine1: 'Penthouse 42, Oberoi Sky City',
        addressLine2: 'Western Express Highway, Borivali East',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400066',
        country: 'India',
        type: 'HOME' as const
      };

  // Step 1 Submission: Proceed to Logistics
  const handleProceedToLogistics = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShippingAddress.name || !activeShippingAddress.phone || !activeShippingAddress.addressLine1) {
      setCheckoutError('Please provide complete delivery details including recipient name and phone.');
      return;
    }
    setCheckoutError(null);
    setStep(2);
  };

  // Step 2 Submission: Proceed to Payment
  const handleProceedToPayment = () => {
    setStep(3);
  };

  // Step 3: Trigger Order Creation & Payment
  const handleInitiateOrder = async () => {
    if (!cart || cart.items.length === 0) return;
    setIsSubmitting(true);
    setCheckoutError(null);

    try {
      const payload = {
        cartId: cart.id,
        userId: user?.id || 'usr-customer-01',
        customerName: activeShippingAddress.name,
        customerEmail: customAddress.email,
        customerPhone: activeShippingAddress.phone,
        shippingAddress: {
          name: activeShippingAddress.name,
          phone: activeShippingAddress.phone,
          addressLine1: activeShippingAddress.addressLine1,
          addressLine2: activeShippingAddress.addressLine2 || '',
          city: activeShippingAddress.city,
          state: activeShippingAddress.state,
          postalCode: activeShippingAddress.postalCode,
          country: 'India',
          type: activeShippingAddress.type || 'HOME'
        },
        paymentMethod,
        notes: whiteGloveSetup
          ? `[White-Glove Included] ${deliveryNotes}`
          : deliveryNotes
      };

      const res = await fetch(`${API_BASE}/v1/checkout/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'Failed to initialize order');
      }

      const order: OrderDTO = json.data || json;

      if (paymentMethod === PaymentMethod.COD) {
        clearCart();
        setConfirmedOrder(order);
      } else {
        setActivePendingOrder(order);
        setShowRazorpayModal(true);
      }
    } catch (e: any) {
      setCheckoutError(e.message || 'An error occurred during order preparation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Complete Simulated Razorpay Payment
  const handleCompleteRazorpayPayment = async () => {
    if (!activePendingOrder) return;
    setIsProcessingPayment(true);
    setCheckoutError(null);

    try {
      const mockOrderId = `order_${Date.now()}`;
      const mockPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const mockSignature = 'mock_valid_signature';

      const verifyRes = await fetch(`${API_BASE}/v1/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: activePendingOrder.id,
          gatewayOrderId: mockOrderId,
          gatewayPaymentId: mockPaymentId,
          gatewaySignature: mockSignature
        })
      });

      const verifyJson = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyJson.message || 'Payment verification failed');
      }

      setShowRazorpayModal(false);
      clearCart();
      const updatedOrder = verifyJson.order || verifyJson.data?.order || {
        ...activePendingOrder,
        status: 'CONFIRMED',
        paymentStatus: 'SUCCESSFUL'
      };
      setConfirmedOrder(updatedOrder);
    } catch (e: any) {
      setCheckoutError(e.message || 'Payment verification rejected');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const copyOrderNumber = () => {
    if (!confirmedOrder) return;
    navigator.clipboard.writeText(confirmedOrder.orderNumber);
    setCopiedOrderNumber(true);
    setTimeout(() => setCopiedOrderNumber(false), 2000);
  };

  // ==========================================
  // VIEW: CONFIRMED ORDER RECEIPT
  // ==========================================
  if (confirmedOrder) {
    const isPaid = confirmedOrder.paymentStatus === 'SUCCESSFUL';
    const waText = encodeURIComponent(
      `Hello Divisha Concierge,\n\nI have confirmed Order *${confirmedOrder.orderNumber}* for ₹${confirmedOrder.totalAmount.toLocaleString('en-IN')}.\n\nCould you please confirm the white-glove arrival window?`
    );

    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-3xl bg-white p-8 sm:p-12 border border-slate-200 text-center shadow-xl relative overflow-hidden">
          {/* Success Check Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 border border-emerald-200 mb-6 shadow-sm">
            <Check className="h-10 w-10 stroke-[2.5]" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-xs font-mono font-bold text-amber-900 mb-3 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>ORDER CONFIRMED & INVENTORY COMMITTED</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Thank You, {confirmedOrder.customerName}
          </h1>

          <p className="mt-3 text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Your investment has been locked into our authoritative production ledger. Our white-glove logistics team will coordinate your delivery.
          </p>

          {/* Order Details Card */}
          <div className="mt-8 rounded-2xl bg-slate-50 border border-slate-200 p-6 text-left space-y-4 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
              <div>
                <span className="text-slate-500">Order Reference:</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-base font-bold text-slate-900">{confirmedOrder.orderNumber}</span>
                  <button
                    onClick={copyOrderNumber}
                    className="p-1 rounded text-slate-500 hover:text-slate-900 transition-colors"
                    title="Copy Order Reference"
                  >
                    {copiedOrderNumber ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-slate-500">Payment Status:</span>
                <div className="mt-0.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      isPaid
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {isPaid ? 'PAID VIA RAZORPAY' : 'PAYMENT DUE ON DELIVERY'}
                  </span>
                </div>
              </div>
            </div>

            {/* Carrier & Tracking */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
              <div>
                <span className="text-slate-500">Carrier Partner:</span>
                <p className="text-slate-900 font-bold">BlueDart Express White-Glove Heavy Logistics</p>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-slate-500">Airway Bill / Tracking:</span>
                <p className="text-brand-700 font-bold">
                  {confirmedOrder.shipment?.trackingNumber || `BD${Date.now().toString().slice(-8)}IN`}
                </p>
              </div>
            </div>

            {/* Destination */}
            <div className="border-b border-slate-200 pb-3">
              <span className="text-slate-500">Delivery Destination:</span>
              <p className="text-slate-900 font-medium mt-0.5">
                {confirmedOrder.shippingAddress?.addressLine1}, {confirmedOrder.shippingAddress?.addressLine2}{' '}
                {confirmedOrder.shippingAddress?.city}, {confirmedOrder.shippingAddress?.state} -{' '}
                {confirmedOrder.shippingAddress?.postalCode}
              </p>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-slate-500">Total Investment (Incl. 18% GST):</span>
              <span className="font-display text-xl font-extrabold text-slate-900">
                ₹{confirmedOrder.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/account"
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 px-6 py-3.5 text-xs font-bold text-slate-950 shadow-md shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <span>View in My Orders</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            <a
              href={`https://wa.me/919876543210?text=${waText}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-all"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Get WhatsApp Live Dispatch Updates</span>
            </a>

            <Link
              href="/shop"
              className="rounded-full border border-slate-300 bg-white px-6 py-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              Continue Exploring
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If no cart available yet, return loading
  if (!cart) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mx-auto mb-4" />
        <p className="text-xs font-mono text-slate-500">Loading Checkout...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Checkout Progress Stepper */}
      <div className="mb-10 max-w-2xl mx-auto">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full font-bold ${
                step >= 1 ? 'bg-brand-500 text-slate-950 shadow-sm' : 'bg-slate-200 text-slate-600'
              }`}
            >
              1
            </span>
            <span className={step >= 1 ? 'text-slate-900 font-bold' : 'text-slate-500'}>Destination</span>
          </div>

          <div className={`h-0.5 flex-1 mx-4 ${step >= 2 ? 'bg-brand-500' : 'bg-slate-200'}`} />

          <div className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full font-bold ${
                step >= 2 ? 'bg-brand-500 text-slate-950 shadow-sm' : 'bg-slate-200 text-slate-600'
              }`}
            >
              2
            </span>
            <span className={step >= 2 ? 'text-slate-900 font-bold' : 'text-slate-500'}>Logistics</span>
          </div>

          <div className={`h-0.5 flex-1 mx-4 ${step >= 3 ? 'bg-brand-500' : 'bg-slate-200'}`} />

          <div className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full font-bold ${
                step >= 3 ? 'bg-brand-500 text-slate-950 shadow-sm' : 'bg-slate-200 text-slate-600'
              }`}
            >
              3
            </span>
            <span className={step >= 3 ? 'text-slate-900 font-bold' : 'text-slate-500'}>Payment</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Interactive Steps */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: DESTINATION */}
          {step === 1 && (
            <div className="rounded-2xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-brand-600 font-bold">
                  STEP 1 OF 3
                </span>
                <h2 className="font-display text-2xl font-extrabold text-slate-900 mt-1">
                  Client & Delivery Destination
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Where should our certified technicians deliver and assemble your masterpieces?
                </p>
              </div>

              {/* Saved Addresses Selector (if available) */}
              {user && user.addresses && user.addresses.length > 0 && !isUsingNewAddress && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold">
                      Select Saved Address Book:
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsUsingNewAddress(true)}
                      className="text-xs text-brand-700 font-semibold hover:underline font-mono"
                    >
                      + Enter New Destination
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {user.addresses.map((addr) => {
                      const isSelected = selectedSavedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedSavedAddressId(addr.id)}
                          className={`cursor-pointer rounded-xl border p-4 transition-all ${
                            isSelected
                              ? 'border-brand-500 bg-brand-50/80 shadow-sm ring-1 ring-brand-500/30'
                              : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {addr.type === 'WORK' ? (
                                <Building className="h-4 w-4 text-brand-600" />
                              ) : (
                                <HomeIcon className="h-4 w-4 text-brand-600" />
                              )}
                              <span className="text-xs font-bold text-slate-900">{addr.name}</span>
                              <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-mono text-slate-700 uppercase font-semibold">
                                {addr.type}
                              </span>
                            </div>
                            <div
                              className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                isSelected ? 'border-brand-500 bg-brand-500' : 'border-slate-400'
                              }`}
                            >
                              {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-slate-950" />}
                            </div>
                          </div>
                          <p className="mt-2 text-xs text-slate-700">
                            {addr.addressLine1}, {addr.addressLine2 ? `${addr.addressLine2}, ` : ''}
                            {addr.city}, {addr.state} - {addr.postalCode}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 font-mono">Mobile: {addr.phone}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Custom New Address Form */}
              {(isUsingNewAddress || !user?.addresses?.length) && (
                <form onSubmit={handleProceedToLogistics} className="space-y-4">
                  {user?.addresses?.length ? (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setIsUsingNewAddress(false)}
                        className="text-xs text-brand-700 font-semibold hover:underline font-mono"
                      >
                        ← Choose from Saved Addresses
                      </button>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono text-slate-700 font-semibold block mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={customAddress.name}
                        onChange={(e) => setCustomAddress({ ...customAddress, name: e.target.value })}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white"
                        placeholder="e.g. Aarav Mehta"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-700 font-semibold block mb-1">WhatsApp Phone (for tracking)</label>
                      <input
                        type="tel"
                        required
                        value={customAddress.phone}
                        onChange={(e) => setCustomAddress({ ...customAddress, phone: e.target.value })}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white font-mono"
                        placeholder="+91 98201 23456"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-700 font-semibold block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={customAddress.email}
                      onChange={(e) => setCustomAddress({ ...customAddress, email: e.target.value })}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white font-mono"
                      placeholder="client@example.com"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-700 font-semibold block mb-1">Residence / Building / Suite</label>
                    <input
                      type="text"
                      required
                      value={customAddress.addressLine1}
                      onChange={(e) => setCustomAddress({ ...customAddress, addressLine1: e.target.value })}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white"
                      placeholder="Penthouse 42, Oberoi Sky City"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-700 font-semibold block mb-1">Street / Landmark</label>
                    <input
                      type="text"
                      value={customAddress.addressLine2}
                      onChange={(e) => setCustomAddress({ ...customAddress, addressLine2: e.target.value })}
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white"
                      placeholder="Western Express Highway, Borivali East"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-mono text-slate-700 font-semibold block mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={customAddress.city}
                        onChange={(e) => setCustomAddress({ ...customAddress, city: e.target.value })}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white"
                        placeholder="Mumbai"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-700 font-semibold block mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={customAddress.state}
                        onChange={(e) => setCustomAddress({ ...customAddress, state: e.target.value })}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white"
                        placeholder="Maharashtra"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-700 font-semibold block mb-1">Postal PIN Code</label>
                      <input
                        type="text"
                        required
                        value={customAddress.postalCode}
                        onChange={(e) => setCustomAddress({ ...customAddress, postalCode: e.target.value })}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white font-mono"
                        placeholder="400066"
                      />
                    </div>
                  </div>
                </form>
              )}

              {checkoutError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-mono flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> {checkoutError}
                </div>
              )}

              <button
                type="button"
                onClick={handleProceedToLogistics}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 py-3.5 px-6 text-xs font-bold text-slate-950 shadow-md shadow-brand-500/20 hover:scale-[1.01] transition-all"
              >
                <span>Continue to Logistics & White-Glove Setup</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* STEP 2: LOGISTICS */}
          {step === 2 && (
            <div className="rounded-2xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-brand-600 font-bold">
                  STEP 2 OF 3
                </span>
                <h2 className="font-display text-2xl font-extrabold text-slate-900 mt-1">
                  Logistics & White-Glove Assembly
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Select your assembly preferences and provide floor/elevator access instructions.
                </p>
              </div>

              {/* Delivery Option */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Truck className="h-5 w-5 text-amber-600" />
                    <span className="font-display text-sm font-bold text-slate-900">
                      BlueDart Express Insured Heavy Freight
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-800">
                    FREE PRIVILEGE
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Direct climate-controlled air ride transport. Multi-tier wooden crates protecting your TV display panels and solid teak timber joinery.
                </p>
                <div className="text-[11px] font-mono text-amber-800 font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Estimated Delivery: Within 3 to 5 Business Days</span>
                </div>
              </div>

              {/* White-Glove Setup Toggle */}
              <div
                onClick={() => setWhiteGloveSetup(!whiteGloveSetup)}
                className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                  whiteGloveSetup
                    ? 'border-brand-500 bg-brand-50/80 ring-1 ring-brand-500/30'
                    : 'border-slate-200 bg-slate-50 hover:bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-5 w-5 text-brand-600" />
                    <div>
                      <div className="font-display text-sm font-bold text-slate-900">
                        Full Room-of-Choice White-Glove Installation
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Certified technicians uncrate, position, wall-mount OLED displays, and level furniture. Packaging materials removed upon signoff.
                      </p>
                    </div>
                  </div>
                  <div
                    className={`h-5 w-5 rounded-md border flex items-center justify-center ${
                      whiteGloveSetup ? 'bg-brand-500 border-brand-500 text-slate-950' : 'border-slate-300'
                    }`}
                  >
                    {whiteGloveSetup && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                </div>
              </div>

              {/* Floor access notes */}
              <div>
                <label className="text-xs font-mono text-slate-700 font-semibold block mb-1">
                  Access & Floor Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white"
                  placeholder="e.g. Elevator access available, contact concierge on arrival"
                />
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-mono font-medium"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Destination
                </button>
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 py-3.5 px-6 text-xs font-bold text-slate-950 shadow-md shadow-brand-500/20 hover:scale-[1.01] transition-all"
                >
                  <span>Continue to Payment</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD */}
          {step === 3 && (
            <div className="rounded-2xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-brand-600 font-bold">
                  STEP 3 OF 3
                </span>
                <h2 className="font-display text-2xl font-extrabold text-slate-900 mt-1">
                  Select Payment Method
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Encrypted 256-bit checkout with instant HMAC SHA-256 cryptographic verification.
                </p>
              </div>

              {/* Payment Selector Options */}
              <div className="space-y-3">
                {/* Razorpay Option */}
                <div
                  onClick={() => setPaymentMethod(PaymentMethod.RAZORPAY)}
                  className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                    paymentMethod === PaymentMethod.RAZORPAY
                      ? 'border-brand-500 bg-brand-50/80 ring-1 ring-brand-500/30'
                      : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-brand-600" />
                      <div>
                        <div className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
                          <span>Razorpay Secure Gateway</span>
                          <span className="rounded bg-sky-100 border border-sky-300 px-2 py-0.5 text-[10px] font-mono text-sky-800 font-bold">
                            CARDS • UPI • NETBANKING
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Instant confirmation, zero-cost EMI on major credit cards, Google Pay, PhonePe, and Net Banking.
                        </p>
                      </div>
                    </div>
                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === PaymentMethod.RAZORPAY ? 'border-brand-500 bg-brand-500' : 'border-slate-400'
                      }`}
                    >
                      {paymentMethod === PaymentMethod.RAZORPAY && <div className="h-1.5 w-1.5 rounded-full bg-slate-950" />}
                    </div>
                  </div>
                </div>

                {/* Cash on Delivery Option */}
                <div
                  onClick={() => setPaymentMethod(PaymentMethod.COD)}
                  className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                    paymentMethod === PaymentMethod.COD
                      ? 'border-brand-500 bg-brand-50/80 ring-1 ring-brand-500/30'
                      : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-brand-600" />
                      <div>
                        <div className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
                          <span>Pay on Delivery / White-Glove Installation</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Inspect your television and handcrafted teak furniture in person before making payment via UPI or Card machine.
                        </p>
                      </div>
                    </div>
                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === PaymentMethod.COD ? 'border-brand-500 bg-brand-500' : 'border-slate-400'
                      }`}
                    >
                      {paymentMethod === PaymentMethod.COD && <div className="h-1.5 w-1.5 rounded-full bg-slate-950" />}
                    </div>
                  </div>
                </div>
              </div>

              {checkoutError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-mono flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> {checkoutError}
                </div>
              )}

              {/* Navigation & Submit CTA */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-mono font-medium"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Logistics
                </button>

                <button
                  type="button"
                  onClick={handleInitiateOrder}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 py-3.5 px-8 text-xs font-bold text-slate-950 shadow-md shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>
                    {isSubmitting
                      ? 'Creating Order Snapshot...'
                      : paymentMethod === PaymentMethod.COD
                      ? `Confirm Order (₹${cart.summary.totalAmount.toLocaleString('en-IN')})`
                      : `Pay ₹${cart.summary.totalAmount.toLocaleString('en-IN')} via Razorpay`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Review Snapshot */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl bg-white p-6 border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-bold text-slate-900">Order Summary</h3>
              <span className="text-xs font-mono text-slate-500">{totalItems} Masterpieces</span>
            </div>

            {/* Compact items list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                      <Image
                        src={item.variant?.images?.[0]?.url || item.product?.images?.[0]?.url || ''}
                        alt="Product"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 line-clamp-1">{item.product?.name}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {item.variant?.title} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{item.totalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Financials Snapshot */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="text-slate-900 font-semibold">₹{cart.summary.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {cart.summary.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount:</span>
                  <span>-₹{cart.summary.couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>18% GST (Calculated):</span>
                <span className="text-slate-900">₹{cart.summary.taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>White-Glove Insured Delivery:</span>
                <span className="text-emerald-700 font-bold">COMPLIMENTARY</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-sm font-sans">
                <span className="font-bold text-slate-900">Payable Total:</span>
                <span className="font-display text-xl font-extrabold text-slate-900 font-mono">
                  ₹{cart.summary.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Delivery preview destination */}
            <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
              <span className="text-slate-500 font-mono text-[10px] uppercase font-bold">Shipping Destination:</span>
              <p className="text-slate-900 font-semibold">{activeShippingAddress.name}</p>
              <p className="text-slate-500 text-[11px]">
                {activeShippingAddress.addressLine1}, {activeShippingAddress.city} - {activeShippingAddress.postalCode}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SIMULATED RAZORPAY PAYMENT MODAL */}
      {/* ======================================================== */}
      {showRazorpayModal && activePendingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
            {/* Modal Header (Razorpay branded simulator) */}
            <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-slate-800 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky-700 font-black text-sm">
                  rzp
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-white">Divisha Electronics</h4>
                  <p className="text-[11px] font-mono text-sky-200">
                    Order Ref: {activePendingOrder.orderNumber}
                  </p>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs text-sky-200">Amount</span>
                <div className="text-base font-bold text-white">
                  ₹{activePendingOrder.totalAmount.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="flex border-b border-slate-200 text-xs font-mono">
              <button
                type="button"
                onClick={() => setRazorpayTab('upi')}
                className={`flex-1 py-3 text-center border-b-2 font-bold transition-all ${
                  razorpayTab === 'upi'
                    ? 'border-sky-600 text-sky-700 bg-sky-50'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                UPI / QR
              </button>
              <button
                type="button"
                onClick={() => setRazorpayTab('card')}
                className={`flex-1 py-3 text-center border-b-2 font-bold transition-all ${
                  razorpayTab === 'card'
                    ? 'border-sky-600 text-sky-700 bg-sky-50'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Cards (Visa/MC)
              </button>
              <button
                type="button"
                onClick={() => setRazorpayTab('netbanking')}
                className={`flex-1 py-3 text-center border-b-2 font-bold transition-all ${
                  razorpayTab === 'netbanking'
                    ? 'border-sky-600 text-sky-700 bg-sky-50'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Net Banking
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6 space-y-4 text-xs">
              {razorpayTab === 'upi' && (
                <div className="space-y-3">
                  <label className="text-slate-700 font-mono font-semibold block">Virtual Payment Address (VPA / UPI ID):</label>
                  <input
                    type="text"
                    value={simulatedUpiId}
                    onChange={(e) => setSimulatedUpiId(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-slate-900 font-mono focus:border-sky-500 focus:bg-white focus:outline-none"
                  />
                  <div className="flex gap-2">
                    {['@okhdfcbank', '@okaxis', '@okicici', '@paytm'].map((sfx) => (
                      <button
                        key={sfx}
                        type="button"
                        onClick={() => setSimulatedUpiId(`aarav.mehta${sfx}`)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-mono text-slate-600 hover:text-slate-900 hover:border-slate-300"
                      >
                        {sfx}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    A test payment request will be simulated and confirmed instantly with SHA-256 signature verification.
                  </p>
                </div>
              )}

              {razorpayTab === 'card' && (
                <div className="space-y-3 font-mono">
                  <div>
                    <label className="text-slate-600 block mb-1">Card Number</label>
                    <input
                      type="text"
                      disabled
                      value="4111 •••• •••• 1111 (Test Visa Platinum)"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-700"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-600 block mb-1">Expiry</label>
                      <input
                        type="text"
                        disabled
                        value="12 / 28"
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">CVV</label>
                      <input
                        type="password"
                        disabled
                        value="•••"
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              {razorpayTab === 'netbanking' && (
                <div className="grid grid-cols-2 gap-2 font-mono">
                  {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((bank) => (
                    <div
                      key={bank}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-slate-700 hover:border-sky-500 hover:bg-white cursor-pointer font-semibold"
                    >
                      {bank}
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleCompleteRazorpayPayment}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-600 py-3.5 px-6 font-bold text-white shadow-md hover:bg-sky-500 transition-all font-mono"
                >
                  <Lock className="h-4 w-4" />
                  <span>
                    {isProcessingPayment
                      ? 'Verifying Signature & Committing Stock...'
                      : `Simulate Successful Payment (₹${activePendingOrder.totalAmount.toLocaleString('en-IN')})`}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={() => setShowRazorpayModal(false)}
                  className="w-full text-center mt-2.5 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel and change payment method
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
