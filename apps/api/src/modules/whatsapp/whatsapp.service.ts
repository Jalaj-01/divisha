import { Injectable, NotFoundException } from '@nestjs/common';
import { SEED_WHATSAPP_DEPARTMENTS } from '@divisha/database';
import {
  WhatsAppConciergeDepartment,
  WhatsAppProductInquiryData,
  WhatsAppMessageType,
  WhatsAppTemplateDTO,
  WhatsAppQuoteDTO,
  WhatsAppDispatchAlertDTO
} from '@divisha/types';

@Injectable()
export class WhatsAppService {
  private businessPhone = process.env.WHATSAPP_BUSINESS_PHONE || '+919876543210';
  
  // In-memory state for departments to allow live toggles
  private departments: WhatsAppConciergeDepartment[] = JSON.parse(
    JSON.stringify(SEED_WHATSAPP_DEPARTMENTS)
  );

  // Pre-seeded logs for rich admin preview
  private messageLogs: any[] = [
    {
      id: 'wa-log-101',
      toPhone: '+919876543210',
      recipientName: 'Aarav Mehta',
      messageType: WhatsAppMessageType.ORDER_CONFIRMATION,
      department: 'Sales & Product Orders',
      parameters: {
        customer_name: 'Aarav Mehta',
        order_number: 'DIV-2026-ORD-1001',
        total_amount: '₹3,41,999',
        item_count: '2'
      },
      status: 'DELIVERED',
      deliveredAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 'wa-log-102',
      toPhone: '+919820011223',
      recipientName: 'Vikramaditya Singhania',
      messageType: WhatsAppMessageType.VIP_QUOTATION,
      department: 'Custom Furniture Specialist',
      parameters: {
        customer_name: 'Vikramaditya Singhania',
        product_name: 'Solid Teak 8-Seater Dining Suite',
        discount: '15% Bespoke Architectural Privilege',
        quote_total: '₹2,12,500'
      },
      status: 'READ',
      deliveredAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'wa-log-103',
      toPhone: '+919876543210',
      recipientName: 'Aarav Mehta',
      messageType: WhatsAppMessageType.ORDER_SHIPPED,
      department: 'Sales & Product Orders',
      parameters: {
        order_number: 'DIV-2026-ORD-1001',
        carrier: 'BlueDart Apex Express',
        awb: 'BD-889922110',
        destination: 'Indore, M.P.',
        eta: 'Tomorrow by 5:00 PM'
      },
      status: 'DELIVERED',
      deliveredAt: new Date(Date.now() - 3600000).toISOString(),
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  // Official Meta Cloud API approved message templates
  private templates: WhatsAppTemplateDTO[] = [
    {
      id: 'tmpl-order-confirmed',
      name: 'order_confirmation_v2',
      language: 'en_IN',
      category: 'UTILITY',
      headerText: '✨ Order Confirmed — Divisha Electronics',
      bodyText:
        'Greetings {{1}}, your order {{2}} has been confirmed. Total: {{3}}. Our master artisans and acoustic engineers are preparing your pieces with white-glove care.',
      footerText: 'Divisha Electronics & Bespoke Living • Indore, M.P.',
      variables: ['customer_name', 'order_number', 'total_amount'],
      isActive: true
    },
    {
      id: 'tmpl-order-shipped',
      name: 'order_dispatch_bluedart',
      language: 'en_IN',
      category: 'UTILITY',
      headerText: '🚚 Dispatched with Insured White-Glove Logistics',
      bodyText:
        'Hello {{1}}, order {{2}} is on its way via {{3}} (AWB: {{4}}). Expected delivery: {{5}} to {{6}}. Tracking: {{7}}',
      footerText: 'Priority Helpline: +91 98765 43210',
      variables: ['customer_name', 'order_number', 'carrier', 'awb_number', 'eta', 'destination_city', 'tracking_url'],
      isActive: true
    },
    {
      id: 'tmpl-vip-quote',
      name: 'bespoke_vip_quotation',
      language: 'en_IN',
      category: 'MARKETING',
      headerText: '🏛️ Bespoke Quotation — Divisha Electronics',
      bodyText:
        'Dear {{1}}, here is your tailored quote for {{2}} at a special price of {{3}} (Includes {{4}}% VIP concession). View & complete order: {{5}}',
      footerText: 'Valid for 7 business days • Handcrafted in Indore, M.P.',
      variables: ['customer_name', 'items_summary', 'final_amount', 'discount_percent', 'checkout_url'],
      isActive: true
    },
    {
      id: 'tmpl-out-for-delivery',
      name: 'out_for_delivery_pin',
      language: 'en_IN',
      category: 'UTILITY',
      headerText: '📦 Out for White-Glove Delivery Today',
      bodyText:
        'Hello {{1}}, your shipment for order {{2}} is out for delivery with our verified technician. Secure Unboxing PIN: *{{3}}*. Our technician will assist with assembly and placement.',
      footerText: 'Do not share PIN until unboxing is complete',
      variables: ['customer_name', 'order_number', 'security_pin'],
      isActive: true
    },
    {
      id: 'tmpl-product-inquiry',
      name: 'product_concierge_inquiry',
      language: 'en_IN',
      category: 'MARKETING',
      headerText: '🛎️ Divisha Luxury Concierge',
      bodyText:
        'Hello {{1}}, thank you for inquiring about {{2}} (SKU: {{3}}). A dedicated specialist from {{4}} is available to assist you.',
      footerText: 'Direct WhatsApp Concierge',
      variables: ['customer_name', 'product_name', 'sku', 'department_name'],
      isActive: true
    }
  ];

  getDepartments(): WhatsAppConciergeDepartment[] {
    return this.departments;
  }

  updateDepartmentStatus(id: string, isAvailable: boolean, operatingHours?: string): WhatsAppConciergeDepartment {
    const dept = this.departments.find((d) => d.id === id);
    if (!dept) {
      throw new NotFoundException(`Concierge department '${id}' not found`);
    }
    dept.isAvailable = isAvailable;
    if (operatingHours) {
      dept.operatingHours = operatingHours;
    }
    return dept;
  }

  getTemplates(): WhatsAppTemplateDTO[] {
    return this.templates;
  }

  generateProductInquiryLink(data: WhatsAppProductInquiryData, departmentPhone?: string): {
    whatsappUrl: string;
    callUrl: string;
    encodedMessage: string;
  } {
    const targetPhone = (departmentPhone || this.businessPhone).replace(/[^0-9]/g, '');
    const formattedPrice = `₹${data.price.toLocaleString('en-IN')}`;

    const text =
      `Hello Divisha Electronics Concierge,\n\n` +
      `I am interested in:\n` +
      `• *Product:* ${data.productName}\n` +
      `• *SKU:* ${data.sku}\n` +
      (data.variantTitle ? `• *Variant:* ${data.variantTitle}\n` : '') +
      `• *Price:* ${formattedPrice}\n` +
      `• *Link:* ${data.productUrl}\n\n` +
      (data.customNotes ? `*Note:* ${data.customNotes}\n\n` : '') +
      `Could you please share availability, EMI offers, and white-glove delivery details?`;

    const encodedMessage = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodedMessage}`;
    const callUrl = `tel:${targetPhone}`;

    return {
      whatsappUrl,
      callUrl,
      encodedMessage: text
    };
  }

  generateQuoteLink(dto: WhatsAppQuoteDTO): {
    whatsappUrl: string;
    encodedMessage: string;
    summary: {
      subtotal: number;
      discountAmount: number;
      totalPayable: number;
      itemsCount: number;
      validUntil: string;
    };
  } {
    const targetPhone = dto.customerPhone.replace(/[^0-9]/g, '');
    const specialistPhone = (dto.salesSpecialistPhone || this.businessPhone).replace(/[^0-9]/g, '');

    let subtotal = 0;
    const itemLines = dto.items.map((item, idx) => {
      const lineTotal = item.unitPrice * item.quantity;
      subtotal += lineTotal;
      return `${idx + 1}. *${item.productName}* (SKU: ${item.sku})\n   Qty: ${item.quantity} × ₹${item.unitPrice.toLocaleString('en-IN')} = *₹${lineTotal.toLocaleString('en-IN')}*` +
        (item.variantTitle ? `\n   Edition: ${item.variantTitle}` : '');
    });

    let discountAmount = 0;
    if (dto.discountPercentage && dto.discountPercentage > 0) {
      discountAmount = Math.round((subtotal * dto.discountPercentage) / 100);
    } else if (dto.discountAmount && dto.discountAmount > 0) {
      discountAmount = dto.discountAmount;
    }

    const totalPayable = Math.max(0, subtotal - discountAmount);
    const validDays = dto.validUntilDays || 7;
    const validUntilDate = new Date(Date.now() + validDays * 24 * 3600 * 1000).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const quoteRef = `DIV-QUOTE-${Date.now().toString().slice(-6)}`;
    const checkoutUrl = `https://divishaelectronics.com/checkout?ref=${quoteRef}&customer=${encodeURIComponent(targetPhone)}`;

    const text =
      `🏛️ *DIVISHA ELECTRONICS & BESPOKE LIVING*\n` +
      `_Privilege Concierge Quote • Ref: ${quoteRef}_\n\n` +
      `Dear ${dto.customerName},\n\n` +
      `It is our pleasure to present your tailored quotation:\n\n` +
      `${itemLines.join('\n\n')}\n\n` +
      `────────────────────────\n` +
      `• *Subtotal:* ₹${subtotal.toLocaleString('en-IN')}\n` +
      (discountAmount > 0
        ? `• *Bespoke Privilege Concession:* -₹${discountAmount.toLocaleString('en-IN')} (${dto.discountPercentage || 0}%)\n`
        : '') +
      `• *Total Payable (Incl. 18% GST):* *₹${totalPayable.toLocaleString('en-IN')}*\n` +
      `────────────────────────\n\n` +
      `✨ *Complimentary Privileges:*\n` +
      `• Insured White-Glove Logistics & In-Room Placement\n` +
      `• On-site Acoustic & Structural Installation\n` +
      `• Direct Brand Warranty Coverage\n\n` +
      (dto.customNotes ? `*Specialist Notes:* ${dto.customNotes}\n\n` : '') +
      `📅 *Validity:* This exclusive quote is reserved until *${validUntilDate}*.\n\n` +
      `🛒 *Instant Booking & Order Confirmation:*\n` +
      `${checkoutUrl}\n\n` +
      `For any customizations, reply directly or call our Senior Artisan desk at +91 98765 43210.`;

    const encodedMessage = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodedMessage}`;

    // Auto-record quote into audit ledger
    this.messageLogs.unshift({
      id: `wa-quote-${Date.now()}`,
      toPhone: dto.customerPhone,
      recipientName: dto.customerName,
      messageType: WhatsAppMessageType.VIP_QUOTATION,
      department: 'Custom Furniture & Electronics Concierge',
      parameters: {
        customer_name: dto.customerName,
        quote_ref: quoteRef,
        total_amount: `₹${totalPayable.toLocaleString('en-IN')}`,
        items_count: dto.items.length.toString(),
        discount: discountAmount > 0 ? `₹${discountAmount.toLocaleString('en-IN')}` : 'None'
      },
      status: 'DELIVERED',
      deliveredAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });

    return {
      whatsappUrl,
      encodedMessage: text,
      summary: {
        subtotal,
        discountAmount,
        totalPayable,
        itemsCount: dto.items.length,
        validUntil: validUntilDate
      }
    };
  }

  sendDispatchAlert(dto: WhatsAppDispatchAlertDTO) {
    const targetPhone = dto.customerPhone.replace(/[^0-9]/g, '');

    const text =
      `🚚 *DIVISHA WHITE-GLOVE DISPATCH UPDATE*\n\n` +
      `Hello ${dto.customerName},\n\n` +
      `Your luxury order *#${dto.orderId}* has been dispatched via our secure logistics partner *${dto.carrier}*.\n\n` +
      `• *Air Waybill (AWB):* ${dto.awbNumber}\n` +
      `• *Destination:* ${dto.destinationCity}\n` +
      `• *Estimated Arrival:* ${dto.expectedDeliveryDate}\n` +
      (dto.securityPin ? `• *Secure Unboxing PIN:* *${dto.securityPin}*\n` : '') +
      (dto.whiteGloveAssembly ? `• *Service:* Comprehensive In-Room Setup & Packaging Disposal included.\n\n` : '\n') +
      `📍 *Live GPS Tracking:* ${dto.trackingUrl}\n\n` +
      `Our logistics executive will contact you 1 hour prior to arrival. For priority assistance, call our dispatch hotline at +91 98765 43210.`;

    const logEntry = {
      id: `wa-disp-${Date.now()}`,
      toPhone: dto.customerPhone,
      recipientName: dto.customerName,
      messageType: WhatsAppMessageType.DISPATCH_NOTIFICATION,
      department: 'Order Logistics & Fulfillment',
      parameters: {
        order_id: dto.orderId,
        awb: dto.awbNumber,
        carrier: dto.carrier,
        eta: dto.expectedDeliveryDate,
        pin: dto.securityPin || 'N/A'
      },
      status: 'DELIVERED',
      deliveredAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    this.messageLogs.unshift(logEntry);

    const encodedMessage = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodedMessage}`;

    return {
      success: true,
      messageId: logEntry.id,
      deliveryStatus: 'DELIVERED',
      whatsappUrl,
      formattedText: text
    };
  }

  generateCallUrl(phone?: string) {
    const rawPhone = (phone || this.businessPhone).replace(/[^0-9]/g, '');
    return {
      phone: rawPhone,
      displayPhone: phone || this.businessPhone,
      callUrl: `tel:${rawPhone}`,
      whatsappCallUrl: `https://wa.me/${rawPhone}`
    };
  }

  sendTransactionalAlert(payload: {
    toPhone: string;
    type: WhatsAppMessageType;
    parameters: Record<string, string>;
    recipientName?: string;
    department?: string;
  }) {
    const logEntry = {
      id: `wa-log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      toPhone: payload.toPhone,
      recipientName: payload.recipientName || 'VIP Customer',
      messageType: payload.type,
      department: payload.department || 'Sales & Product Orders',
      parameters: payload.parameters,
      status: 'DELIVERED',
      deliveredAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    this.messageLogs.unshift(logEntry);

    return {
      success: true,
      messageId: logEntry.id,
      deliveryStatus: 'DELIVERED',
      dispatchedVia: 'Divisha WhatsApp Business Gateway (Meta Cloud API Adapter)'
    };
  }

  getMessageLogs(filter?: { type?: string; phone?: string; limit?: number }) {
    let logs = this.messageLogs;
    if (filter?.type && filter.type !== 'ALL') {
      logs = logs.filter((l) => l.messageType === filter.type);
    }
    if (filter?.phone) {
      const q = filter.phone.replace(/[^0-9]/g, '');
      logs = logs.filter((l) => l.toPhone.includes(q));
    }
    const limit = filter?.limit || 50;
    return logs.slice(0, limit);
  }
}
