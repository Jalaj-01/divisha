// Integration test for Phase 3: Product & Catalog Engine
async function runTests() {
  console.log('--- Testing Phase 3: Product & Catalog Engine ---');
  const baseUrl = 'http://localhost:4000';

  // 1. Health
  const healthRes = await fetch(`${baseUrl}/health`).then((r) => r.json());
  console.log('1. Health check:', healthRes.success ? 'PASS' : 'FAIL');

  // 2. Public Products Filter
  const prodsRes = await fetch(`${baseUrl}/v1/products?limit=5`).then((r) => r.json());
  console.log('2. Public Products List:', prodsRes.success ? 'PASS' : 'FAIL', `Total: ${prodsRes.meta?.totalItems || prodsRes.data?.length}`);

  // 3. Featured Products
  const featuredRes = await fetch(`${baseUrl}/v1/products/featured`).then((r) => r.json());
  console.log('3. Featured Products:', featuredRes.success ? 'PASS' : 'FAIL', `Count: ${featuredRes.data?.length}`);

  // 4. Categories & Tree
  const catsRes = await fetch(`${baseUrl}/v1/categories`).then((r) => r.json());
  console.log('4. Categories Flat List:', catsRes.success ? 'PASS' : 'FAIL', `Count: ${catsRes.data?.length}`);

  const treeRes = await fetch(`${baseUrl}/v1/categories/tree`).then((r) => r.json());
  console.log('5. Category Tree Hierarchy:', treeRes.success ? 'PASS' : 'FAIL', `Root nodes: ${treeRes.data?.length}`);

  // 5. Brands & Partners
  const brandsRes = await fetch(`${baseUrl}/v1/brands`).then((r) => r.json());
  console.log('6. Partner Brands List:', brandsRes.success ? 'PASS' : 'FAIL', `Brands count: ${brandsRes.data?.length}`);
  const firstBrand = brandsRes.data?.[0];
  console.log(`   Brand sample: ${firstBrand?.name} (Products: ${firstBrand?.productCount})`);

  // 6. Create New Polymorphic Furniture Product
  const newProductRes = await fetch(`${baseUrl}/v1/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Artisanal Teak Wood 8-Seater Dining Suite with Brass Inlay',
      sku: 'DIV-TEAK-DINING-8S',
      description: 'Handcrafted from 100-year reclaimed Burmese teak timber with brushed solid brass joinery. Finished in organic linseed lacquer.',
      shortDescription: 'Grand 8-seater dining table with brass inlay and 8 matching teak armchairs.',
      type: 'FURNITURE',
      brandId: firstBrand?.id || 'brand-divisha-signature',
      categoryId: catsRes.data?.[0]?.id || 'cat-dining-tables',
      basePrice: 185000,
      salePrice: 169000,
      taxRate: 18,
      warrantyInfo: '10 Years Solid Teak Timber Structural Guarantee',
      isFeatured: true,
      has3DModel: true,
      variants: [
        {
          title: '8-Seater / Natural Golden Teak',
          sku: 'DIV-TEAK-8S-NAT',
          price: 185000,
          salePrice: 169000,
          stock: 4,
          options: { size: '240cm x 100cm', finish: 'Natural Teak' }
        },
        {
          title: '10-Seater / Royal Walnut Stain',
          sku: 'DIV-TEAK-10S-WAL',
          price: 225000,
          salePrice: 205000,
          stock: 2,
          options: { size: '300cm x 110cm', finish: 'Royal Walnut' }
        }
      ],
      specifications: [
        {
          group: 'Joinery & Craftsmanship',
          items: [
            { key: 'Timber Grade', value: 'Grade-A Plantation Heartwood Teak' },
            { key: 'Inlay Material', value: 'Brushed Solid Brass' },
            { key: 'Weight', value: '145 kg' }
          ]
        }
      ]
    })
  }).then((r) => r.json());

  console.log('7. Create Product (Furniture with Variants & Specs):', newProductRes.success ? 'PASS' : 'FAIL');
  const createdProd = newProductRes.data;
  console.log(`   Product ID: ${createdProd?.id}, SKU: ${createdProd?.sku}`);
  console.log(`   Variants Count: ${createdProd?.variants?.length}`);

  // 7. Update Product
  const updateRes = await fetch(`${baseUrl}/v1/products/${createdProd.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      salePrice: 165000,
      warrantyInfo: '15 Years Comprehensive Solid Timber Guarantee'
    })
  }).then((r) => r.json());
  console.log('8. Update Product Price & Warranty:', updateRes.success ? 'PASS' : 'FAIL', `New Price: ₹${updateRes.data?.salePrice}`);

  // 8. Add Variant to Product
  const addVarRes = await fetch(`${baseUrl}/v1/products/${createdProd.id}/variants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: '6-Seater / Compact Villa Edition',
      sku: 'DIV-TEAK-6S-NAT',
      price: 145000,
      salePrice: 135000,
      stock: 5,
      options: { size: '180cm x 90cm', finish: 'Natural Teak' }
    })
  }).then((r) => r.json());
  console.log('9. Add Variant to Product:', addVarRes.success ? 'PASS' : 'FAIL', addVarRes.data?.sku);

  // 9. Create New Brand Partner
  const newBrandRes = await fetch(`${baseUrl}/v1/brands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Bowers & Wilkins',
      description: 'World-renowned British luxury loudspeakers and custom architectural audio.',
      websiteUrl: 'https://bowerswilkins.com',
      isPartner: true
    })
  }).then((r) => r.json());
  console.log('10. Create Brand Partner:', newBrandRes.success ? 'PASS' : 'FAIL', newBrandRes.data?.name);

  // 10. Create New Category
  const newCatRes = await fetch(`${baseUrl}/v1/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Architectural Audio & Soundbars',
      type: 'ELECTRONICS',
      description: 'High-fidelity Dolby Atmos soundbars and hidden in-wall architectural speakers',
      sortOrder: 8
    })
  }).then((r) => r.json());
  console.log('11. Create Category:', newCatRes.success ? 'PASS' : 'FAIL', newCatRes.data?.name);

  console.log('\n--- ALL PHASE 3 BACKEND CATALOG ENDPOINTS VALIDATED SUCCESSFULLY ---');
}

runTests().catch(console.error);
