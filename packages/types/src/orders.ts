import { OrderStatus, PaymentStatus, PaymentMethod, ShipmentStatus } from './enums.js';
import { AddressDTO } from './users.js';

export interface OrderItemDTO {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  productName: string;
  productSlug: string;
  variantTitle: string;
  sku: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
}

export interface OrderTimelineDTO {
  id: string;
  orderId: string;
  status: OrderStatus;
  title: string;
  description: string;
  createdAt: string;
}

export interface ShipmentDTO {
  id: string;
  orderId: string;
  carrier: string;
  trackingNumber: string;
  trackingUrl?: string;
  status: ShipmentStatus;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  shippedAt?: string;
}

export interface OrderDTO {
  id: string;
  orderNumber: string; // e.g. "DIV-2026-94821"
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  items: OrderItemDTO[];
  shippingAddress: AddressDTO;
  billingAddress: AddressDTO;
  subtotal: number;
  discountAmount: number;
  couponCode?: string | null;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  shipment?: ShipmentDTO | null;
  timeline: OrderTimelineDTO[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  shippingAddressId: string;
  billingAddressId?: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  customerNotes?: string;
}

export interface OrderFilterParams {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
