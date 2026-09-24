import { PaymentMethod, PaymentStatus, RefundStatus } from './enums.js';

export interface PaymentTransactionDTO {
  id: string;
  paymentId: string;
  gatewayTransactionId: string;
  provider: string; // "RAZORPAY", etc.
  amount: number;
  currency: string;
  status: PaymentStatus;
  rawResponse?: Record<string, any>;
  createdAt: string;
}

export interface PaymentDTO {
  id: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  provider: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
  transactions: PaymentTransactionDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface RazorpayOrderPayload {
  orderId: string;
  amount: number; // in paise (e.g. 500000 for ₹5,000)
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface VerifyPaymentInput {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface RefundDTO {
  id: string;
  paymentId: string;
  orderId: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  adminId?: string;
  processedAt?: string;
  createdAt: string;
}

export interface ProcessRefundInput {
  orderId: string;
  amount: number;
  reason: string;
}
