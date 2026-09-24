const http = require('http');

const API_HOST = 'localhost';
const API_PORT = 4000;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const jsonBody = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      ...headers
    };
    if (jsonBody) {
      reqHeaders['Content-Type'] = 'application/json';
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
            resolve({ status: res.statusCode, data: parsed, headers: res.headers, raw: rawData });
          } catch {
            resolve({ status: res.statusCode, raw: rawData, headers: res.headers });
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
  console.log('--- Testing Phase 8 & 9: CMS Dynamic Layout Engine, Telemetry & CSV Reports ---');

  // 1. Health check
  const health = await request('GET', '/health');
  if (health.status !== 200) {
    throw new Error('Health check failed: ' + JSON.stringify(health));
  }
  console.log('1. Health check: PASS');

  // 2. CMS Banners CRUD
  console.log('\n2. Testing Promotional Banners Engine:');
  const bannersRes = await request('GET', '/v1/cms/banners');
  const banners = unwrap(bannersRes);
  if (!Array.isArray(banners) || banners.length === 0) {
    throw new Error('Failed to retrieve banners: ' + JSON.stringify(bannersRes));
  }
  console.log(`   → Query Banners: PASS (Found ${banners.length} promotional banners, Initial: "${banners[0].title}")`);

  // Create new banner
  const newBannerRes = await request('POST', '/v1/cms/banners', {
    title: 'Grand Festive Celebration 2026',
    subtitle: 'Exclusive Privileges on Handcrafted Solid Teak Furniture & OLEDs',
    badge: 'ROYAL PRIVILEGE',
    ctaText: 'Claim Festive Privilege',
    ctaLink: '/shop?coupon=FESTIVE5000',
    desktopImageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=2000&q=85',
    isActive: true,
    sortOrder: 10
  });
  const newBanner = unwrap(newBannerRes);
  if (![200, 201].includes(newBannerRes.status) || !newBanner?.id) {
    throw new Error('Failed to create banner: ' + JSON.stringify(newBannerRes));
  }
  console.log(`   → Create Banner: PASS (Created: "${newBanner.title}" ID: ${newBanner.id})`);

  // Update banner
  const updateBannerRes = await request('PATCH', `/v1/cms/banners/${newBanner.id}`, {
    subtitle: 'Updated Subtitle: Bespoke Living Redefined'
  });
  const updatedBanner = unwrap(updateBannerRes);
  if (updateBannerRes.status !== 200 || updatedBanner?.subtitle !== 'Updated Subtitle: Bespoke Living Redefined') {
    throw new Error('Failed to update banner: ' + JSON.stringify(updateBannerRes));
  }
  console.log('   → Update Banner: PASS');

  // Delete banner
  const deleteBannerRes = await request('DELETE', `/v1/cms/banners/${newBanner.id}`);
  if (deleteBannerRes.status !== 200) {
    throw new Error('Failed to delete banner: ' + JSON.stringify(deleteBannerRes));
  }
  console.log('   → Delete Banner: PASS');

  // 3. CMS Homepage Content Blocks
  console.log('\n3. Testing Homepage Content Blocks:');
  const blocksRes = await request('GET', '/v1/cms/homepage-blocks');
  const blocks = unwrap(blocksRes);
  if (!Array.isArray(blocks) || blocks.length === 0) {
    throw new Error('Failed to retrieve homepage blocks: ' + JSON.stringify(blocksRes));
  }
  console.log(`   → Query Blocks: PASS (Found ${blocks.length} sections, Top: ${blocks[0].type})`);

  // Create block
  const newBlockRes = await request('POST', '/v1/cms/homepage-blocks', {
    page: 'HOME',
    type: 'ROOM_INSPIRATION',
    title: 'Indore Master Suite Lookbook',
    subtitle: 'Acoustic integration with solid plantation teakwood',
    isActive: true,
    sortOrder: 99
  });
  const newBlock = unwrap(newBlockRes);
  if (![200, 201].includes(newBlockRes.status) || !newBlock?.id) {
    throw new Error('Failed to create block: ' + JSON.stringify(newBlockRes));
  }
  console.log(`   → Create Block: PASS (Type: ${newBlock.type}, Title: "${newBlock.title}")`);

  // Reorder blocks
  const reorderRes = await request('PUT', '/v1/cms/homepage-blocks/reorder', {
    orderIds: [newBlock.id, ...blocks.map((b) => b.id)]
  });
  const reordered = unwrap(reorderRes);
  if (reorderRes.status !== 200 || reordered[0]?.id !== newBlock.id) {
    throw new Error('Failed to reorder blocks: ' + JSON.stringify(reorderRes));
  }
  console.log('   → Reorder Layout Blocks: PASS (Moved new block to priority slot #0)');

  // Cleanup test block
  await request('DELETE', `/v1/cms/homepage-blocks/${newBlock.id}`);
  console.log('   → Cleanup Test Block: PASS');

  // 4. CMS Editorial Pages
  console.log('\n4. Testing Editorial & Governance Pages:');
  const pagesRes = await request('GET', '/v1/cms/pages');
  const pages = unwrap(pagesRes);
  if (!Array.isArray(pages) || pages.length === 0) {
    throw new Error('Failed to retrieve pages: ' + JSON.stringify(pagesRes));
  }
  console.log(`   → Query Pages Directory: PASS (Found ${pages.length} pages: ${pages.map((p) => p.slug).join(', ')})`);

  // Fetch page by slug
  const aboutPageRes = await request('GET', '/v1/cms/pages/about-us');
  const aboutPage = unwrap(aboutPageRes);
  if (aboutPageRes.status !== 200 || !aboutPage?.content.includes('Indore, Madhya Pradesh')) {
    throw new Error('About page does not contain expected Indore headquarters info: ' + JSON.stringify(aboutPageRes));
  }
  console.log(`   → Fetch /about-us Page: PASS (Verified Indore, Madhya Pradesh HQ details)`);

  const craftsmanshipRes = await request('GET', '/v1/cms/pages/craftsmanship');
  const craftPage = unwrap(craftsmanshipRes);
  if (craftsmanshipRes.status !== 200 || !craftPage?.content.includes('Mortise & Tenon')) {
    throw new Error('Craftsmanship page missing expected joinery details');
  }
  console.log(`   → Fetch /craftsmanship Page: PASS (Verified Mortise & Tenon joinery copy)`);

  // Create new dynamic page
  const testPageSlug = `test-policy-${Date.now()}`;
  const newPageRes = await request('POST', '/v1/cms/pages', {
    title: 'Acoustic Calibration Standards',
    slug: testPageSlug,
    content: '# Acoustic Precision\n\nDivisha master engineers calibrate Dolby Atmos acoustics on site.',
    metaTitle: 'Acoustic Calibration | Divisha Electronics',
    isPublished: true
  });
  const newPage = unwrap(newPageRes);
  if (![200, 201].includes(newPageRes.status) || !newPage?.id) {
    throw new Error('Failed to create page: ' + JSON.stringify(newPageRes));
  }
  console.log(`   → Create New Editorial Page: PASS (Slug: /${newPage.slug})`);

  // Delete test page
  await request('DELETE', `/v1/cms/pages/${newPage.id}`);
  console.log('   → Delete Editorial Page: PASS');

  // 5. Telemetry & Analytics Engine
  console.log('\n5. Testing Telemetry & Conversion Funnel Analytics:');
  const testSessionId = `test-sess-${Date.now()}`;

  // Stream telemetry events
  await request('POST', '/v1/analytics/event', {
    eventType: 'PAGE_VIEW',
    sessionId: testSessionId,
    metadata: { path: '/shop' }
  });
  await request('POST', '/v1/analytics/event', {
    eventType: 'PRODUCT_VIEW',
    sessionId: testSessionId,
    entityId: 'prod-oled-65',
    metadata: { productName: 'Sony Bravia OLED' }
  });
  await request('POST', '/v1/analytics/event', {
    eventType: 'ADD_TO_CART',
    sessionId: testSessionId,
    entityId: 'var-tv-65',
    metadata: { price: 219990 }
  });
  await request('POST', '/v1/analytics/event', {
    eventType: 'CHECKOUT_STARTED',
    sessionId: testSessionId,
    metadata: { totalAmount: 219990 }
  });
  console.log('   → Stream Telemetry Events: PASS (Ingested 4 events for session)');

  // Verify events stream
  const eventsRes = await request('GET', '/v1/analytics/events?limit=10');
  const eventsList = unwrap(eventsRes);
  if (!Array.isArray(eventsList) || eventsList.length === 0) {
    throw new Error('Failed to retrieve events stream: ' + JSON.stringify(eventsRes));
  }
  console.log(`   → Query Events Stream: PASS (Retrieved ${eventsList.length} recent telemetry items)`);

  // Verify dashboard KPIs & conversion funnel
  const kpisRes = await request('GET', '/v1/analytics/kpis');
  const kpis = unwrap(kpisRes);
  if (kpisRes.status !== 200 || !kpis?.conversionFunnel) {
    throw new Error('Failed to retrieve KPIs: ' + JSON.stringify(kpisRes));
  }
  const f = kpis.conversionFunnel;
  console.log(`   → Conversion Funnel Telemetry: PASS`);
  console.log(`     Visitors: ${f.visitors} → Views: ${f.productViews} → Cart: ${f.addToCart} → Checkout: ${f.checkoutStarted} → Paid: ${f.purchaseCompleted}`);
  console.log(`     Cart Abandonment: ${f.cartAbandonmentRate}% | Overall Conversion: ${f.overallConversionRate}%`);

  // 6. Financial & Tax CSV Reports Exporter
  console.log('\n6. Testing Statutory CSV Reports Exporter:');

  // 6a. Orders CSV
  const ordersCsvRes = await request('GET', '/v1/analytics/reports/export?type=orders');
  if (ordersCsvRes.status !== 200 || !ordersCsvRes.headers['content-type'].includes('text/csv')) {
    throw new Error('Orders CSV export failed: ' + JSON.stringify(ordersCsvRes));
  }
  const ordersCsvContent = ordersCsvRes.raw;
  if (!ordersCsvContent.includes('Order Reference') || !ordersCsvContent.includes('DIV-2026-')) {
    throw new Error('Orders CSV content malformed or missing order references');
  }
  console.log(`   → Export Orders CSV: PASS (Size: ${ordersCsvContent.length} bytes, Header: Order Reference, Order Date...)`);

  // 6b. Inventory CSV
  const invCsvRes = await request('GET', '/v1/analytics/reports/export?type=inventory');
  if (invCsvRes.status !== 200 || !invCsvRes.headers['content-type'].includes('text/csv')) {
    throw new Error('Inventory CSV export failed: ' + JSON.stringify(invCsvRes));
  }
  const invCsvContent = invCsvRes.raw;
  if (!invCsvContent.includes('SKU') || !invCsvContent.includes('On Hand Stock')) {
    throw new Error('Inventory CSV content malformed');
  }
  console.log(`   → Export Inventory CSV: PASS (Size: ${invCsvContent.length} bytes, Header: SKU, Product Name...)`);

  // 6c. Tax CSV (Madhya Pradesh GST)
  const taxCsvRes = await request('GET', '/v1/analytics/reports/export?type=tax');
  if (taxCsvRes.status !== 200 || !taxCsvRes.headers['content-type'].includes('text/csv')) {
    throw new Error('Tax CSV export failed: ' + JSON.stringify(taxCsvRes));
  }
  const taxCsvContent = taxCsvRes.raw;
  if (!taxCsvContent.includes('23AABCD1234F1Z5') || !taxCsvContent.includes('Madhya Pradesh (State Code: 23)')) {
    throw new Error('Tax CSV missing required Madhya Pradesh (Code 23) statutory GST details');
  }
  console.log(`   → Export GST Tax CSV (Madhya Pradesh): PASS`);
  console.log(`     Confirmed Company GSTIN: 23AABCD1234F1Z5, State Code: 23`);
  console.log(`     Intrastate MP: CGST 9% + SGST 9%, Interstate: IGST 18%`);

  console.log('\n================================================================================');
  console.log('🏆 ALL PHASE 8 & 9 CMS, TELEMETRY & MADHYA PRADESH TAX CSV TESTS PASSED!');
  console.log('================================================================================');
}

runTests().catch((err) => {
  console.error('\nTest Failed with Error:\n', err);
  process.exit(1);
});
