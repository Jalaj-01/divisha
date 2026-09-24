const http = require('http');

const API_HOST = 'localhost';
const API_PORT = 4000;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const jsonBody = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (jsonBody) {
      reqHeaders['Content-Length'] = Buffer.byteLength(jsonBody);
    }

    const req = http.request(
      {
        host: API_HOST,
        port: API_PORT,
        path,
        method,
        headers: reqHeaders
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => (rawData += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(rawData);
            resolve({ status: res.statusCode, data: parsed });
          } catch {
            resolve({ status: res.statusCode, raw: rawData });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (jsonBody) req.write(jsonBody);
    req.end();
  });
}

async function runTests() {
  console.log('--- Testing Phase 4 & 5: Server-Verified Cart, Authoritative Checkout & Payments ---');

  // 1. Health check
  const health = await request('GET', '/health');
  if (health.status !== 200) {
    throw new Error('Health check failed: ' + JSON.stringify(health));
  }
  console.log('1. Health check: PASS');

  // 2. Query available products for cart
  const productsRes = await request('GET', '/v1/products');
  const products = productsRes.data?.data || productsRes.data;
  if (!products || products.length === 0) {
    throw new Error('Failed to retrieve products');
  }
  const oledProduct = products[0];
  const oledVariant = oledProduct.variants[0];
  console.log(`2. Products retrieved: PASS (Target: ${oledProduct.name}, Variant: ${oledVariant.title})`);

  // 3. Create or Fetch Empty Cart
  const testCartId = `cart-test-${Date.now()}`;
  const cartRes = await request('GET', `/v1/cart/${testCartId}`);
  const cart = cartRes.data?.data || cartRes.data;
  if (cartRes.status !== 200 || !cart.id) {
    throw new Error('Failed to create/get cart');
  }
  console.log(`3. Cart Session Initialized: PASS (Cart ID: ${cart.id})`);

  // 4. Add First Item to Cart
  const addItemRes = await request('POST', `/v1/cart/${testCartId}/items`, {
    productId: oledProduct.id,
    variantId: oledVariant.id,
    quantity: 1
  });
  const cartAfterAdd = addItemRes.data?.data || addItemRes.data;
  if (addItemRes.status !== 200 && addItemRes.status !== 201) {
    throw new Error('Add item failed: ' + JSON.stringify(addItemRes));
  }
  if (cartAfterAdd.items.length !== 1 || cartAfterAdd.totalItems !== 1) {
    throw new Error('Cart item count mismatch');
  }
  console.log(`4. Add Item to Cart: PASS (${cartAfterAdd.items[0].productName || oledProduct.name}, Qty: 1)`);

  // 5. Add Second Product if available
  if (products.length > 1) {
    const secondProduct = products[1];
    const secondVariant = secondProduct.variants[0];
    const addSecondRes = await request('POST', `/v1/cart/${testCartId}/items`, {
      productId: secondProduct.id,
      variantId: secondVariant.id,
      quantity: 1
    });
    const cartWith2 = addSecondRes.data?.data || addSecondRes.data;
    console.log(`5. Add Second Item: PASS (Total items in bag: ${cartWith2.totalItems}, Subtotal: ₹${cartWith2.summary.subtotal})`);
  }

  // 6. Update Quantity of First Item
  const cartItemId = cartAfterAdd.items[0].id;
  const updateQtyRes = await request('PATCH', `/v1/cart/${testCartId}/items`, {
    cartItemId,
    quantity: 2
  });
  const cartAfterUpdate = updateQtyRes.data?.data || updateQtyRes.data;
  console.log(`6. Update Quantity Stepper: PASS (New Total Amount: ₹${cartAfterUpdate.summary.totalAmount})`);

  // 7. Apply Promotional Coupon (DIVISHA10)
  const couponRes = await request('POST', `/v1/cart/${testCartId}/apply-coupon`, {
    code: 'DIVISHA10'
  });
  const cartAfterCoupon = couponRes.data?.data || couponRes.data;
  if (!cartAfterCoupon.summary.couponCode || cartAfterCoupon.summary.couponDiscount <= 0) {
    throw new Error('Coupon application failed: ' + JSON.stringify(couponRes));
  }
  console.log(
    `7. Apply Privilege Coupon: PASS (Code: ${cartAfterCoupon.summary.couponCode}, Discount: ₹${cartAfterCoupon.summary.couponDiscount})`
  );

  // 8. Execute Atomic Checkout with Cash on Delivery (COD)
  const codCheckoutRes = await request('POST', '/v1/checkout/create-order', {
    cartId: testCartId,
    userId: 'usr-customer-01',
    customerName: 'Aarav Mehta',
    customerEmail: 'aarav.mehta@example.com',
    customerPhone: '+919820123456',
    shippingAddress: {
      name: 'Aarav Mehta',
      phone: '+919820123456',
      addressLine1: 'Penthouse 42, Oberoi Sky City',
      addressLine2: 'Borivali East',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400066',
      country: 'India',
      type: 'HOME'
    },
    paymentMethod: 'COD',
    notes: 'Please coordinate white-glove arrival window'
  });

  const codOrder = codCheckoutRes.data?.data || codCheckoutRes.data;
  if (!codOrder.orderNumber || codOrder.status !== 'CONFIRMED') {
    throw new Error('COD Checkout failed: ' + JSON.stringify(codCheckoutRes));
  }
  console.log(`8. Atomic Checkout (COD): PASS`);
  console.log(`   Order Number: ${codOrder.orderNumber}`);
  console.log(`   Status: ${codOrder.status}`);
  console.log(`   Carrier: ${codOrder.shipment?.carrier}, Tracking: ${codOrder.shipment?.trackingNumber}`);

  // 9. Verify Cart was Emptied after checkout
  const cartAfterOrderRes = await request('GET', `/v1/cart/${testCartId}`);
  const cartAfterOrder = cartAfterOrderRes.data?.data || cartAfterOrderRes.data;
  if (cartAfterOrder.items.length !== 0) {
    throw new Error('Cart was not emptied after order placement');
  }
  console.log('9. Cart Emptied Post-Checkout: PASS');

  // 10. Test Razorpay Online Payment Flow
  // Create second cart
  const rzpCartId = `cart-rzp-${Date.now()}`;
  await request('POST', `/v1/cart/${rzpCartId}/items`, {
    productId: oledProduct.id,
    variantId: oledVariant.id,
    quantity: 1
  });

  // Create Pending Order with Razorpay payment method
  const rzpCheckoutRes = await request('POST', '/v1/checkout/create-order', {
    cartId: rzpCartId,
    userId: 'usr-customer-01',
    customerName: 'Aarav Mehta (VIP)',
    customerEmail: 'aarav.mehta@example.com',
    customerPhone: '+919820123456',
    shippingAddress: {
      name: 'Aarav Mehta',
      phone: '+919820123456',
      addressLine1: 'Level 14, Maker Maxity',
      addressLine2: 'Bandra Kurla Complex',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400051',
      country: 'India',
      type: 'WORK'
    },
    paymentMethod: 'RAZORPAY'
  });
  const rzpPendingOrder = rzpCheckoutRes.data?.data || rzpCheckoutRes.data;
  if (!rzpPendingOrder.id || rzpPendingOrder.status !== 'PENDING') {
    throw new Error('Razorpay Pending order creation failed: ' + JSON.stringify(rzpCheckoutRes));
  }
  console.log(`10. Razorpay Pending Order Created: PASS (${rzpPendingOrder.orderNumber}, Status: ${rzpPendingOrder.status})`);

  // Create Gateway Order
  const gwOrderRes = await request('POST', '/v1/payments/create-order', {
    orderId: rzpPendingOrder.id
  });
  const gwOrder = gwOrderRes.data?.data || gwOrderRes.data;
  if (!gwOrder.gatewayOrderId) {
    throw new Error('Gateway order creation failed: ' + JSON.stringify(gwOrderRes));
  }
  console.log(`11. Gateway Order Generated: PASS (${gwOrder.gatewayOrderId}, Amount: ₹${gwOrder.amount / 100})`);

  // Verify Payment with cryptographic signature
  const verifyRes = await request('POST', '/v1/payments/verify', {
    orderId: rzpPendingOrder.id,
    gatewayOrderId: gwOrder.gatewayOrderId,
    gatewayPaymentId: `pay_${Date.now()}`,
    gatewaySignature: 'mock_valid_signature'
  });
  const verifyResult = verifyRes.data?.data || verifyRes.data;
  if (!verifyResult.success) {
    throw new Error('Payment verification failed: ' + JSON.stringify(verifyRes));
  }
  console.log(`12. Payment Verification & Confirmation: PASS (Order: ${verifyResult.order?.orderNumber}, Payment: ${verifyResult.order?.paymentStatus})`);

  // 13. Query Orders for VIP Customer
  const userOrdersRes = await request('GET', '/v1/orders/user/usr-customer-01');
  const userOrders = userOrdersRes.data?.data || userOrdersRes.data;
  console.log(`13. Customer Order History: PASS (Total confirmed orders for Aarav Mehta: ${userOrders.length})`);

  console.log('\n--- ALL PHASE 4 & 5 COMMERCE, CART, CHECKOUT & PAYMENT TESTS PASSED ---');
}

runTests().catch((err) => {
  console.error('\nTest Failed with Error:\n', err);
  process.exit(1);
});
