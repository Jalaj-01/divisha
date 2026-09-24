import { ContentBlockType } from './enums.js';

export interface BannerDTO {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  desktopImageUrl: string;
  mobileImageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

export interface ContentBlockDTO {
  id: string;
  page: string; // e.g. "HOME", "ABOUT", "CUSTOM"
  type: ContentBlockType;
  title?: string;
  subtitle?: string;
  sortOrder: number;
  isActive: boolean;
  content: Record<string, any>; // Flexible typed payload per block type
}

export interface PageDTO {
  id: string;
  slug: string; // "about-us", "contact", "warranty", "privacy-policy"
  title: string;
  content: string; // Markdown or rich HTML
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  updatedAt: string;
}

export interface CouponDTO {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

export interface ReviewDTO {
  id: string;
  productId: string;
  productName?: string;
  userId: string;
  userName: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface WishlistItemDTO {
  id: string;
  userId: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  imageUrl?: string;
  price: number;
  salePrice?: number | null;
  isInStock: boolean;
  addedAt: string;
}
