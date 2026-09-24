import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '@divisha/database';
import {
  ProductFilterParams,
  ProductDTO,
  CreateProductInput,
  UpdateProductInput,
  CreateProductVariantInput,
  ProductVariantDTO
} from '@divisha/types';

@Injectable()
export class ProductsService {
  findAll(filters: ProductFilterParams) {
    return db.getProducts(filters);
  }

  findBySlug(slug: string): ProductDTO {
    const product = db.getProductBySlug(slug);
    if (!product) {
      throw new NotFoundException(`Product with slug '${slug}' not found`);
    }
    return product;
  }

  findById(id: string): ProductDTO {
    const product = db.getProductById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }
    return product;
  }

  findFeatured(): ProductDTO[] {
    return db.getFeaturedProducts();
  }

  getAdminProducts(
    query?: string,
    categoryId?: string,
    brandId?: string,
    page: number = 1,
    limit: number = 20
  ) {
    return db.getAdminProducts(query, categoryId, brandId, page, limit);
  }

  createProduct(input: CreateProductInput, adminId?: string): ProductDTO {
    return db.createProduct(input, adminId);
  }

  updateProduct(id: string, input: UpdateProductInput, adminId?: string): ProductDTO {
    const updated = db.updateProduct(id, input, adminId);
    if (!updated) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }
    return updated;
  }

  deleteProduct(id: string, adminId?: string): { success: boolean } {
    const success = db.deleteProduct(id, adminId);
    if (!success) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }
    return { success: true };
  }

  toggleProductStatus(id: string, adminId?: string): ProductDTO {
    const product = db.toggleProductStatus(id, adminId);
    if (!product) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }
    return product;
  }

  addVariant(productId: string, input: CreateProductVariantInput): ProductVariantDTO {
    const variant = db.addProductVariant(productId, input);
    if (!variant) {
      throw new NotFoundException(`Product with ID '${productId}' not found`);
    }
    return variant;
  }
}
