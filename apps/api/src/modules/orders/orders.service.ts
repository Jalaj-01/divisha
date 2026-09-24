import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { db } from '@divisha/database';
import {
  OrderDTO,
  OrderFilterParams,
  OrderStatus,
  PaymentStatus,
  ShipmentStatus,
  InventoryTransactionReason
} from '@divisha/types';

export interface TransitionOrderInput {
  status: OrderStatus;
  notes?: string;
  carrier?: string;
  trackingNumber?: string;
  adminId?: string;
}

@Injectable()
export class OrdersService {
  findByOrderNumber(orderNumber: string): OrderDTO {
    const order = db.orders.find(
      (o) => o.orderNumber.toUpperCase() === orderNumber.toUpperCase() || o.id === orderNumber
    );
    if (!order) {
      throw new NotFoundException(`Order with identifier '${orderNumber}' not found`);
    }
    return order;
  }

  findByUserId(userId: string): OrderDTO[] {
    return db.orders.filter((o) => o.userId === userId);
  }

  findAll(filters: OrderFilterParams = {}) {
    let filtered = [...db.orders];
    if (filters.status) {
      filtered = filtered.filter((o) => o.status === filters.status);
    }
    if (filters.paymentStatus) {
      filtered = filtered.filter((o) => o.paymentStatus === filters.paymentStatus);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q) ||
          o.customerPhone.includes(q) ||
          (o.shipment?.trackingNumber && o.shipment.trackingNumber.toLowerCase().includes(q))
      );
    }
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const startIndex = (page - 1) * limit;

    return {
      items: filtered.slice(startIndex, startIndex + limit),
      total: filtered.length,
      page,
      limit
    };
  }

  updateOrderStatus(orderId: string, input: TransitionOrderInput): OrderDTO {
    const order = db.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) {
      throw new NotFoundException(`Order '${orderId}' not found`);
    }

    const currentStatus = order.status;
    const targetStatus = input.status;

    // Validate state machine transitions
    if (currentStatus === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot modify an order that has already been cancelled.');
    }
    if (currentStatus === OrderStatus.DELIVERED && targetStatus !== OrderStatus.REFUND_REQUESTED) {
      throw new BadRequestException('Delivered orders can only transition to REFUND_REQUESTED.');
    }

    // Cancellation rule: cannot cancel after shipment has left warehouse
    if (targetStatus === OrderStatus.CANCELLED) {
      if (currentStatus === OrderStatus.SHIPPED || currentStatus === OrderStatus.OUT_FOR_DELIVERY) {
        throw new BadRequestException('Order cannot be cancelled after dispatch. Please initiate a return request upon delivery.');
      }

      // Replenish warehouse inventory for all items in order
      order.items.forEach((item) => {
        db.adjustStock(
          item.variantId,
          item.quantity,
          InventoryTransactionReason.RETURN,
          `Restock from cancelled order ${order.orderNumber}: ${input.notes || 'Cancelled by admin'}`,
          input.adminId || 'admin-operations'
        );
      });

      if (order.paymentStatus === PaymentStatus.SUCCESSFUL) {
        order.paymentStatus = PaymentStatus.REFUNDED;
      }
    }

    // Shipping transition: assign or update carrier & tracking
    if (targetStatus === OrderStatus.SHIPPED) {
      const carrier = input.carrier || order.shipment?.carrier || 'BlueDart Express White-Glove';
      const trackingNumber =
        input.trackingNumber || order.shipment?.trackingNumber || `BD${Date.now().toString().slice(-8)}IN`;

      order.shipment = {
        id: order.shipment?.id || `ship-${Date.now()}`,
        orderId: order.id,
        carrier,
        trackingNumber,
        status: ShipmentStatus.IN_TRANSIT,
        shippedAt: new Date().toISOString(),
        estimatedDeliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
      };
    } else if (targetStatus === OrderStatus.OUT_FOR_DELIVERY && order.shipment) {
      order.shipment.status = ShipmentStatus.OUT_FOR_DELIVERY;
    } else if (targetStatus === OrderStatus.DELIVERED && order.shipment) {
      order.shipment.status = ShipmentStatus.DELIVERED;
      order.shipment.actualDeliveryDate = new Date().toISOString();
      if (order.paymentMethod === 'COD' as any) {
        order.paymentStatus = PaymentStatus.SUCCESSFUL;
      }
    }

    order.status = targetStatus;
    order.updatedAt = new Date().toISOString();

    // Append timeline entry
    order.timeline.push({
      id: `time-${Date.now()}`,
      orderId: order.id,
      status: targetStatus,
      title: `Order Transitioned to ${targetStatus}`,
      description: input.notes || `Order status updated to ${targetStatus} by administrative fulfillment specialist`,
      createdAt: new Date().toISOString()
    });

    // Record immutable audit log
    db.recordAuditLog({
      adminId: input.adminId || 'admin-fulfillment',
      action: 'ORDER_STATUS_TRANSITION',
      entity: 'Order',
      entityId: order.id,
      beforeState: { status: currentStatus },
      afterState: { status: targetStatus, notes: input.notes, carrier: input.carrier, trackingNumber: input.trackingNumber }
    });

    return order;
  }

  cancelOrder(orderId: string, reason: string, adminId?: string): OrderDTO {
    return this.updateOrderStatus(orderId, {
      status: OrderStatus.CANCELLED,
      notes: reason || 'Customer requested order cancellation',
      adminId
    });
  }

  generateTaxInvoice(orderId: string) {
    const order = this.findByOrderNumber(orderId);

    const invoiceNumber = `INV-2026-${order.orderNumber.replace('DIV-2026-', '')}`;
    const invoiceDate = order.createdAt;

    const companyDetails = {
      name: 'Divisha Electronics & Bespoke Living Private Limited',
      tradeName: 'DIVISHA SIGNATURE',
      gstin: '23AABCD1234F1Z5',
      pan: 'AABCD1234F',
      cin: 'U52100MP2026PTC123456',
      registeredAddress: 'Divisha Tower, A.B. Road, Vijay Nagar, Indore, Madhya Pradesh - 452010',
      supportEmail: 'concierge@divisha.com',
      supportPhone: '+91 98765 43210',
      stateOfSupply: 'Madhya Pradesh (State Code: 23)'
    };

    const isIntraState =
      order.shippingAddress.state?.toLowerCase().includes('madhya pradesh') ||
      order.shippingAddress.state?.toLowerCase() === 'mp' ||
      order.shippingAddress.state?.toLowerCase() === 'm.p.' ||
      order.shippingAddress.state?.toLowerCase() === 'm.p';

    const itemized = order.items.map((item, index) => {
      // HSN 8528 for Televisions/Monitors, HSN 9403 for Timber Furniture
      const isFurniture =
        item.productName.toLowerCase().includes('teak') ||
        item.productName.toLowerCase().includes('table') ||
        item.productName.toLowerCase().includes('sofa') ||
        item.productName.toLowerCase().includes('bed');
      const hsnCode = isFurniture ? '9403' : '8528';

      const taxableValue = Math.round((item.totalAmount / 1.18) * 100) / 100;
      const totalTax = Math.round((item.totalAmount - taxableValue) * 100) / 100;
      const cgst = isIntraState ? Math.round((totalTax / 2) * 100) / 100 : 0;
      const sgst = isIntraState ? Math.round((totalTax / 2) * 100) / 100 : 0;
      const igst = !isIntraState ? totalTax : 0;

      return {
        serialNo: index + 1,
        description: `${item.productName} — ${item.variantTitle}`,
        sku: item.sku,
        hsnCode,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxableValue,
        gstRate: '18%',
        cgst,
        sgst,
        igst,
        totalAmount: item.totalAmount
      };
    });

    const totalTaxable = itemized.reduce((acc, i) => acc + i.taxableValue, 0);
    const totalCGST = itemized.reduce((acc, i) => acc + i.cgst, 0);
    const totalSGST = itemized.reduce((acc, i) => acc + i.sgst, 0);
    const totalIGST = itemized.reduce((acc, i) => acc + i.igst, 0);

    const digitalVerificationHash = crypto
      .createHmac('sha256', 'divisha_tax_authority_secret')
      .update(`${invoiceNumber}|${order.orderNumber}|${order.totalAmount}`)
      .digest('hex');

    return {
      success: true,
      invoice: {
        invoiceNumber,
        invoiceDate,
        companyDetails,
        billTo: {
          name: order.customerName,
          phone: order.customerPhone,
          email: order.customerEmail,
          address: `${order.billingAddress.addressLine1}, ${order.billingAddress.addressLine2 || ''} ${order.billingAddress.city}, ${order.billingAddress.state} - ${order.billingAddress.postalCode}`
        },
        shipTo: {
          name: order.shippingAddress.name,
          phone: order.shippingAddress.phone,
          address: `${order.shippingAddress.addressLine1}, ${order.shippingAddress.addressLine2 || ''} ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}`
        },
        paymentDetails: {
          method: order.paymentMethod,
          status: order.paymentStatus,
          orderReference: order.orderNumber
        },
        items: itemized,
        summary: {
          taxableAmount: totalTaxable,
          cgstAmount: totalCGST,
          sgstAmount: totalSGST,
          igstAmount: totalIGST,
          totalTax: totalCGST + totalSGST + totalIGST,
          shippingCharge: order.shippingAmount,
          discountAmount: order.discountAmount,
          grandTotal: order.totalAmount,
          currency: 'INR'
        },
        digitalVerificationHash
      }
    };
  }

  getShipments() {
    return db.orders
      .filter((o) => o.shipment || o.status !== OrderStatus.PENDING)
      .map((o) => ({
        orderId: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        city: o.shippingAddress.city,
        state: o.shippingAddress.state,
        orderStatus: o.status,
        shipment: o.shipment || {
          id: `ship-${o.id}`,
          orderId: o.id,
          carrier: 'BlueDart Express White-Glove',
          trackingNumber: `BD${o.orderNumber.replace(/[^0-9]/g, '').slice(-8)}IN`,
          status: o.status === OrderStatus.DELIVERED ? ShipmentStatus.DELIVERED : ShipmentStatus.ORDER_CREATED,
          estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      }));
  }
}
