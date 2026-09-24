import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '@divisha/database';
import { BrandDTO, CreateBrandInput, UpdateBrandInput } from '@divisha/types';

@Injectable()
export class BrandsService {
  findAll(): BrandDTO[] {
    return db.getBrands();
  }

  findBySlug(slug: string): BrandDTO {
    const brand = db.getBrandBySlug(slug);
    if (!brand) {
      throw new NotFoundException(`Brand with slug '${slug}' not found`);
    }
    return brand;
  }

  findById(id: string): BrandDTO {
    const brand = db.getBrandById(id);
    if (!brand) {
      throw new NotFoundException(`Brand with ID '${id}' not found`);
    }
    return brand;
  }

  create(input: CreateBrandInput, adminId?: string): BrandDTO {
    return db.createBrand(input, adminId);
  }

  update(id: string, input: UpdateBrandInput, adminId?: string): BrandDTO {
    const updated = db.updateBrand(id, input, adminId);
    if (!updated) {
      throw new NotFoundException(`Brand with ID '${id}' not found`);
    }
    return updated;
  }

  delete(id: string, adminId?: string): { success: boolean } {
    const success = db.deleteBrand(id, adminId);
    if (!success) {
      throw new NotFoundException(`Brand with ID '${id}' not found`);
    }
    return { success: true };
  }
}
