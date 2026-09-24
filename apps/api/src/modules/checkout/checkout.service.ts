import { Injectable, BadRequestException } from '@nestjs/common';
import { db } from '@divisha/database';
import {
  OrderDTO,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  ShipmentStatus,
  InventoryTransactionReason
} from '@divisha/types';
import { CartService } from '../cart/cart.service.js';

export interface CheckoutInput {
  cartId: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    type: 'HOME' | 'WORK';
  };
  paymentMethod: PaymentMethod;
  notes?: string;
}

@Injectable()
export class CheckoutService {
  constructor(private readonly cartService: CartService) {}

  createPendingOrder(input: CheckoutInput): OrderDTO {
    const cart = this.cartService.getOrCreateCart(input.cartId);
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cannot checkout an empty shopping cart');
    }

    // 1. Verify all items are in stock and lock quantities
    for (const item of cart.items) {
      const available = db.getStock(item.variantId);
      if (available < item.quantity) {
        throw new BadRequestException(
          `Item '${item.product?.name || item.productId}' (${item.variant?.title}) is out of stock. Available: ${available}, Requested: ${item.quantity}`
        );
      }
    }

    // 2. Reserve stock in inventory to prevent race conditions during payment
    cart.items.forEach((item) => {
      const inv = db.inventory.get(item.variantId);
      if (inv) {
        inv.reserved += item.quantity;
      }
    });

    // 3. Create frozen price snapshots
    const orderItems = cart.items.map((item) => {
      const unitPrice = item.unitSalePrice || item.unitPrice;
      const totalAmount = unitPrice * item.quantity;
      const taxAmount = Math.round(totalAmount * 0.18 * 100) / 100;
      return {
        id: `ord-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        orderId: '', // populated below
        productId: item.productId,
        variantId: item.variantId,
        productName: item.product?.name || 'Product',
        productSlug: item.product?.slug || '',
        variantTitle: item.variant?.title || 'Standard',
        sku: item.variant?.sku || 'SKU',
        imageUrl: item.variant?.images[0]?.url || item.product?.images[0]?.url,
        quantity: item.quantity,
        unitPrice,
        taxAmount,
        discountAmount: 0,
        totalAmount
      };
    });

    const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const randomOrderDigits = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `DIV-2026-${randomOrderDigits}`;

    orderItems.forEach((oi) => (oi.orderId = orderId));

    const newOrder: OrderDTO = {
      id: orderId,
      orderNumber,
      userId: input.userId || 'usr-customer-01',
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      status: input.paymentMethod === PaymentMethod.COD ? OrderStatus.CONFIRMED : OrderStatus.PENDING,
      paymentStatus: input.paymentMethod === PaymentMethod.COD ? PaymentStatus.PENDING : PaymentStatus.PENDING,
      paymentMethod: input.paymentMethod,
      items: orderItems,
      shippingAddress: {
        id: `addr-${Date.now()}`,
        ...input.shippingAddress,
        isDefault: true
      },
      billingAddress: {
        id: `addr-${Date.now()}`,
        ...input.shippingAddress,
        isDefault: true
      },
      subtotal: cart.summary.subtotal,
      discountAmount: cart.summary.couponDiscount,
      couponCode: cart.summary.couponCode,
      taxAmount: cart.summary.taxAmount,
      shippingAmount: cart.summary.shippingAmount,
      totalAmount: cart.summary.totalAmount,
      timeline: [
        {
          id: `time-${Date.now()}`,
          orderId,
          status: OrderStatus.PENDING,
          title: 'Order Created',
          description: `Order ${orderNumber} placed for ₹${cart.summary.totalAmount.toLocaleString('en-IN')}`,
          createdAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // If COD, commit inventory immediately
    if (input.paymentMethod === PaymentMethod.COD) {
      newOrder.items.forEach((item) => {
        db.adjustStock(
          item.variantId,
          -item.quantity,
          InventoryTransactionReason.SALE,
          `COD Order ${orderNumber} confirmed`
        );
      });
      newOrder.shipment = {
        id: `ship-${Date.now()}`,
        orderId,
        carrier: 'BlueDart Express White-Glove',
        trackingNumber: `BD${Date.now().toString().slice(-8)}IN`,
        status: ShipmentStatus.ORDER_CREATED,
        estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      };
    }

    db.orders.unshift(newOrder);

    // Clear cart items
    cart.items = [];
    cart.summary = {
      subtotal: 0,
      discount: 0,
      taxAmount: 0,
      shippingAmount: 0,
      totalAmount: 0,
      couponCode: null,
      couponDiscount: 0
    };
    db.carts.set(cart.id, cart);

    return newOrder;
  }
}
