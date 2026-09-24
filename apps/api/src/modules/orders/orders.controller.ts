import { Controller, Get, Patch, Post, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { OrdersService, TransitionOrderInput } from './orders.service.js';
import { OrderStatus, PaymentStatus } from '@divisha/types';

@ApiTags('Orders')
@Controller('v1/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('shipments/all')
  @ApiOperation({ summary: 'List all active order shipments and courier tracking records' })
  getShipments() {
    return this.ordersService.getShipments();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'List customer order history' })
  findByUserId(@Param('userId') userId: string) {
    return this.ordersService.findByUserId(userId);
  }

  @Get(':id/invoice')
  @ApiOperation({ summary: 'Generate compliant GST tax invoice snapshot for order' })
  getInvoice(@Param('id') id: string) {
    return this.ordersService.generateTaxInvoice(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Advance order state machine transition with validation and audit notes' })
  updateStatus(@Param('id') id: string, @Body() input: TransitionOrderInput) {
    return this.ordersService.updateOrderStatus(id, input);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel order and execute automated warehouse stock replenishment' })
  cancelOrder(@Param('id') id: string, @Body() body: { reason: string; adminId?: string }) {
    return this.ordersService.cancelOrder(id, body.reason, body.adminId);
  }

  @Get(':orderNumber')
  @ApiOperation({ summary: 'Get order details and full timeline tracking by Order Number (e.g. DIV-2026-98124)' })
  findByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  @Get()
  @ApiOperation({ summary: 'Search and filter orders with pagination' })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  @ApiQuery({ name: 'paymentStatus', required: false, enum: PaymentStatus })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('status') status?: OrderStatus,
    @Query('paymentStatus') paymentStatus?: PaymentStatus,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.ordersService.findAll({
      status,
      paymentStatus,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50
    });
  }
}
