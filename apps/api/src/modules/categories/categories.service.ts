import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '@divisha/database';
import {
  CategoryDTO,
  ProductCategoryType,
  CreateCategoryInput,
  UpdateCategoryInput
} from '@divisha/types';

@Injectable()
export class CategoriesService {
  findAll(type?: ProductCategoryType): CategoryDTO[] {
    return db.getCategories(type);
  }

  getTree(): CategoryDTO[] {
    return db.getCategoryTree();
  }

  findBySlug(slug: string): CategoryDTO {
    const category = db.getCategoryBySlug(slug);
    if (!category) {
      throw new NotFoundException(`Category with slug '${slug}' not found`);
    }
    return category;
  }

  findById(id: string): CategoryDTO {
    const category = db.getCategoryById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID '${id}' not found`);
    }
    return category;
  }

  create(input: CreateCategoryInput, adminId?: string): CategoryDTO {
    return db.createCategory(input, adminId);
  }

  update(id: string, input: UpdateCategoryInput, adminId?: string): CategoryDTO {
    const updated = db.updateCategory(id, input, adminId);
    if (!updated) {
      throw new NotFoundException(`Category with ID '${id}' not found`);
    }
    return updated;
  }

  delete(id: string, adminId?: string): { success: boolean } {
    const success = db.deleteCategory(id, adminId);
    if (!success) {
      throw new NotFoundException(`Category with ID '${id}' not found`);
    }
    return { success: true };
  }
}
