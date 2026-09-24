import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InventoryService, AdjustStockInput } from './inventory.service.js';

@ApiTags('Inventory Management')
@Controller('v1/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'List all variant inventory levels, reserved quantities, and low-stock alerts' })
  getAll() {
    return this.inventoryService.getAllInventory();
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get aggregate inventory metrics (total SKUs, units on hand, reserved, low stock)' })
  getSummary() {
    return this.inventoryService.getInventorySummary();
  }

  @Post('adjust')
  @ApiOperation({ summary: 'Adjust stock delta with mandatory audit transaction reason' })
  adjustStock(@Body() input: AdjustStockInput) {
    return this.inventoryService.adjustStock(input);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'List immutable inventory audit transactions log' })
  getTransactions() {
    return this.inventoryService.getTransactions();
  }
}
