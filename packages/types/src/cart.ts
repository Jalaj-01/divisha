import { ProductDTO, ProductVariantDTO } from './products.js';

export interface CartItemDTO {
  id: string;
  cartId: string;
  productId: string;
  product?: ProductDTO;
  variantId: string;
  variant?: ProductVariantDTO;
  quantity: number;
  unitPrice: number;
  unitSalePrice?: number | null;
  totalPrice: number;
  isAvailable: boolean;
  availableStock: number;
}

export interface CartPriceSummary {
  subtotal: number;
  discount: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  couponCode?: string | null;
  couponDiscount: number;
}

export interface CartDTO {
  id: string;
  userId?: string | null;
  sessionId?: string;
  items: CartItemDTO[];
  summary: CartPriceSummary;
  totalItems: number;
  updatedAt: string;
}

export interface AddToCartInput {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  cartItemId: string;
  quantity: number;
}

export interface ApplyCouponInput {
  code: string;
}
