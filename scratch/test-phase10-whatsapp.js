// Phase 10: WhatsApp Luxury Concierge Integration Test Suite

const BASE_URL = 'http://localhost:4000/v1/whatsapp';

async function runTests() {
  console.log('🧪 [TEST] Starting Phase 10 WhatsApp Concierge Suite Tests...\n');

  // Test 1: Fetch Departments
  console.log('1️⃣ Fetching Concierge Departments...');
  const deptRes = await fetch(`${BASE_URL}/departments`);
  const deptBody = await deptRes.json();
  const depts = deptBody.data || deptBody;
  console.log(`   Departments found: ${depts.length}`);
  if (!Array.isArray(depts) || depts.length < 3) {
    throw new Error('Expected at least 3 concierge departments');
  }
  console.log(`   ✅ Departments verified: ${depts.map(d => d.name).join(', ')}`);

  // Test 2: Update Department Status
  console.log('\n2️⃣ Updating Department Status (dept-tech toggle)...');
  const patchRes = await fetch(`${BASE_URL}/departments/dept-tech`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isAvailable: true, operatingHours: '8:30 AM - 9:30 PM IST (Extended VIP)' })
  });
  const patchBody = await patchRes.json();
  const updatedDept = patchBody.data || patchBody;
  if (updatedDept.operatingHours !== '8:30 AM - 9:30 PM IST (Extended VIP)') {
    throw new Error('Failed to update department operating hours');
  }
  console.log(`   ✅ Department updated successfully: ${updatedDept.name} -> ${updatedDept.operatingHours}`);

  // Test 3: Fetch Templates
  console.log('\n3️⃣ Fetching Meta Cloud API Templates...');
  const tmplRes = await fetch(`${BASE_URL}/templates`);
  const tmplBody = await tmplRes.json();
  const templates = tmplBody.data || tmplBody;
  console.log(`   Templates loaded: ${templates.length}`);
  const hasVipQuote = templates.some(t => t.id === 'tmpl-vip-quote');
  if (!hasVipQuote) {
    throw new Error('tmpl-vip-quote template missing');
  }
  console.log(`   ✅ Meta Approved templates confirmed (${templates.map(t => t.name).join(', ')})`);

  // Test 4: Generate VIP Quotation Link
  console.log('\n4️⃣ Generating Interactive VIP Quotation Link...');
  const quotePayload = {
    customerName: 'Raghavendra Goenka',
    customerPhone: '+919820099887',
    items: [
      {
        productId: 'prod-oled-77',
        productName: 'Divisha Celestial 77" Master OLED 4K',
        sku: 'DIV-OLED-77-MST',
        quantity: 1,
        unitPrice: 289999,
        variantTitle: '77" Titanium Acoustic Frame'
      },
      {
        productId: 'prod-teak-table',
        productName: 'Solid Malabar Teak 8-Seater Dining Table',
        sku: 'DIV-FURN-MALABAR-8S',
        quantity: 1,
        unitPrice: 125000,
        variantTitle: 'Natural Honey Teak / Matte PU'
      }
    ],
    discountPercentage: 10,
    customNotes: 'Includes customized concealed cable raceway and living room acoustic calibration.',
    validUntilDays: 14
  };

  const quoteRes = await fetch(`${BASE_URL}/quote-link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quotePayload)
  });
  const quoteBody = await quoteRes.json();
  const quoteData = quoteBody.data || quoteBody;
  console.log(`   Subtotal: ₹${quoteData.summary.subtotal.toLocaleString('en-IN')}`);
  console.log(`   Privilege Discount (10%): -₹${quoteData.summary.discountAmount.toLocaleString('en-IN')}`);
  console.log(`   Total Payable: ₹${quoteData.summary.totalPayable.toLocaleString('en-IN')}`);
  console.log(`   Valid Until: ${quoteData.summary.validUntil}`);
  if (!quoteData.whatsappUrl.includes('https://wa.me/919820099887')) {
    throw new Error('Invalid WhatsApp URL generated for customer phone');
  }
  console.log('   ✅ VIP Quotation generated and validated successfully.');

  // Test 5: BlueDart White-Glove Dispatch Alert
  console.log('\n5️⃣ Dispatching Simulated BlueDart White-Glove Shipping Alert...');
  const dispatchPayload = {
    orderId: 'DIV-2026-ORD-8822',
    customerName: 'Raghavendra Goenka',
    customerPhone: '+919820099887',
    carrier: 'BlueDart Apex Express',
    awbNumber: 'BD-991188224',
    trackingUrl: 'https://track.bluedart.com/track/BD-991188224',
    expectedDeliveryDate: '26 Sep 2026 by 4:00 PM',
    destinationCity: 'Bhopal, Madhya Pradesh',
    securityPin: '7482',
    whiteGloveAssembly: true
  };

  const dispRes = await fetch(`${BASE_URL}/dispatch-alert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dispatchPayload)
  });
  const dispBody = await dispRes.json();
  const dispData = dispBody.data || dispBody;
  if (!dispData.success || dispData.deliveryStatus !== 'DELIVERED') {
    throw new Error('Dispatch alert failed');
  }
  console.log(`   ✅ Dispatch Alert recorded: Message ID ${dispData.messageId}, Status: ${dispData.deliveryStatus}`);

  // Test 6: Message Logs Inspection
  console.log('\n6️⃣ Inspecting WhatsApp Delivery Audit Logs...');
  const logsRes = await fetch(`${BASE_URL}/logs`);
  const logsBody = await logsRes.json();
  const logs = logsBody.data || logsBody;
  console.log(`   Total logs in ledger: ${logs.length}`);
  const latestLog = logs[0];
  console.log(`   Latest Log: [${latestLog.messageType}] to ${latestLog.toPhone} (${latestLog.recipientName}) - Status: ${latestLog.status}`);
  if (!logs.some(l => l.messageType === 'VIP_QUOTATION') || !logs.some(l => l.messageType === 'DISPATCH_NOTIFICATION')) {
    throw new Error('Expected VIP_QUOTATION and DISPATCH_NOTIFICATION in logs');
  }
  console.log('   ✅ WhatsApp Audit Ledger verified with all transaction events.');

  console.log('\n🎉 ALL PHASE 10 WHATSAPP BACKEND TESTS PASSED CLEANLY!\n');
}

runTests().catch(err => {
  console.error('❌ Phase 10 Test Error:', err);
  process.exit(1);
});
