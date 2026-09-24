import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  Query
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service.js';
import {
  ProductCategoryType,
  CreateProductInput,
  UpdateProductInput,
  CreateProductVariantInput
} from '@divisha/types';

@ApiTags('Products & Catalog')
@Controller('v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List and filter catalog products with pagination' })
  @ApiQuery({ name: 'categorySlug', required: false })
  @ApiQuery({ name: 'type', required: false, enum: ProductCategoryType })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'has3D', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['featured', 'price_asc', 'price_desc', 'rating', 'newest', 'bestselling']
  })
  findAll(
    @Query('categorySlug') categorySlug?: string,
    @Query('type') type?: ProductCategoryType,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('search') search?: string,
    @Query('has3D') has3D?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: any
  ) {
    return this.productsService.findAll({
      categorySlug,
      type,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      search,
      has3D: has3D === 'true',
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 12,
      sortBy
    });
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get curated featured products for showcase and hero carousel' })
  findFeatured() {
    return this.productsService.findFeatured();
  }

  @Get('admin/list')
  @ApiOperation({ summary: 'Administrative product list with active/inactive filtering and search' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'brandId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getAdminProducts(
    @Query('q') q?: string,
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.productsService.getAdminProducts(
      q,
      categoryId,
      brandId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20
    );
  }

  @Get('id/:id')
  @ApiOperation({ summary: 'Get product by internal identifier' })
  findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get full product details by URL slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new product with variants, attributes, and specifications' })
  create(@Body() input: CreateProductInput) {
    return this.productsService.createProduct(input);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing product' })
  update(@Param('id') id: string, @Body() input: UpdateProductInput) {
    return this.productsService.updateProduct(id, input);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive/Delete a product' })
  delete(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle product active status (draft vs published)' })
  toggleStatus(@Param('id') id: string) {
    return this.productsService.toggleProductStatus(id);
  }

  @Post(':id/variants')
  @ApiOperation({ summary: 'Add a new variant to an existing product' })
  addVariant(@Param('id') id: string, @Body() input: CreateProductVariantInput) {
    return this.productsService.addVariant(id, input);
  }
}
