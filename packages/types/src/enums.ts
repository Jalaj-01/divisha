export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  CATALOG_MANAGER = 'CATALOG_MANAGER',
  ORDER_MANAGER = 'ORDER_MANAGER',
  FINANCE_MANAGER = 'FINANCE_MANAGER',
  CONTENT_MANAGER = 'CONTENT_MANAGER',
  SUPPORT_AGENT = 'SUPPORT_AGENT'
}

export enum PermissionCode {
  // Users & Profiles
  USERS_READ = 'users.read',
  USERS_UPDATE = 'users.update',
  USERS_DEACTIVATE = 'users.deactivate',

  // Catalog (Products, Categories, Brands)
  CATALOG_READ = 'catalog.read',
  CATALOG_CREATE = 'catalog.create',
  CATALOG_UPDATE = 'catalog.update',
  CATALOG_DELETE = 'catalog.delete',

  // Inventory
  INVENTORY_READ = 'inventory.read',
  INVENTORY_UPDATE = 'inventory.update',
  INVENTORY_ADJUST = 'inventory.adjust',

  // Orders
  ORDERS_READ = 'orders.read',
  ORDERS_UPDATE = 'orders.update',
  ORDERS_CANCEL = 'orders.cancel',

  // Payments & Finance
  PAYMENTS_READ = 'payments.read',
  FINANCE_READ = 'finance.read',
  FINANCE_REFUND = 'finance.refund',

  // Content & CMS
  CONTENT_READ = 'content.read',
  CONTENT_CREATE = 'content.create',
  CONTENT_UPDATE = 'content.update',
  CONTENT_DELETE = 'content.delete',

  // Analytics & Reports
  ANALYTICS_READ = 'analytics.read',
  REPORTS_EXPORT = 'reports.export',

  // Administration & Security
  ADMIN_MANAGE = 'admin.manage',
  ROLES_MANAGE = 'roles.manage',
  AUDIT_READ = 'audit.read',
  SETTINGS_UPDATE = 'settings.update'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAYMENT_PROCESSING = 'PAYMENT_PROCESSING',
  PAID = 'PAID',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  PACKED = 'PACKED',
  SHIPPED = 'SHIPPED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUND_REQUESTED = 'REFUND_REQUESTED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED'
}

export enum PaymentMethod {
  RAZORPAY = 'RAZORPAY',
  UPI = 'UPI',
  CARD = 'CARD',
  NET_BANKING = 'NET_BANKING',
  WALLET = 'WALLET',
  COD = 'COD'
}

export enum RefundStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REJECTED = 'REJECTED'
}

export enum InventoryTransactionReason {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  RETURN = 'RETURN',
  DAMAGE = 'DAMAGE',
  MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT',
  CORRECTION = 'CORRECTION',
  CANCELLATION = 'CANCELLATION'
}

export enum ShipmentStatus {
  ORDER_CREATED = 'ORDER_CREATED',
  MANIFESTED = 'MANIFESTED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  FAILED_ATTEMPT = 'FAILED_ATTEMPT',
  RETURNED_TO_ORIGIN = 'RETURNED_TO_ORIGIN'
}

export enum CouponType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT'
}

export enum ProductCategoryType {
  ELECTRONICS = 'ELECTRONICS',
  FURNITURE = 'FURNITURE'
}

export enum ContentBlockType {
  HERO_SLIDER = 'HERO_SLIDER',
  THREE_D_SHOWCASE = 'THREE_D_SHOWCASE',
  CATEGORY_GRID = 'CATEGORY_GRID',
  FEATURED_PRODUCTS = 'FEATURED_PRODUCTS',
  PROMOTIONAL_BANNER = 'PROMOTIONAL_BANNER',
  ROOM_INSPIRATION = 'ROOM_INSPIRATION',
  TESTIMONIALS = 'TESTIMONIALS',
  VALUE_PROPOSITIONS = 'VALUE_PROPOSITIONS',
  BRAND_CAROUSEL = 'BRAND_CAROUSEL',
  FAQ_ACCORDION = 'FAQ_ACCORDION',
  RICH_TEXT = 'RICH_TEXT'
}
