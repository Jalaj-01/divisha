import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db } from '@divisha/database';
import { CartDTO, CartItemDTO, AddToCartInput, UpdateCartItemInput, ApplyCouponInput } from '@divisha/types';

@Injectable()
export class CartService {
  getOrCreateCart(cartId?: string): CartDTO {
    const id = cartId || `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    let cart = db.carts.get(id);

    if (!cart) {
      cart = {
        id,
        items: [],
        summary: {
          subtotal: 0,
          discount: 0,
          taxAmount: 0,
          shippingAmount: 0,
          totalAmount: 0,
          couponCode: null,
          couponDiscount: 0
        },
        totalItems: 0,
        updatedAt: new Date().toISOString()
      };
      db.carts.set(id, cart);
    }

    return this.recalculate(cart);
  }

  addItem(cartId: string, input: AddToCartInput): CartDTO {
    const cart = this.getOrCreateCart(cartId);
    const product = db.getProductById(input.productId);
    if (!product) {
      throw new NotFoundException(`Product not found`);
    }

    const variant = product.variants.find((v) => v.id === input.variantId);
    if (!variant) {
      throw new NotFoundException(`Variant not found for product`);
    }

    const availableStock = db.getStock(input.variantId);
    if (availableStock < input.quantity) {
      throw new BadRequestException(`Insufficient stock. Only ${availableStock} units available.`);
    }

    const existingIndex = cart.items.findIndex((item) => item.variantId === input.variantId);
    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + input.quantity;
      if (newQty > availableStock) {
        throw new BadRequestException(`Cannot add more. Total in cart exceeds available stock (${availableStock}).`);
      }
      cart.items[existingIndex].quantity = newQty;
    } else {
      const unitPrice = variant.salePrice || variant.price;
      const newItem: CartItemDTO = {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        cartId: cart.id,
        productId: product.id,
        product,
        variantId: variant.id,
        variant,
        quantity: input.quantity,
        unitPrice: variant.price,
        unitSalePrice: variant.salePrice,
        totalPrice: unitPrice * input.quantity,
        isAvailable: true,
        availableStock
      };
      cart.items.push(newItem);
    }

    return this.recalculate(cart);
  }

  updateItem(cartId: string, input: UpdateCartItemInput): CartDTO {
    const cart = this.getOrCreateCart(cartId);
    const item = cart.items.find((i) => i.id === input.cartItemId);
    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    if (input.quantity <= 0) {
      cart.items = cart.items.filter((i) => i.id !== input.cartItemId);
    } else {
      const stock = db.getStock(item.variantId);
      if (input.quantity > stock) {
        throw new BadRequestException(`Only ${stock} units available in stock.`);
      }
      item.quantity = input.quantity;
    }

    return this.recalculate(cart);
  }

  removeItem(cartId: string, itemId: string): CartDTO {
    const cart = this.getOrCreateCart(cartId);
    cart.items = cart.items.filter((i) => i.id !== itemId);
    return this.recalculate(cart);
  }

  applyCoupon(cartId: string, input: ApplyCouponInput): CartDTO {
    const cart = this.getOrCreateCart(cartId);
    const coupon = db.coupons.find((c) => c.code.toUpperCase() === input.code.toUpperCase() && c.isActive);

    if (!coupon) {
      throw new BadRequestException('Invalid or expired coupon code.');
    }

    const subtotal = cart.items.reduce((acc, item) => {
      const price = item.unitSalePrice || item.unitPrice;
      return acc + price * item.quantity;
    }, 0);

    if (subtotal < coupon.minOrderAmount) {
      throw new BadRequestException(`Minimum cart value for this coupon is ₹${coupon.minOrderAmount.toLocaleString('en-IN')}`);
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      discount = coupon.discountValue;
    }

    cart.summary.couponCode = coupon.code;
    cart.summary.couponDiscount = discount;

    return this.recalculate(cart);
  }

  private recalculate(cart: CartDTO): CartDTO {
    let subtotal = 0;
    let totalItems = 0;

    cart.items.forEach((item) => {
      // Re-fetch authoritative price from memory store
      const prod = db.getProductById(item.productId);
      const variant = prod?.variants.find((v) => v.id === item.variantId);
      if (variant) {
        item.unitPrice = variant.price;
        item.unitSalePrice = variant.salePrice;
        const currentActivePrice = variant.salePrice || variant.price;
        item.totalPrice = currentActivePrice * item.quantity;
        item.availableStock = db.getStock(variant.id);
        item.isAvailable = item.availableStock >= item.quantity;
      }
      subtotal += item.totalPrice;
      totalItems += item.quantity;
    });

    const couponDiscount = cart.summary.couponDiscount || 0;
    const finalSubtotal = Math.max(0, subtotal - couponDiscount);
    // GST 18% included or calculated
    const taxAmount = Math.round(finalSubtotal * 0.18 * 100) / 100;
    // Free white glove shipping on orders above ₹10,000
    const shippingAmount = finalSubtotal >= 10000 || finalSubtotal === 0 ? 0 : 999;
    const totalAmount = finalSubtotal + shippingAmount;

    cart.summary = {
      subtotal,
      discount: couponDiscount,
      couponCode: cart.summary.couponCode || null,
      couponDiscount,
      taxAmount,
      shippingAmount,
      totalAmount
    };
    cart.totalItems = totalItems;
    cart.updatedAt = new Date().toISOString();

    db.carts.set(cart.id, cart);
    return cart;
  }
}
