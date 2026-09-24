import { Controller, Get, Post, Patch, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CmsService } from './cms.service.js';
import { BannerDTO, ContentBlockDTO, PageDTO } from '@divisha/types';

@ApiTags('Content Management System')
@Controller('v1/cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // --------------------------------------------------------------------------
  // BANNERS
  // --------------------------------------------------------------------------
  @Get('banners')
  @ApiOperation({ summary: 'List promotional hero banners with optional active filter' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  getBanners(@Query('activeOnly') activeOnly?: string) {
    return this.cmsService.getBanners(activeOnly === 'true');
  }

  @Post('banners')
  @ApiOperation({ summary: 'Create new promotional hero banner' })
  createBanner(@Body() input: Partial<BannerDTO>) {
    return this.cmsService.createBanner(input);
  }

  @Patch('banners/:id')
  @ApiOperation({ summary: 'Update promotional banner metadata, status, or scheduling' })
  updateBanner(@Param('id') id: string, @Body() input: Partial<BannerDTO>) {
    return this.cmsService.updateBanner(id, input);
  }

  @Delete('banners/:id')
  @ApiOperation({ summary: 'Delete promotional banner' })
  deleteBanner(@Param('id') id: string) {
    return this.cmsService.deleteBanner(id);
  }

  // --------------------------------------------------------------------------
  // HOMEPAGE CONTENT BLOCKS
  // --------------------------------------------------------------------------
  @Get('homepage-blocks')
  @ApiOperation({ summary: 'List reorderable homepage layout content blocks' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  getHomepageBlocks(@Query('activeOnly') activeOnly?: string) {
    return this.cmsService.getHomepageBlocks(activeOnly === 'true');
  }

  @Put('homepage-blocks/reorder')
  @ApiOperation({ summary: 'Reorder homepage content blocks sequence' })
  reorderContentBlocks(@Body() body: { orderIds: string[] }) {
    return this.cmsService.reorderContentBlocks(body.orderIds);
  }

  @Post('homepage-blocks')
  @ApiOperation({ summary: 'Create homepage layout content block' })
  createContentBlock(@Body() input: Partial<ContentBlockDTO>) {
    return this.cmsService.createContentBlock(input);
  }

  @Patch('homepage-blocks/:id')
  @ApiOperation({ summary: 'Update content block configuration or active status' })
  updateContentBlock(@Param('id') id: string, @Body() input: Partial<ContentBlockDTO>) {
    return this.cmsService.updateContentBlock(id, input);
  }

  @Delete('homepage-blocks/:id')
  @ApiOperation({ summary: 'Delete homepage content block' })
  deleteContentBlock(@Param('id') id: string) {
    return this.cmsService.deleteContentBlock(id);
  }

  // --------------------------------------------------------------------------
  // DYNAMIC PAGES
  // --------------------------------------------------------------------------
  @Get('pages')
  @ApiOperation({ summary: 'List all dynamic content pages' })
  getAllPages() {
    return this.cmsService.getAllPages();
  }

  @Get('pages/:slug')
  @ApiOperation({ summary: 'Get published content page by slug (e.g. about-us, warranty)' })
  getPage(@Param('slug') slug: string) {
    return this.cmsService.getPage(slug);
  }

  @Post('pages')
  @ApiOperation({ summary: 'Create new dynamic content page' })
  createPage(@Body() input: Partial<PageDTO>) {
    return this.cmsService.createPage(input);
  }

  @Patch('pages/:id')
  @ApiOperation({ summary: 'Update dynamic content page or publishing status' })
  updatePage(@Param('id') id: string, @Body() input: Partial<PageDTO>) {
    return this.cmsService.updatePage(id, input);
  }

  @Delete('pages/:id')
  @ApiOperation({ summary: 'Delete dynamic content page' })
  deletePage(@Param('id') id: string) {
    return this.cmsService.deletePage(id);
  }

  // --------------------------------------------------------------------------
  // STOREFRONT ANNOUNCEMENT & SETTINGS
  // --------------------------------------------------------------------------
  @Get('settings')
  @ApiOperation({ summary: 'Get storefront announcement and general settings' })
  getSettings() {
    return this.cmsService.getSettings();
  }

  @Put('settings')
  @ApiOperation({ summary: 'Update storefront announcement and general settings' })
  updateSettings(@Body() body: any) {
    return this.cmsService.updateSettings(body);
  }
}
