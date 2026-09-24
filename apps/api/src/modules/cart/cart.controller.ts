import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CartService } from './cart.service.js';
import { AddToCartInput, UpdateCartItemInput, ApplyCouponInput } from '@divisha/types';

@ApiTags('Shopping Cart')
@Controller('v1/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':cartId')
  @ApiOperation({ summary: 'Get current cart session with server-recalculated price summary' })
  getCart(@Param('cartId') cartId: string) {
    return this.cartService.getOrCreateCart(cartId);
  }

  @Post(':cartId/items')
  @ApiOperation({ summary: 'Add product variant to cart with real-time stock validation' })
  addItem(@Param('cartId') cartId: string, @Body() input: AddToCartInput) {
    return this.cartService.addItem(cartId, input);
  }

  @Patch(':cartId/items')
  @ApiOperation({ summary: 'Update cart item quantity' })
  updateItem(@Param('cartId') cartId: string, @Body() input: UpdateCartItemInput) {
    return this.cartService.updateItem(cartId, input);
  }

  @Delete(':cartId/items/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  removeItem(@Param('cartId') cartId: string, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(cartId, itemId);
  }

  @Post(':cartId/apply-coupon')
  @ApiOperation({ summary: 'Apply discount coupon to cart' })
  applyCoupon(@Param('cartId') cartId: string, @Body() input: ApplyCouponInput) {
    return this.cartService.applyCoupon(cartId, input);
  }
}
