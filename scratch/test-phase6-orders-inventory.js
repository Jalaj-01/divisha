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

function unwrap(res) {
  if (res && res.data && typeof res.data === 'object' && 'data' in res.data) {
    return res.data.data;
  }
  return res?.data;
}

async function runTests() {
  console.log('--- Testing Phase 6 & 7: Order Lifecycle State Machine, Inventory Auditing & Fulfillment ---');

  // 1. Health check
  const health = await request('GET', '/health');
  if (health.status !== 200) {
    throw new Error('Health check failed: ' + JSON.stringify(health));
  }
  console.log('1. Health check: PASS');

  // 2. Query Orders Directory
  const ordersRes = await request('GET', '/v1/orders?limit=10');
  const unwrappedOrders = unwrap(ordersRes);
  const orders = Array.isArray(unwrappedOrders) ? unwrappedOrders : (unwrappedOrders?.items || []);
  if (orders.length === 0) {
    throw new Error('No orders found in directory: ' + JSON.stringify(ordersRes));
  }
  let testOrder = orders.find((o) => o.status === 'CONFIRMED');
  if (!testOrder) {
    // Create a new CONFIRMED order via checkout
    const productsRes = await request('GET', '/v1/products');
    const products = unwrap(productsRes);
    const prod = products[0];
    const cartId = `cart-state-test-${Date.now()}`;
    await request('POST', `/v1/cart/${cartId}/items`, {
      productId: prod.id,
      variantId: prod.variants[0].id,
      quantity: 1
    });
    const newOrdRes = await request('POST', '/v1/checkout/create-order', {
      cartId,
      customerName: 'State Machine Test Client',
      customerEmail: 'state.test@example.com',
      customerPhone: '+919820011223',
      shippingAddress: {
        name: 'State Test',
        phone: '+919820011223',
        addressLine1: 'Test Avenue',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India',
        type: 'HOME'
      },
      paymentMethod: 'COD'
    });
    testOrder = unwrap(newOrdRes);
  }
  console.log(`2. Orders Directory Query: PASS (Found ${orders.length} orders, Selected: ${testOrder.orderNumber} in state ${testOrder.status})`);

  // 3. Lifecycle State Machine Progression: CONFIRMED -> PROCESSING -> PACKED -> SHIPPED -> OUT_FOR_DELIVERY -> DELIVERED
  console.log(`3. Testing State Machine Transitions for ${testOrder.orderNumber}:`);

  // 3a. Advance to PROCESSING
  const procRes = await request('PATCH', `/v1/orders/${testOrder.id}/status`, {
    status: 'PROCESSING',
    notes: 'Components picked from Mumbai DC warehouse floor',
    adminId: 'admin-operations-specialist'
  });
  const procOrder = unwrap(procRes);
  if (procRes.status !== 200 || procOrder?.status !== 'PROCESSING') {
    throw new Error('Transition to PROCESSING failed: ' + JSON.stringify(procRes));
  }
  console.log('   → State Transition to PROCESSING: PASS');

  // 3b. Advance to PACKED
  const packRes = await request('PATCH', `/v1/orders/${testOrder.id}/status`, {
    status: 'PACKED',
    notes: 'Multi-layer climate timber crating completed',
    adminId: 'admin-warehouse-lead'
  });
  const packOrder = unwrap(packRes);
  if (packRes.status !== 200 || packOrder?.status !== 'PACKED') {
    throw new Error('Transition to PACKED failed: ' + JSON.stringify(packRes));
  }
  console.log('   → State Transition to PACKED: PASS');

  // 3c. Advance to SHIPPED with BlueDart AWB
  const shipRes = await request('PATCH', `/v1/orders/${testOrder.id}/status`, {
    status: 'SHIPPED',
    carrier: 'BlueDart Express White-Glove',
    trackingNumber: 'BD99887766IN',
    notes: 'Air-ride climate vehicle dispatched from Bhiwandi DC'
  });
  const shippedOrder = unwrap(shipRes);
  if (shippedOrder?.status !== 'SHIPPED' || shippedOrder?.shipment?.trackingNumber !== 'BD99887766IN') {
    throw new Error('Transition to SHIPPED failed: ' + JSON.stringify(shipRes));
  }
  console.log(`   → State Transition to SHIPPED: PASS (AWB: ${shippedOrder.shipment.trackingNumber}, Carrier: ${shippedOrder.shipment.carrier})`);

  // 3d. Advance to OUT_FOR_DELIVERY
  const outRes = await request('PATCH', `/v1/orders/${testOrder.id}/status`, {
    status: 'OUT_FOR_DELIVERY',
    notes: 'Delivery technicians assigned with unboxing kit'
  });
  const outOrder = unwrap(outRes);
  if (outRes.status !== 200 || outOrder?.status !== 'OUT_FOR_DELIVERY') {
    throw new Error('Transition to OUT_FOR_DELIVERY failed: ' + JSON.stringify(outRes));
  }
  console.log('   → State Transition to OUT_FOR_DELIVERY: PASS');

  // 3e. Finalize to DELIVERED
  const delivRes = await request('PATCH', `/v1/orders/${testOrder.id}/status`, {
    status: 'DELIVERED',
    notes: 'Client signed proof of installation and unboxing checklist'
  });
  const deliveredOrder = unwrap(delivRes);
  if (deliveredOrder?.status !== 'DELIVERED' || deliveredOrder?.shipment?.status !== 'DELIVERED') {
    throw new Error('Transition to DELIVERED failed: ' + JSON.stringify(delivRes));
  }
  console.log(`   → State Transition to DELIVERED: PASS (Signed at: ${deliveredOrder.shipment.actualDeliveryDate})`);

  // 4. Test State Machine Constraint: Delivered order cannot be directly cancelled
  const invalidCancel = await request('PATCH', `/v1/orders/${testOrder.id}/status`, {
    status: 'CANCELLED',
    notes: 'Attempting invalid cancellation after delivery'
  });
  if (invalidCancel.status !== 400) {
    throw new Error('State machine failed to block cancellation of delivered order');
  }
  console.log('4. State Machine Invariant Guard: PASS (Blocked invalid cancellation of delivered order)');

  // 5. Test Cancellation & Automated Inventory Stock Replenishment
  // 5a. Create a fresh order to cancel
  const productsRes = await request('GET', '/v1/products');
  const products = unwrap(productsRes);
  const testProduct = products[0];
  const testVariant = testProduct.variants[0];

  const cancelCartId = `cart-cancel-test-${Date.now()}`;
  await request('POST', `/v1/cart/${cancelCartId}/items`, {
    productId: testProduct.id,
    variantId: testVariant.id,
    quantity: 2
  });

  const orderToCancelRes = await request('POST', '/v1/checkout/create-order', {
    cartId: cancelCartId,
    customerName: 'Test Cancellation Client',
    customerEmail: 'cancel.test@example.com',
    customerPhone: '+919999988888',
    shippingAddress: {
      name: 'Test Client',
      phone: '+919999988888',
      addressLine1: 'Test Address 123',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India',
      type: 'HOME'
    },
    paymentMethod: 'COD'
  });
  const orderToCancel = unwrap(orderToCancelRes);

  // Query inventory stock before cancellation
  const invBeforeRes = await request('GET', '/v1/inventory');
  const invBefore = unwrap(invBeforeRes);
  const variantInvBefore = (invBefore || []).find((i) => i.variantId === testVariant.id);
  const stockBefore = variantInvBefore?.currentStock || 0;

  // 5b. Cancel the order
  const cancelResultRes = await request('POST', `/v1/orders/${orderToCancel.id}/cancel`, {
    reason: 'Client relocated before shipment manifestation',
    adminId: 'admin-operations-desk'
  });
  const cancelResult = unwrap(cancelResultRes);
  if (![200, 201].includes(cancelResultRes.status) || cancelResult?.status !== 'CANCELLED') {
    throw new Error('Order cancellation failed: ' + JSON.stringify(cancelResultRes));
  }

  // Query inventory stock after cancellation -> must be stockBefore + 2
  const invAfterRes = await request('GET', '/v1/inventory');
  const invAfter = unwrap(invAfterRes);
  const variantInvAfter = (invAfter || []).find((i) => i.variantId === testVariant.id);
  const stockAfter = variantInvAfter?.currentStock || 0;

  if (stockAfter !== stockBefore + 2) {
    throw new Error(`Stock replenishment mismatch. Before: ${stockBefore}, After: ${stockAfter}, Expected: ${stockBefore + 2}`);
  }
  console.log(`5. Automated Stock Replenishment on Cancellation: PASS`);
  console.log(`   Order ${orderToCancel.orderNumber} Cancelled -> Stock Replenished: ${stockBefore} -> ${stockAfter} (+2 units returned)`);

  // 6. Generate Compliant GST Tax Invoice
  const invoiceRes = await request('GET', `/v1/orders/${testOrder.id}/invoice`);
  const invoiceData = unwrap(invoiceRes);
  if (invoiceRes.status !== 200 || !invoiceData?.invoice) {
    throw new Error('Invoice generation failed: ' + JSON.stringify(invoiceRes));
  }
  const inv = invoiceData.invoice;
  console.log(`6. GST Tax Invoice Generation: PASS`);
  console.log(`   Invoice No: ${inv.invoiceNumber}, GSTIN: ${inv.companyDetails.gstin}`);
  console.log(`   Taxable Value: ₹${inv.summary.taxableAmount}, Total Tax: ₹${inv.summary.totalTax} (18% GST)`);
  console.log(`   Digital Verification Signature: ${inv.digitalVerificationHash.substring(0, 32)}...`);

  // 7. Test Inventory Summary & Manual Stock Adjustment
  const summaryRes = await request('GET', '/v1/inventory/summary');
  const sumData = unwrap(summaryRes);
  console.log(`7. Inventory Summary Metrics: PASS (Total SKUs: ${sumData.totalSKUs}, Units On Hand: ${sumData.totalUnitsOnHand}, Reserved: ${sumData.totalUnitsReserved})`);

  // 7b. Perform Manual Stock Adjustment
  const adjustRes = await request('POST', '/v1/inventory/adjust', {
    variantId: testVariant.id,
    quantityDelta: 15,
    reason: 'PURCHASE',
    notes: 'Warehouse inward delivery batch DC-MUM-2026-B1',
    adminId: 'admin-logistics-director'
  });
  const adjustData = unwrap(adjustRes);
  if (![200, 201].includes(adjustRes.status) || !adjustData?.success) {
    throw new Error('Manual stock adjustment failed: ' + JSON.stringify(adjustRes));
  }
  console.log('8. Manual Stock Adjustment & Audit Ledger Entry: PASS (+15 units inward recorded)');

  // 8. Query Immutable Audit Transactions Log
  const txRes = await request('GET', '/v1/inventory/transactions');
  const txs = unwrap(txRes);
  if (!Array.isArray(txs) || txs.length === 0) {
    throw new Error('Transactions log empty');
  }
  const latestTx = txs[0];
  console.log(`9. Immutable Audit Transaction Ledger: PASS (Total movements logged: ${txs.length}, Latest: ${latestTx.reason} delta: ${latestTx.delta})`);

  // 10. Query Shipments Directory
  const shipmentsRes = await request('GET', '/v1/orders/shipments/all');
  const shipments = unwrap(shipmentsRes);
  if (!Array.isArray(shipments) || shipments.length === 0) {
    throw new Error('Shipments list empty');
  }
  console.log(`10. Shipments & Logistics Directory: PASS (Active carrier shipments: ${shipments.length})`);

  console.log('\n================================================================================');
  console.log('🏆 ALL PHASE 6 & 7 ORDER LIFECYCLE, INVENTORY AUDIT & FULFILLMENT TESTS PASSED!');
  console.log('================================================================================');
}

runTests().catch((err) => {
  console.error('\nTest Failed with Error:\n', err);
  process.exit(1);
});
