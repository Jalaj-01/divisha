export interface DashboardKpiDTO {
  revenue: {
    today: number;
    yesterday: number;
    weekly: number;
    monthly: number;
    yearly: number;
    growthPercent: number;
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    refundRequested: number;
  };
  customers: {
    total: number;
    newToday: number;
    activeMonthly: number;
    averageOrderValue: number;
  };
  inventoryAlerts: {
    lowStockCount: number;
    outOfStockCount: number;
  };
  conversionFunnel: {
    visitors: number;
    productViews: number;
    addToCart: number;
    checkoutStarted: number;
    paymentStarted: number;
    purchaseCompleted: number;
    cartAbandonmentRate: number;
    checkoutAbandonmentRate: number;
    overallConversionRate: number;
  };
  topProducts: {
    id: string;
    name: string;
    sku: string;
    unitsSold: number;
    revenue: number;
    imageUrl?: string;
  }[];
  salesByDay: {
    date: string;
    revenue: number;
    ordersCount: number;
  }[];
}

export interface AnalyticsEventDTO {
  id?: string;
  eventType:
    | 'PAGE_VIEW'
    | 'PRODUCT_VIEW'
    | 'SEARCH'
    | 'ADD_TO_CART'
    | 'REMOVE_FROM_CART'
    | 'CHECKOUT_STARTED'
    | 'PAYMENT_STARTED'
    | 'PURCHASE'
    | 'WHATSAPP_INQUIRY'
    | 'WHATSAPP_CALL';
  userId?: string | null;
  sessionId: string;
  entityId?: string; // Product ID, Order ID, etc.
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}
