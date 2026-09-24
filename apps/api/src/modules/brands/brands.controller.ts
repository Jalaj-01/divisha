import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BrandsService } from './brands.service.js';
import { CreateBrandInput, UpdateBrandInput } from '@divisha/types';

@ApiTags('Brands')
@Controller('v1/brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @ApiOperation({ summary: 'List all partner and in-house luxury brands with product counters' })
  findAll() {
    return this.brandsService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get brand details and portfolio by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.brandsService.findBySlug(slug);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new brand partner' })
  create(@Body() input: CreateBrandInput) {
    return this.brandsService.create(input);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing brand' })
  update(@Param('id') id: string, @Body() input: UpdateBrandInput) {
    return this.brandsService.update(id, input);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a brand' })
  delete(@Param('id') id: string) {
    return this.brandsService.delete(id);
  }
}
