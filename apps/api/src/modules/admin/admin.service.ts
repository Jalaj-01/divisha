import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db } from '@divisha/database';
import {
  OrderStatus,
  ShipmentStatus,
  PermissionCode,
  CreateAdminUserInput,
  UpdateAdminUserInput
} from '@divisha/types';

@Injectable()
export class AdminService {
  getDashboard() {
    return db.getDashboardKPIs();
  }

  getAuditLogs() {
    return db.auditLogs;
  }

  updateOrderStatus(orderId: string, status: OrderStatus, notes?: string, adminId?: string) {
    const order = db.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) {
      throw new NotFoundException(`Order '${orderId}' not found`);
    }

    const previousStatus = order.status;
    order.status = status;
    order.updatedAt = new Date().toISOString();

    if (status === OrderStatus.SHIPPED && order.shipment) {
      order.shipment.status = ShipmentStatus.IN_TRANSIT;
      order.shipment.shippedAt = new Date().toISOString();
    } else if (status === OrderStatus.DELIVERED && order.shipment) {
      order.shipment.status = ShipmentStatus.DELIVERED;
      order.shipment.actualDeliveryDate = new Date().toISOString();
    }

    order.timeline.push({
      id: `time-${Date.now()}`,
      orderId: order.id,
      status,
      title: `Status Changed to ${status}`,
      description: notes || `Order status updated by administrative operations team`,
      createdAt: new Date().toISOString()
    });

    // Record audit log
    db.recordAuditLog({
      adminId: adminId || 'admin-operations',
      action: 'ORDER_STATUS_UPDATED',
      entity: 'Order',
      entityId: order.id,
      beforeState: { status: previousStatus },
      afterState: { status, notes }
    });

    return order;
  }

  globalSearch(query: string) {
    if (!query || query.trim().length === 0) {
      return { orders: [], products: [], customers: [] };
    }

    const q = query.trim().toLowerCase();

    // 1. Search Orders
    const matchingOrders = db.orders
      .filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q) ||
          o.customerPhone.includes(q) ||
          (o.shipment?.trackingNumber && o.shipment.trackingNumber.toLowerCase().includes(q))
      )
      .slice(0, 5)
      .map((o) => ({
        type: 'ORDER',
        id: o.id,
        title: `Order ${o.orderNumber} — ${o.customerName}`,
        subtitle: `₹${o.totalAmount.toLocaleString('en-IN')} • ${o.status}`,
        url: `/admin/orders/${o.id}`
      }));

    // 2. Search Products
    const matchingProducts = db.products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.variants.some((v) => v.sku.toLowerCase().includes(q) || v.title.toLowerCase().includes(q))
      )
      .slice(0, 5)
      .map((p) => ({
        type: 'PRODUCT',
        id: p.id,
        title: p.name,
        subtitle: `SKU: ${p.sku} • ₹${(p.salePrice || p.basePrice).toLocaleString('en-IN')}`,
        url: `/admin/products/${p.id}`
      }));

    // 3. Search Customers
    const matchingCustomers = db.orders
      .filter((o) => o.customerEmail.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q))
      .slice(0, 5)
      .map((o) => ({
        type: 'CUSTOMER',
        id: o.userId,
        title: o.customerName,
        subtitle: `${o.customerEmail} • ${o.customerPhone}`,
        url: `/admin/customers/${o.userId}`
      }));

    return {
      query,
      results: [...matchingOrders, ...matchingProducts, ...matchingCustomers]
    };
  }

  // --------------------------------------------------------------------------
  // CUSTOMER 360
  // --------------------------------------------------------------------------
  getCustomers(query?: string, page: number = 1, limit: number = 10) {
    return db.getCustomers(query, page, limit);
  }

  getCustomerDetails(id: string) {
    const customer = db.getCustomerDetails(id);
    if (!customer) {
      throw new NotFoundException(`Customer with ID '${id}' not found`);
    }
    return customer;
  }

  toggleCustomerStatus(id: string) {
    const customer = db.toggleCustomerStatus(id);
    if (!customer) {
      throw new NotFoundException(`Customer with ID '${id}' not found`);
    }
    return customer;
  }

  // --------------------------------------------------------------------------
  // RBAC: ROLES & PERMISSIONS
  // --------------------------------------------------------------------------
  getRoles() {
    return db.getRoles();
  }

  getPermissions() {
    return db.getPermissions();
  }

  updateRolePermissions(roleId: string, permissionCodes: PermissionCode[]) {
    const role = db.updateRolePermissions(roleId, permissionCodes);
    if (!role) {
      throw new NotFoundException(`Role with ID '${roleId}' not found`);
    }
    return role;
  }

  // --------------------------------------------------------------------------
  // ADMINISTRATIVE USERS
  // --------------------------------------------------------------------------
  getAdminUsers() {
    return db.getAdminUsers();
  }

  createAdminUser(input: CreateAdminUserInput) {
    try {
      return db.createAdminUser(input);
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  updateAdminUser(id: string, input: UpdateAdminUserInput) {
    const admin = db.updateAdminUser(id, input);
    if (!admin) {
      throw new NotFoundException(`Admin user with ID '${id}' not found`);
    }
    return admin;
  }

  toggleAdminUserStatus(id: string) {
    const admin = db.toggleAdminUserStatus(id);
    if (!admin) {
      throw new NotFoundException(`Admin user with ID '${id}' not found`);
    }
    return admin;
  }
}
