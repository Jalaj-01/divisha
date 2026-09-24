import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '@divisha/database';
import { BannerDTO, ContentBlockDTO, PageDTO } from '@divisha/types';

@Injectable()
export class CmsService {
  // --------------------------------------------------------------------------
  // PROMOTIONAL BANNERS
  // --------------------------------------------------------------------------
  getBanners(activeOnly = false): BannerDTO[] {
    let list = [...db.banners];
    if (activeOnly) {
      list = list.filter((b) => b.isActive);
    }
    return list.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  createBanner(input: Partial<BannerDTO>): BannerDTO {
    return db.createBanner(input);
  }

  updateBanner(id: string, input: Partial<BannerDTO>): BannerDTO {
    const updated = db.updateBanner(id, input);
    if (!updated) {
      throw new NotFoundException(`Banner '${id}' not found`);
    }
    return updated;
  }

  deleteBanner(id: string): { success: boolean } {
    const deleted = db.deleteBanner(id);
    if (!deleted) {
      throw new NotFoundException(`Banner '${id}' not found`);
    }
    return { success: true };
  }

  // --------------------------------------------------------------------------
  // HOMEPAGE LAYOUT CONTENT BLOCKS
  // --------------------------------------------------------------------------
  getHomepageBlocks(activeOnly = false): ContentBlockDTO[] {
    let list = [...db.contentBlocks];
    if (activeOnly) {
      list = list.filter((cb) => cb.isActive);
    }
    return list.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  createContentBlock(input: Partial<ContentBlockDTO>): ContentBlockDTO {
    return db.createContentBlock(input);
  }

  updateContentBlock(id: string, input: Partial<ContentBlockDTO>): ContentBlockDTO {
    const updated = db.updateContentBlock(id, input);
    if (!updated) {
      throw new NotFoundException(`Content Block '${id}' not found`);
    }
    return updated;
  }

  reorderContentBlocks(orderIds: string[]): ContentBlockDTO[] {
    return db.reorderContentBlocks(orderIds);
  }

  deleteContentBlock(id: string): { success: boolean } {
    const deleted = db.deleteContentBlock(id);
    if (!deleted) {
      throw new NotFoundException(`Content Block '${id}' not found`);
    }
    return { success: true };
  }

  // --------------------------------------------------------------------------
  // DYNAMIC PAGES (About Us, Warranty, Craftsmanship, Contact)
  // --------------------------------------------------------------------------
  getAllPages(): PageDTO[] {
    return db.getAllPages();
  }

  getPage(slug: string): PageDTO {
    const page = db.getPageBySlug(slug);
    if (!page) {
      throw new NotFoundException(`Page '${slug}' not found`);
    }
    return page;
  }

  createPage(input: Partial<PageDTO>): PageDTO {
    return db.createPage(input);
  }

  updatePage(id: string, input: Partial<PageDTO>): PageDTO {
    const updated = db.updatePage(id, input);
    if (!updated) {
      throw new NotFoundException(`Page '${id}' not found`);
    }
    return updated;
  }

  deletePage(id: string): { success: boolean } {
    const deleted = db.deletePage(id);
    if (!deleted) {
      throw new NotFoundException(`Page '${id}' not found`);
    }
    return { success: true };
  }

  getSettings() {
    return db.getStoreSettings();
  }

  updateSettings(input: any) {
    return db.updateStoreSettings(input);
  }
}
