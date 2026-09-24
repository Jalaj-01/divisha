'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartDTO, AddToCartInput, UpdateCartItemInput, ApplyCouponInput } from '@divisha/types';
import { db } from '@divisha/database';

interface CartContextType {
  cart: CartDTO | null;
  cartId: string;
  totalItems: number;
  isLoading: boolean;
  addItem: (productId: string, variantId: string, quantity?: number) => Promise<{ success: boolean; error?: string }>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<{ success: boolean; error?: string }>;
  removeItem: (cartItemId: string) => Promise<{ success: boolean; error?: string }>;
  applyCoupon: (code: string) => Promise<{ success: boolean; error?: string; discount?: number }>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartId, setCartId] = useState<string>('');
  const [cart, setCart] = useState<CartDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize cart session ID from localStorage
  useEffect(() => {
    try {
      let storedId = localStorage.getItem('divisha_cart_id');
      if (!storedId) {
        storedId = `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        localStorage.setItem('divisha_cart_id', storedId);
      }
      setCartId(storedId);
    } catch {
      const fallbackId = `cart-${Date.now()}`;
      setCartId(fallbackId);
    }
  }, []);

  // Fetch cart data once cartId is set
  const fetchCart = useCallback(async (id: string) => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/v1/cart/${id}`);
      if (res.ok) {
        const json = await res.json();
        const cartData = json.data || json;
        setCart(cartData);
      } else {
        // Fallback to local in-memory store
        const fallback = db.carts.get(id) || {
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
        setCart(fallback);
      }
    } catch {
      // Offline fallback
      const fallback = db.carts.get(id) || {
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
      setCart(fallback);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (cartId) {
      fetchCart(cartId);
    }
  }, [cartId, fetchCart]);

  const refreshCart = async () => {
    if (cartId) {
      await fetchCart(cartId);
    }
  };

  const addItem = async (
    productId: string,
    variantId: string,
    quantity: number = 1
  ): Promise<{ success: boolean; error?: string }> => {
    if (!cartId) return { success: false, error: 'Cart session initializing' };
    try {
      const input: AddToCartInput = { productId, variantId, quantity };
      const res = await fetch(`${API_BASE}/v1/cart/${cartId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      const json = await res.json();
      if (res.ok) {
        setCart(json.data || json);
        return { success: true };
      } else {
        return { success: false, error: json.message || 'Unable to add item to bag' };
      }
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error while adding to bag' };
    }
  };

  const updateQuantity = async (
    cartItemId: string,
    quantity: number
  ): Promise<{ success: boolean; error?: string }> => {
    if (!cartId) return { success: false, error: 'Cart session missing' };
    try {
      const input: UpdateCartItemInput = { cartItemId, quantity };
      const res = await fetch(`${API_BASE}/v1/cart/${cartId}/items`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      const json = await res.json();
      if (res.ok) {
        setCart(json.data || json);
        return { success: true };
      } else {
        return { success: false, error: json.message || 'Unable to update quantity' };
      }
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error while updating bag' };
    }
  };

  const removeItem = async (cartItemId: string): Promise<{ success: boolean; error?: string }> => {
    if (!cartId) return { success: false, error: 'Cart session missing' };
    try {
      const res = await fetch(`${API_BASE}/v1/cart/${cartId}/items/${cartItemId}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (res.ok) {
        setCart(json.data || json);
        return { success: true };
      } else {
        return { success: false, error: json.message || 'Unable to remove item' };
      }
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error while removing item' };
    }
  };

  const applyCoupon = async (code: string): Promise<{ success: boolean; error?: string; discount?: number }> => {
    if (!cartId) return { success: false, error: 'Cart session missing' };
    try {
      const input: ApplyCouponInput = { code };
      const res = await fetch(`${API_BASE}/v1/cart/${cartId}/apply-coupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      const json = await res.json();
      if (res.ok) {
        const updated = json.data || json;
        setCart(updated);
        return {
          success: true,
          discount: updated.summary?.couponDiscount || 0
        };
      } else {
        return { success: false, error: json.message || 'Invalid promotional code' };
      }
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error applying promo code' };
    }
  };

  const clearCart = () => {
    const newId = `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    localStorage.setItem('divisha_cart_id', newId);
    setCartId(newId);
    setCart({
      id: newId,
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
    });
  };

  const totalItems = cart?.totalItems ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartId,
        totalItems,
        isLoading,
        addItem,
        updateQuantity,
        removeItem,
        applyCoupon,
        clearCart,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
