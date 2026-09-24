import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CategoriesService } from './categories.service.js';
import {
  ProductCategoryType,
  CreateCategoryInput,
  UpdateCategoryInput
} from '@divisha/types';

@ApiTags('Categories')
@Controller('v1/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all active electronics and furniture categories' })
  @ApiQuery({ name: 'type', required: false, enum: ProductCategoryType })
  findAll(@Query('type') type?: ProductCategoryType) {
    return this.categoriesService.findAll(type);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get hierarchical category tree with parent-child nesting' })
  getTree() {
    return this.categoriesService.getTree();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get category details by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  create(@Body() input: CreateCategoryInput) {
    return this.categoriesService.create(input);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing category' })
  update(@Param('id') id: string, @Body() input: UpdateCategoryInput) {
    return this.categoriesService.update(id, input);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  delete(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }
}
