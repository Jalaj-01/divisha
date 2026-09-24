import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CheckoutService, CheckoutInput } from './checkout.service.js';

@ApiTags('Checkout & Order Processing')
@Controller('v1/checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('create-order')
  @ApiOperation({ summary: 'Atomically create pending order from cart with locked inventory and price snapshots' })
  createOrder(@Body() input: CheckoutInput) {
    return this.checkoutService.createPendingOrder(input);
  }
}
