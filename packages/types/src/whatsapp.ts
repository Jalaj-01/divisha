export enum WhatsAppMessageType {
  ORDER_CONFIRMATION = 'ORDER_CONFIRMATION',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  ORDER_SHIPPED = 'ORDER_SHIPPED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  ABANDONED_CART_NUDGE = 'ABANDONED_CART_NUDGE',
  PRODUCT_INQUIRY = 'PRODUCT_INQUIRY',
  CUSTOM_SUPPORT = 'CUSTOM_SUPPORT',
  VIP_QUOTATION = 'VIP_QUOTATION',
  DISPATCH_NOTIFICATION = 'DISPATCH_NOTIFICATION'
}

export interface WhatsAppTemplateDTO {
  id: string;
  name: string;
  language: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  headerText?: string;
  bodyText: string;
  footerText?: string;
  variables: string[]; // e.g. ["customer_name", "order_number", "tracking_url"]
  isActive: boolean;
}

export interface WhatsAppMessagePayload {
  toPhoneNumber: string;
  type: WhatsAppMessageType;
  templateName?: string;
  parameters: Record<string, string>;
  mediaUrl?: string;
}

export interface WhatsAppProductInquiryData {
  productName: string;
  sku: string;
  variantTitle?: string;
  price: number;
  productUrl: string;
  customerName?: string;
  customNotes?: string;
}

export interface WhatsAppConciergeDepartment {
  id: string;
  name: string;
  description: string;
  phone: string;
  isAvailable: boolean;
  operatingHours: string;
  avatarIcon: string;
}

export interface WhatsAppQuoteItem {
  productId?: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  variantTitle?: string;
}

export interface WhatsAppQuoteDTO {
  customerName: string;
  customerPhone: string;
  items: WhatsAppQuoteItem[];
  discountPercentage?: number;
  discountAmount?: number;
  customNotes?: string;
  salesSpecialistName?: string;
  salesSpecialistPhone?: string;
  validUntilDays?: number;
}

export interface WhatsAppDispatchAlertDTO {
  orderId: string;
  customerName: string;
  customerPhone: string;
  carrier: string;
  awbNumber: string;
  trackingUrl: string;
  expectedDeliveryDate: string;
  destinationCity: string;
  securityPin?: string;
  whiteGloveAssembly?: boolean;
}
