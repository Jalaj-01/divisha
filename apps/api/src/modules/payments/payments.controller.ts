import { Controller, Post, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentsService, CreatePaymentInput, VerifyPaymentInput } from './payments.service.js';

@ApiTags('Payments & Gateways')
@Controller('v1/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order')
  @ApiOperation({ summary: 'Create Razorpay / Gateway order for pending checkout' })
  createOrder(@Body() input: CreatePaymentInput) {
    return this.paymentsService.createGatewayOrder(input);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify gateway payment cryptographic signature and confirm order' })
  verifyPayment(@Body() input: VerifyPaymentInput) {
    return this.paymentsService.verifyPayment(input);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle incoming Razorpay webhook with signature verification and idempotency' })
  handleWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Body() payload: any
  ) {
    return this.paymentsService.handleWebhook(signature || '', payload);
  }
}
