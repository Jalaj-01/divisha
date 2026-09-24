import { ProductCategoryType } from './enums.js';

export interface ProductAttributeValue {
  id: string;
  name: string;
  value: string;
  code?: string;
  group?: string; // e.g. "Display", "Connectivity", "Dimensions"
}

export interface ProductSpecification {
  group: string;
  items: { key: string; value: string }[];
}

export interface ProductImageDTO {
  id: string;
  url: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  altText: string;
  sortOrder: number;
  isPrimary: boolean;
  variantId?: string;
}

export interface ProductVariantDTO {
  id: string;
  productId: string;
  sku: string;
  barcode?: string;
  title: string;
  price: number;
  salePrice?: number | null;
  costPrice?: number | null;
  stock: number;
  weight?: number; // in kg
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  options: Record<string, string>; // e.g. { color: "Space Gray", storage: "256GB" } or { finish: "Walnut", seats: "3" }
  images: ProductImageDTO[];
  isActive: boolean;
}

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: ProductCategoryType;
  parentId?: string | null;
  children?: CategoryDTO[];
  imageUrl?: string;
  bannerUrl?: string;
  isActive: boolean;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface BrandDTO {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  websiteUrl?: string;
  isActive: boolean;
  isPartner?: boolean;
  productCount?: number;
}

export interface ProductDTO {
  id: string;
  name: string;
  slug: string;
  sku: string;
  barcode?: string;
  description: string;
  shortDescription?: string;
  type: ProductCategoryType;
  brandId: string;
  brand?: BrandDTO;
  categoryId: string;
  category?: CategoryDTO;
  basePrice: number;
  salePrice?: number | null;
  taxRate: number; // e.g. 18 for 18% GST
  warrantyInfo?: string;
  isFeatured: boolean;
  isActive: boolean;
  isArchived: boolean;
  has3DModel: boolean;
  model3DUrl?: string;
  variants: ProductVariantDTO[];
  images: ProductImageDTO[];
  attributes: ProductAttributeValue[];
  specifications: ProductSpecification[];
  ratingAverage: number;
  reviewCount: number;
  totalSold?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilterParams {
  categorySlug?: string;
  brandSlugs?: string[];
  type?: ProductCategoryType;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  minRating?: number;
  has3D?: boolean;
  sortBy?: 'featured' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'bestselling';
  page?: number;
  limit?: number;
  search?: string;
  attributes?: Record<string, string[]>; // e.g. { material: ["Teak Wood"], power: ["1500W"] }
}

// -----------------------------------------------------------------------------
// CATALOG CRUD INPUT INTERFACES
// -----------------------------------------------------------------------------

export interface CreateProductInput {
  name: string;
  slug?: string;
  sku: string;
  barcode?: string;
  description: string;
  shortDescription?: string;
  type: ProductCategoryType;
  brandId: string;
  categoryId: string;
  basePrice: number;
  salePrice?: number | null;
  taxRate?: number;
  warrantyInfo?: string;
  isFeatured?: boolean;
  has3DModel?: boolean;
  model3DUrl?: string;
  images?: Array<{
    url: string;
    altText?: string;
    isPrimary?: boolean;
    sortOrder?: number;
  }>;
  variants?: Array<{
    title: string;
    sku: string;
    price: number;
    salePrice?: number | null;
    stock: number;
    options?: Record<string, string>;
  }>;
  attributes?: ProductAttributeValue[];
  specifications?: ProductSpecification[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  isActive?: boolean;
  isArchived?: boolean;
}

export interface CreateProductVariantInput {
  sku: string;
  barcode?: string;
  title: string;
  price: number;
  salePrice?: number | null;
  costPrice?: number | null;
  stock: number;
  options?: Record<string, string>;
  isActive?: boolean;
}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  type: ProductCategoryType;
  parentId?: string | null;
  imageUrl?: string;
  bannerUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {}

export interface CreateBrandInput {
  name: string;
  slug?: string;
  logoUrl?: string;
  description?: string;
  websiteUrl?: string;
  isActive?: boolean;
  isPartner?: boolean;
}

export interface UpdateBrandInput extends Partial<CreateBrandInput> {}

