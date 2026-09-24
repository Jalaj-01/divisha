import { Injectable, BadRequestException } from '@nestjs/common';
import { db } from '@divisha/database';
import { AnalyticsEventDTO, DashboardKpiDTO } from '@divisha/types';

function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

@Injectable()
export class AnalyticsService {
  recordEvent(event: AnalyticsEventDTO) {
    const record: AnalyticsEventDTO = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: event.timestamp || new Date().toISOString()
    };
    db.analyticsEvents.unshift(record);
    if (db.analyticsEvents.length > 2000) {
      db.analyticsEvents.pop();
    }
    return { success: true, eventRecorded: true, id: record.id };
  }

  getEvents(limit = 50): AnalyticsEventDTO[] {
    return db.analyticsEvents.slice(0, limit);
  }

  getDashboardKPIs(): DashboardKpiDTO {
    return db.getDashboardKPIs();
  }

  generateCsvReport(type: 'orders' | 'inventory' | 'tax'): { filename: string; content: string } {
    const timestamp = new Date().toISOString().split('T')[0];

    if (type === 'orders') {
      const headers = [
        'Order Reference',
        'Order Date',
        'Customer Name',
        'Customer Email',
        'Customer Phone',
        'Order Status',
        'Payment Status',
        'Payment Method',
        'Items Count',
        'Subtotal (INR)',
        'Coupon Code',
        'Discount (INR)',
        'Tax Amount (INR)',
        'Shipping (INR)',
        'Total Amount (INR)',
        'Delivery City',
        'Delivery State',
        'Courier Carrier',
        'Tracking Number'
      ];

      const rows = db.orders.map((o) => [
        escapeCsv(o.orderNumber),
        escapeCsv(o.createdAt),
        escapeCsv(o.customerName),
        escapeCsv(o.customerEmail),
        escapeCsv(o.customerPhone),
        escapeCsv(o.status),
        escapeCsv(o.paymentStatus),
        escapeCsv(o.paymentMethod),
        escapeCsv(o.items?.length || 0),
        escapeCsv(o.subtotal),
        escapeCsv(o.couponCode || 'NONE'),
        escapeCsv(o.discountAmount),
        escapeCsv(o.taxAmount),
        escapeCsv(o.shippingAmount),
        escapeCsv(o.totalAmount),
        escapeCsv(o.shippingAddress?.city || 'N/A'),
        escapeCsv(o.shippingAddress?.state || 'N/A'),
        escapeCsv(o.shipment?.carrier || 'BlueDart Express White-Glove'),
        escapeCsv(o.shipment?.trackingNumber || 'PENDING_MANIFEST')
      ]);

      const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
      return {
        filename: `divisha-orders-ledger-${timestamp}.csv`,
        content: csv
      };
    }

    if (type === 'inventory') {
      const headers = [
        'SKU',
        'Product Name',
        'Variant Edition',
        'Category',
        'Unit Price (INR)',
        'Sale Price (INR)',
        'On Hand Stock',
        'Reserved Stock',
        'Available Stock',
        'Low Stock Threshold',
        'Stock Status'
      ];

      const rows: string[][] = [];
      db.products.forEach((prod) => {
        prod.variants.forEach((v) => {
          const inv = db.inventory.get(v.id) || { stock: v.stock, reserved: 0, lowThreshold: 5 };
          const available = Math.max(0, inv.stock - inv.reserved);
          let status = 'In Stock';
          if (inv.stock <= 0) status = 'Out of Stock';
          else if (available <= inv.lowThreshold) status = 'Low Stock';

          rows.push([
            escapeCsv(v.sku),
            escapeCsv(prod.name),
            escapeCsv(v.title),
            escapeCsv(prod.category?.name || 'Electronics & Furniture'),
            escapeCsv(v.price),
            escapeCsv(v.salePrice || v.price),
            escapeCsv(inv.stock),
            escapeCsv(inv.reserved),
            escapeCsv(available),
            escapeCsv(inv.lowThreshold),
            escapeCsv(status)
          ]);
        });
      });

      const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
      return {
        filename: `divisha-inventory-valuation-${timestamp}.csv`,
        content: csv
      };
    }

    if (type === 'tax') {
      const headers = [
        'Invoice Number',
        'Invoice Date',
        'Company Name',
        'Company GSTIN',
        'State of Supply',
        'Customer Name',
        'Customer State',
        'Supply Type',
        'HSN Code',
        'Item Description',
        'Quantity',
        'Unit Price (INR)',
        'Taxable Value (INR)',
        'GST Rate',
        'CGST Amount (INR)',
        'SGST Amount (INR)',
        'IGST Amount (INR)',
        'Total Tax (INR)',
        'Total Invoice Value (INR)'
      ];

      const rows: string[][] = [];
      const companyGstin = '23AABCD1234F1Z5';
      const stateOfSupply = 'Madhya Pradesh (State Code: 23)';

      db.orders.forEach((o) => {
        const isIntraState =
          o.shippingAddress?.state?.toLowerCase().includes('madhya pradesh') ||
          o.shippingAddress?.state?.toLowerCase() === 'mp' ||
          o.shippingAddress?.state?.toLowerCase() === 'm.p.' ||
          o.shippingAddress?.state?.toLowerCase() === 'm.p';

        const supplyType = isIntraState ? 'Intrastate (Within MP)' : 'Interstate (Out of MP)';

        o.items.forEach((item) => {
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

          rows.push([
            escapeCsv(`INV-2026-${o.orderNumber.replace('DIV-2026-', '')}`),
            escapeCsv(o.createdAt.split('T')[0]),
            escapeCsv('Divisha Electronics Private Limited'),
            escapeCsv(companyGstin),
            escapeCsv(stateOfSupply),
            escapeCsv(o.customerName),
            escapeCsv(o.shippingAddress?.state || 'Madhya Pradesh'),
            escapeCsv(supplyType),
            escapeCsv(hsnCode),
            escapeCsv(`${item.productName} — ${item.variantTitle}`),
            escapeCsv(item.quantity),
            escapeCsv(item.unitPrice),
            escapeCsv(taxableValue),
            escapeCsv('18%'),
            escapeCsv(cgst),
            escapeCsv(sgst),
            escapeCsv(igst),
            escapeCsv(totalTax),
            escapeCsv(item.totalAmount)
          ]);
        });
      });

      const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
      return {
        filename: `divisha-gst-tax-reconciliation-mp-${timestamp}.csv`,
        content: csv
      };
    }

    throw new BadRequestException(`Unsupported report type '${type}'. Supported types: orders, inventory, tax`);
  }
}
