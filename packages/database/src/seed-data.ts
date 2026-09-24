import {
  ProductCategoryType,
  UserRole,
  PermissionCode,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  ShipmentStatus,
  ContentBlockType,
  OrderDTO,
  PageDTO
} from '@divisha/types';

export const SEED_PERMISSIONS = [
  // Users & Profiles
  { id: 'perm-users-read', code: PermissionCode.USERS_READ, name: 'View Customers', module: 'users', description: 'View customer accounts, profiles, and order histories' },
  { id: 'perm-users-update', code: PermissionCode.USERS_UPDATE, name: 'Edit Customers', module: 'users', description: 'Modify customer profiles and addresses' },
  { id: 'perm-users-deact', code: PermissionCode.USERS_DEACTIVATE, name: 'Deactivate Customers', module: 'users', description: 'Disable customer accounts' },

  // Catalog
  { id: 'perm-cat-read', code: PermissionCode.CATALOG_READ, name: 'View Catalog', module: 'catalog', description: 'View products, variants, categories, and brands' },
  { id: 'perm-cat-create', code: PermissionCode.CATALOG_CREATE, name: 'Create Products', module: 'catalog', description: 'Add new products, variants, and categories' },
  { id: 'perm-cat-update', code: PermissionCode.CATALOG_UPDATE, name: 'Edit Products', module: 'catalog', description: 'Update products, prices, images, and specifications' },
  { id: 'perm-cat-delete', code: PermissionCode.CATALOG_DELETE, name: 'Archive Products', module: 'catalog', description: 'Archive or remove catalog products' },

  // Inventory
  { id: 'perm-inv-read', code: PermissionCode.INVENTORY_READ, name: 'View Stock', module: 'inventory', description: 'Inspect stock levels, reserved quantities, and thresholds' },
  { id: 'perm-inv-update', code: PermissionCode.INVENTORY_UPDATE, name: 'Update Thresholds', module: 'inventory', description: 'Update low stock alerts and locations' },
  { id: 'perm-inv-adjust', code: PermissionCode.INVENTORY_ADJUST, name: 'Adjust Stock', module: 'inventory', description: 'Execute stock addition or deduction with mandatory audit reason' },

  // Orders & Shipments
  { id: 'perm-ord-read', code: PermissionCode.ORDERS_READ, name: 'View Orders', module: 'orders', description: 'View orders, customer addresses, and tracking' },
  { id: 'perm-ord-update', code: PermissionCode.ORDERS_UPDATE, name: 'Update Order Status', module: 'orders', description: 'Transition order fulfillment lifecycle states' },
  { id: 'perm-ord-cancel', code: PermissionCode.ORDERS_CANCEL, name: 'Cancel Orders', module: 'orders', description: 'Cancel pending or processing orders' },

  // Finance & Payments
  { id: 'perm-pay-read', code: PermissionCode.PAYMENTS_READ, name: 'View Payments', module: 'payments', description: 'Inspect gateway transactions, webhooks, and payout ledgers' },
  { id: 'perm-fin-read', code: PermissionCode.FINANCE_READ, name: 'Financial Reporting', module: 'finance', description: 'View revenue breakdowns, gross margin, and AOV' },
  { id: 'perm-fin-refund', code: PermissionCode.FINANCE_REFUND, name: 'Process Refunds', module: 'finance', description: 'Authorize and execute gateway refunds' },

  // Content & CMS
  { id: 'perm-cms-read', code: PermissionCode.CONTENT_READ, name: 'View CMS Blocks', module: 'content', description: 'View banners, homepage blocks, and content pages' },
  { id: 'perm-cms-create', code: PermissionCode.CONTENT_CREATE, name: 'Create Banners', module: 'content', description: 'Create promotional hero banners and pages' },
  { id: 'perm-cms-update', code: PermissionCode.CONTENT_UPDATE, name: 'Update Layouts', module: 'content', description: 'Reorder homepage content blocks and update copy' },
  { id: 'perm-cms-delete', code: PermissionCode.CONTENT_DELETE, name: 'Delete Content', module: 'content', description: 'Remove inactive banners or pages' },

  // Analytics & Administration
  { id: 'perm-ana-read', code: PermissionCode.ANALYTICS_READ, name: 'View Analytics', module: 'analytics', description: 'View conversion funnel telemetry and sales metrics' },
  { id: 'perm-rep-export', code: PermissionCode.REPORTS_EXPORT, name: 'Export Reports', module: 'reports', description: 'Download CSV reports for orders, sales, and inventory' },
  { id: 'perm-adm-manage', code: PermissionCode.ADMIN_MANAGE, name: 'Manage Admins', module: 'admin', description: 'Create and deactivate administrative users' },
  { id: 'perm-rol-manage', code: PermissionCode.ROLES_MANAGE, name: 'Manage Roles', module: 'admin', description: 'Customize roles and granular permission matrices' },
  { id: 'perm-aud-read', code: PermissionCode.AUDIT_READ, name: 'View Audit Logs', module: 'audit', description: 'Inspect immutable administrative operational audit logs' },
  { id: 'perm-set-update', code: PermissionCode.SETTINGS_UPDATE, name: 'Update Settings', module: 'settings', description: 'Modify store configurations and gateway keys' }
];

export const SEED_ROLES = [
  {
    id: 'role-super-admin',
    name: 'Super Admin',
    code: UserRole.SUPER_ADMIN,
    description: 'Full operational and system-level administrative permissions',
    isSystem: true,
    permissions: SEED_PERMISSIONS
  },
  {
    id: 'role-admin',
    name: 'Administrator',
    code: UserRole.ADMIN,
    description: 'Store operations manager with full catalog, orders, and content permissions',
    isSystem: true,
    permissions: SEED_PERMISSIONS.filter((p) => p.module !== 'admin')
  },
  {
    id: 'role-catalog-manager',
    name: 'Catalog Manager',
    code: UserRole.CATALOG_MANAGER,
    description: 'Manage products, categories, variants, inventory, and brands',
    isSystem: true,
    permissions: SEED_PERMISSIONS.filter((p) => p.module === 'catalog' || p.module === 'inventory')
  },
  {
    id: 'role-order-manager',
    name: 'Order Manager',
    code: UserRole.ORDER_MANAGER,
    description: 'Process orders, update fulfillment states, manage shipments',
    isSystem: true,
    permissions: SEED_PERMISSIONS.filter((p) => p.module === 'orders' || p.code === PermissionCode.USERS_READ)
  },
  {
    id: 'role-finance-manager',
    name: 'Finance Manager',
    code: UserRole.FINANCE_MANAGER,
    description: 'View transactions, reconcile payouts, and process refunds',
    isSystem: true,
    permissions: SEED_PERMISSIONS.filter((p) => p.module === 'finance' || p.module === 'payments')
  },
  {
    id: 'role-support-agent',
    name: 'Support Agent',
    code: UserRole.SUPPORT_AGENT,
    description: 'Customer service support agent handling chat, call inquiries, and order lookups',
    isSystem: true,
    permissions: SEED_PERMISSIONS.filter((p) => [PermissionCode.USERS_READ, PermissionCode.ORDERS_READ].includes(p.code))
  }
];

export const SEED_CATEGORIES = [
  {
    id: 'cat-oled-tv',
    name: 'Smart 4K & OLED TVs',
    slug: 'oled-tvs',
    type: ProductCategoryType.ELECTRONICS,
    description: 'Cinematic display experiences with self-lit pixels and Dolby Vision IQ',
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'cat-refrigerators',
    name: 'Smart Inverter Refrigerators',
    slug: 'refrigerators',
    type: ProductCategoryType.ELECTRONICS,
    description: 'Multi-door French door refrigerators with intelligent twin cooling',
    imageUrl: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'cat-air-conditioners',
    name: 'Inverter Air Conditioners',
    slug: 'air-conditioners',
    type: ProductCategoryType.ELECTRONICS,
    description: '5-star energy efficient AI-convertible dual inverter ACs with PM 2.5 filtration',
    imageUrl: 'https://images.unsplash.com/photo-1614633833026-0a2569e54d5b?auto=format&fit=crop&w=800&q=80',
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'cat-sofas',
    name: 'Luxury Sofas & Sectionals',
    slug: 'sofas-sectionals',
    type: ProductCategoryType.FURNITURE,
    description: 'Handcrafted top-grain leather and Belgian velvet luxury living room seating',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    sortOrder: 4,
    isActive: true
  },
  {
    id: 'cat-beds',
    name: 'Solid Teak Beds & Mattresses',
    slug: 'beds-mattresses',
    type: ProductCategoryType.FURNITURE,
    description: 'Ergonomic king beds with solid timber joinery and orthopedic memory comfort',
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
    sortOrder: 5,
    isActive: true
  },
  {
    id: 'cat-dining',
    name: 'Designer Dining Tables',
    slug: 'dining-tables',
    type: ProductCategoryType.FURNITURE,
    description: 'Architectural marble and solid oak dining tables for grand entertaining',
    imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
    sortOrder: 6,
    isActive: true
  }
];

export const SEED_BRANDS = [
  {
    id: 'brand-divisha-signature',
    name: 'Divisha Signature',
    slug: 'divisha-signature',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    description: 'Bespoke hand-crafted luxury furniture and curated high-end living',
    isActive: true
  },
  {
    id: 'brand-sony',
    name: 'Sony',
    slug: 'sony',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg',
    description: 'Pioneers in high-fidelity audio and Cognitive Processor XR OLED displays',
    isActive: true
  },
  {
    id: 'brand-samsung',
    name: 'Samsung',
    slug: 'samsung',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
    description: 'Innovators in Neo QLED visual technology and bespoke connected home appliances',
    isActive: true
  },
  {
    id: 'brand-lg',
    name: 'LG Electronics',
    slug: 'lg',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/LG_logo_%282015%29.svg',
    description: 'World-renowned OLED panels and AI ThinQ smart refrigeration systems',
    isActive: true
  }
];

export const SEED_PRODUCTS = [
  {
    id: 'prod-oled-65',
    name: 'Sony Bravia XR 65" Master Series 4K HDR OLED TV',
    slug: 'sony-bravia-xr-65-master-series-oled',
    sku: 'SNY-XR65-OLED',
    barcode: '8901234567890',
    description:
      'Immerse in pure blacks and lifelike brightness powered by the revolutionary Cognitive Processor XR™. Featuring Acoustic Surface Audio+™ where sound emerges directly from the screen, matching visuals with unparalleled realism.',
    shortDescription: '65-inch 4K HDR OLED with Cognitive XR processor, 120Hz refresh rate, and Dolby Vision Atmos.',
    type: ProductCategoryType.ELECTRONICS,
    brandId: 'brand-sony',
    categoryId: 'cat-oled-tv',
    basePrice: 249990,
    salePrice: 219990,
    taxRate: 18.0,
    warrantyInfo: '3 Years Comprehensive Manufacturer Onsite Warranty',
    isFeatured: true,
    isActive: true,
    isArchived: false,
    has3DModel: true,
    model3DUrl: '/models/oled_tv_3d.glb',
    ratingAverage: 4.9,
    reviewCount: 42,
    totalSold: 128,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    images: [
      {
        id: 'img-tv-1',
        url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1200&q=85',
        thumbnailUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80',
        altText: 'Sony Bravia XR 65 Master Series front view in modern luxury living room',
        sortOrder: 0,
        isPrimary: true
      },
      {
        id: 'img-tv-2',
        url: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1200&q=85',
        thumbnailUrl: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=400&q=80',
        altText: 'Ultra-thin bezel profile and premium brushed aluminum stand',
        sortOrder: 1,
        isPrimary: false
      }
    ],
    variants: [
      {
        id: 'var-tv-65',
        productId: 'prod-oled-65',
        sku: 'SNY-XR65-OLED-TITANIUM',
        title: '65 Inch / Titanium Stand',
        price: 249990,
        salePrice: 219990,
        stock: 14,
        weight: 22.5,
        options: { displaySize: '65 Inch', finish: 'Titanium Slate' },
        isActive: true,
        images: []
      },
      {
        id: 'var-tv-77',
        productId: 'prod-oled-65',
        sku: 'SNY-XR77-OLED-TITANIUM',
        title: '77 Inch / Cinema Edition',
        price: 399990,
        salePrice: 359990,
        stock: 6,
        weight: 34.0,
        options: { displaySize: '77 Inch', finish: 'Titanium Slate' },
        isActive: true,
        images: []
      }
    ],
    attributes: [
      { id: 'attr-1', name: 'Display Size', value: '65 Inch', group: 'Display' },
      { id: 'attr-2', name: 'Refresh Rate', value: '120Hz Native', group: 'Display' },
      { id: 'attr-3', name: 'Audio Output', value: '60W Acoustic Surface Audio+', group: 'Audio' },
      { id: 'attr-4', name: 'Connectivity', value: 'HDMI 2.1 (4 Ports), eARC, WiFi 6, Bluetooth 5.2', group: 'Connectivity' },
      { id: 'attr-5', name: 'Power Consumption', value: '380 Watts', group: 'Power' }
    ],
    specifications: [
      {
        group: 'Display & Picture',
        items: [
          { key: 'Resolution', value: '3840 x 2160 Pixels (4K UHD)' },
          { key: 'Panel Type', value: 'Self-lit OLED with XR Triluminos Pro™' },
          { key: 'HDR Standards', value: 'Dolby Vision, HDR10, HLG' }
        ]
      },
      {
        group: 'Gaming Features',
        items: [
          { key: 'VRR (Variable Refresh Rate)', value: 'Yes (48Hz - 120Hz)' },
          { key: 'ALLM (Auto Low Latency Mode)', value: 'Yes (8.5ms response)' }
        ]
      }
    ]
  },
  {
    id: 'prod-sofa-chesterfield',
    name: 'Divisha Royal Chesterfield 3-Seater Top-Grain Leather Sofa',
    slug: 'divisha-royal-chesterfield-top-grain-leather-sofa',
    sku: 'DIV-FUR-SOF-001',
    barcode: '8909876543210',
    description:
      'Handcrafted using seasoned Burma Teak framing and upholstered in buttery, Italian semi-aniline cognac leather. Deep hand-tufted buttoning and solid brass castor feet lend timeless elegance to stately living spaces.',
    shortDescription: 'Grand 3-seater luxury sofa in Italian full-grain cognac leather with brass castor detailing.',
    type: ProductCategoryType.FURNITURE,
    brandId: 'brand-divisha-signature',
    categoryId: 'cat-sofas',
    basePrice: 185000,
    salePrice: 159000,
    taxRate: 18.0,
    warrantyInfo: '10 Years Structural Warranty on Teak Frame & High-Resilience Foam',
    isFeatured: true,
    isActive: true,
    isArchived: false,
    has3DModel: true,
    model3DUrl: '/models/luxury_sofa_3d.glb',
    ratingAverage: 4.95,
    reviewCount: 38,
    totalSold: 64,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    images: [
      {
        id: 'img-sofa-1',
        url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=85',
        thumbnailUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
        altText: 'Divisha Royal Chesterfield Sofa in Cognac Leather',
        sortOrder: 0,
        isPrimary: true
      },
      {
        id: 'img-sofa-2',
        url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=85',
        thumbnailUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=400&q=80',
        altText: 'Hand-tufted button details and solid timber joinery',
        sortOrder: 1,
        isPrimary: false
      }
    ],
    variants: [
      {
        id: 'var-sofa-cognac-3',
        productId: 'prod-sofa-chesterfield',
        sku: 'DIV-SOF-COG-3S',
        title: 'Cognac Brown / 3-Seater (220cm)',
        price: 185000,
        salePrice: 159000,
        stock: 5,
        weight: 68.0,
        options: { color: 'Cognac Brown', seatingCapacity: '3-Seater', material: 'Top-Grain Leather' },
        isActive: true,
        images: []
      },
      {
        id: 'var-sofa-emerald-3',
        productId: 'prod-sofa-chesterfield',
        sku: 'DIV-SOF-EME-3S',
        title: 'Emerald Velvet / 3-Seater (220cm)',
        price: 155000,
        salePrice: 139000,
        stock: 3,
        weight: 62.0,
        options: { color: 'Emerald Green', seatingCapacity: '3-Seater', material: 'Belgian Velvet' },
        isActive: true,
        images: []
      }
    ],
    attributes: [
      { id: 'attr-s1', name: 'Primary Material', value: 'Burma Teak Wood Frame', group: 'Construction' },
      { id: 'attr-s2', name: 'Upholstery', value: 'Italian Semi-Aniline Leather', group: 'Upholstery' },
      { id: 'attr-s3', name: 'Cushioning', value: '32-Density High Resilience Dual-Core Foam', group: 'Comfort' },
      { id: 'attr-s4', name: 'Seating Capacity', value: '3 to 4 Adults', group: 'Dimensions' }
    ],
    specifications: [
      {
        group: 'Dimensions & Ergonomics',
        items: [
          { key: 'Overall Dimensions', value: '225 cm (W) x 95 cm (D) x 78 cm (H)' },
          { key: 'Seat Depth', value: '62 cm' },
          { key: 'Seat Height', value: '45 cm' }
        ]
      }
    ]
  },
  {
    id: 'prod-fridge-french',
    name: 'Samsung 653L French Door Smart Refrigerator with Family Hub™',
    slug: 'samsung-653l-french-door-refrigerator-family-hub',
    sku: 'SAM-FR-653L-FH',
    barcode: '8904567890123',
    description:
      'Next-generation smart refrigeration featuring a 21.5" touchscreen Family Hub, internal Beverage Center with auto-fill water pitcher, and Triple Cooling™ technology preserving fresh aromas across distinct compartments.',
    shortDescription: '653L French Door refrigerator with AI Energy Mode, Dual Auto Ice Maker, and Black Inox Finish.',
    type: ProductCategoryType.ELECTRONICS,
    brandId: 'brand-samsung',
    categoryId: 'cat-refrigerators',
    basePrice: 220000,
    salePrice: 198000,
    taxRate: 18.0,
    warrantyInfo: '1 Year Comprehensive + 20 Years Digital Inverter Compressor Warranty',
    isFeatured: true,
    isActive: true,
    isArchived: false,
    has3DModel: false,
    ratingAverage: 4.85,
    reviewCount: 29,
    totalSold: 76,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    images: [
      {
        id: 'img-fr-1',
        url: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=1200&q=85',
        thumbnailUrl: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=400&q=80',
        altText: 'Samsung French Door Refrigerator in Matte Black Steel',
        sortOrder: 0,
        isPrimary: true
      }
    ],
    variants: [
      {
        id: 'var-fr-653',
        productId: 'prod-fridge-french',
        sku: 'SAM-FR-653L-BLACK',
        title: '653L / Matte Black Steel',
        price: 220000,
        salePrice: 198000,
        stock: 9,
        weight: 125.0,
        options: { capacity: '653 Liters', finish: 'Matte Black Steel' },
        isActive: true,
        images: []
      }
    ],
    attributes: [
      { id: 'attr-f1', name: 'Gross Capacity', value: '653 Liters', group: 'Capacity' },
      { id: 'attr-f2', name: 'Cooling Technology', value: 'Twin Cooling Plus™', group: 'Cooling' },
      { id: 'attr-f3', name: 'Compressor', value: 'Digital Inverter with 20-Year Warranty', group: 'Power' }
    ],
    specifications: [
      {
        group: 'Performance & Energy',
        items: [
          { key: 'Energy Star Rating', value: '5 Star BEE Rated' },
          { key: 'Smart Connectivity', value: 'WiFi Embedded with SmartThings Ecosystem' }
        ]
      }
    ]
  },
  {
    id: 'prod-bed-teak-king',
    name: 'Divisha Nordica Floating Solid Teak King Bed with Ambient LED',
    slug: 'divisha-nordica-solid-teak-king-bed',
    sku: 'DIV-BED-NOR-KNG',
    barcode: '8907890123456',
    description:
      'Contemporary Scandinavian minimalist cantilever silhouette crafted from kiln-seasoned natural teak. Integrated warm ambient LED underglow, acoustic bouclé upholstered headboard, and hidden soft-closing bedside storage drawers.',
    shortDescription: 'Floating King Size Bed in 100% Solid Teak with Bouclé Headboard and Warm Floating Lighting.',
    type: ProductCategoryType.FURNITURE,
    brandId: 'brand-divisha-signature',
    categoryId: 'cat-beds',
    basePrice: 145000,
    salePrice: 128000,
    taxRate: 18.0,
    warrantyInfo: '10 Years Manufacturer Warranty on Timber & Joint Stability',
    isFeatured: true,
    isActive: true,
    isArchived: false,
    has3DModel: true,
    model3DUrl: '/models/king_bed_3d.glb',
    ratingAverage: 4.92,
    reviewCount: 31,
    totalSold: 52,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    images: [
      {
        id: 'img-bed-1',
        url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=85',
        thumbnailUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80',
        altText: 'Divisha Nordica Floating King Bed in Scandinavian Master Suite',
        sortOrder: 0,
        isPrimary: true
      }
    ],
    variants: [
      {
        id: 'var-bed-king',
        productId: 'prod-bed-teak-king',
        sku: 'DIV-BED-KNG-78X72',
        title: 'King Size (78" x 72") / Natural Teak Finish',
        price: 145000,
        salePrice: 128000,
        stock: 7,
        weight: 95.0,
        options: { bedSize: 'King (78 x 72)', wood: 'Solid Teak', headboard: 'Oatmeal Bouclé' },
        isActive: true,
        images: []
      }
    ],
    attributes: [
      { id: 'attr-b1', name: 'Material', value: '100% Solid Plantation Teak', group: 'Construction' },
      { id: 'attr-b2', name: 'Finish', value: 'Matte Polyurethane Protective Coat', group: 'Finish' },
      { id: 'attr-b3', name: 'Lighting', value: '3000K Warm Integrated Dimming LED', group: 'Features' }
    ],
    specifications: [
      {
        group: 'Mattress Compatibility',
        items: [
          { key: 'Recommended Mattress Size', value: '78 inches (L) x 72 inches (W)' },
          { key: 'Frame Outer Dimensions', value: '86 inches (L) x 80 inches (W) x 40 inches (H)' }
        ]
      }
    ]
  }
];

export const SEED_COUPONS = [
  {
    id: 'coup-welcome10',
    code: 'DIVISHA10',
    description: '10% Instant Discount on your first luxury electronics or furniture purchase',
    discountType: 'PERCENTAGE' as const,
    discountValue: 10,
    minOrderAmount: 25000,
    maxDiscountAmount: 10000,
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2026-12-31T23:59:59.000Z',
    usedCount: 142,
    isActive: true
  },
  {
    id: 'coup-festive5000',
    code: 'FESTIVE5000',
    description: 'Flat ₹5,000 Off on orders above ₹75,000',
    discountType: 'FIXED_AMOUNT' as const,
    discountValue: 5000,
    minOrderAmount: 75000,
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2026-12-31T23:59:59.000Z',
    usedCount: 88,
    isActive: true
  }
];

export const SEED_BANNERS = [
  {
    id: 'ban-hero-1',
    title: 'The Art of Grand Living',
    subtitle: 'Ultra-Premium Electronics Meets Bespoke Handcrafted Furniture',
    badge: 'DIVISHA SIGNATURE 2026 COLLECTION',
    ctaText: 'Explore Collection',
    ctaLink: '/shop',
    secondaryCtaText: 'Experience in 3D',
    secondaryCtaLink: '/#3d-showcase',
    desktopImageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=85',
    sortOrder: 0,
    isActive: true
  },
  {
    id: 'ban-hero-2',
    title: 'Cinematic Brilliance. Seamless Acoustic Harmony.',
    subtitle: 'Sony Bravia XR Master Series 4K OLED Displays Now Available With White-Glove Installation',
    badge: 'FLAGSHIP VISUALS',
    ctaText: 'Discover OLED',
    ctaLink: '/shop?category=oled-tvs',
    desktopImageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=2000&q=85',
    sortOrder: 1,
    isActive: true
  }
];

export const SEED_CONTENT_BLOCKS = [
  {
    id: 'block-hero',
    page: 'HOME',
    type: ContentBlockType.HERO_SLIDER,
    title: 'Flagship Hero Showcase',
    sortOrder: 0,
    isActive: true,
    content: {
      autoplayInterval: 6000
    }
  },
  {
    id: 'block-3d',
    page: 'HOME',
    type: ContentBlockType.THREE_D_SHOWCASE,
    title: 'Interactive 3D Living Room Experience',
    subtitle: 'Rotate, inspect materials, and view every precision-engineered angle in real-time WebGL',
    sortOrder: 1,
    isActive: true,
    content: {
      featuredProductId: 'prod-oled-65',
      ambientColor: '#d4af37',
      allowAutoRotate: true
    }
  },
  {
    id: 'block-categories',
    page: 'HOME',
    type: ContentBlockType.CATEGORY_GRID,
    title: 'Curated Categories',
    subtitle: 'Distinguished design for modern homes and commercial spaces',
    sortOrder: 2,
    isActive: true,
    content: {
      columns: 3
    }
  },
  {
    id: 'block-value-props',
    page: 'HOME',
    type: ContentBlockType.VALUE_PROPOSITIONS,
    title: 'The Divisha Guarantee',
    sortOrder: 3,
    isActive: true,
    content: {
      items: [
        {
          title: 'White-Glove Delivery & Installation',
          description: 'Complimentary precision assembly and setup by trained master technicians.',
          icon: 'Truck'
        },
        {
          title: '100% Genuine Direct Warranty',
          description: 'Direct manufacturer and brand warranty certificates with prioritized onsite support.',
          icon: 'ShieldCheck'
        },
        {
          title: 'Dedicated WhatsApp Support',
          description: 'Direct 1-on-1 assistance with electronics and home appliance specialists.',
          icon: 'MessageSquare'
        },
        {
          title: 'Secure Flexible Payments',
          description: 'Up to 24 months zero-cost EMI on major credit cards, UPI, and verified COD.',
          icon: 'CreditCard'
        }
      ]
    }
  }
];

export const SEED_WHATSAPP_DEPARTMENTS = [
  {
    id: 'dept-sales',
    name: 'Sales & Product Orders',
    description: 'Assistance with new orders, pricing, EMI options, and delivery timelines',
    phone: '+919876543210',
    isAvailable: true,
    operatingHours: '9:00 AM - 9:00 PM IST',
    avatarIcon: 'Headphones'
  },
  {
    id: 'dept-furniture',
    name: 'Custom Furniture Specialist',
    description: 'Custom dimensions, bespoke upholstery choices, and living space planning',
    phone: '+919876543211',
    isAvailable: true,
    operatingHours: '10:00 AM - 8:00 PM IST',
    avatarIcon: 'Armchair'
  },
  {
    id: 'dept-tech',
    name: 'Electronics & Installation Support',
    description: 'Technical advice, wall-mounting questions, and smart home integration',
    phone: '+919876543212',
    isAvailable: true,
    operatingHours: '9:00 AM - 8:00 PM IST',
    avatarIcon: 'Tv'
  }
];

export const SEED_ADMIN_USERS = [
  {
    id: 'admin-super-01',
    email: 'admin@divisha.com',
    passwordHash: '$2a$10$w8k2cQ...mockSuperAdminHash', // DivishaAdmin@2026
    name: 'Divisha Executive Admin',
    roleId: 'role-super-admin',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'admin-cat-01',
    email: 'catalog@divisha.com',
    passwordHash: '$2a$10$w8k2cQ...mockCatalogHash', // Catalog@2026
    name: 'Vikram Sengupta (Catalog Lead)',
    roleId: 'role-catalog-manager',
    isActive: true,
    createdAt: '2026-01-15T00:00:00.000Z'
  },
  {
    id: 'admin-order-01',
    email: 'orders@divisha.com',
    passwordHash: '$2a$10$w8k2cQ...mockOrderHash', // Orders@2026
    name: 'Pooja Sharma (Fulfillment Desk)',
    roleId: 'role-order-manager',
    isActive: true,
    createdAt: '2026-02-01T00:00:00.000Z'
  }
];

export const SEED_CUSTOMERS = [
  {
    id: 'usr-customer-01',
    email: 'aarav.mehta@example.com',
    passwordHash: '$2a$10$w8k2cQ...mockCustomerHash', // Customer@2026
    phone: '+919820123456',
    role: UserRole.CUSTOMER,
    isActive: true,
    profile: {
      id: 'prof-01',
      userId: 'usr-customer-01',
      firstName: 'Aarav',
      lastName: 'Mehta',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      totalOrdersCount: 2,
      totalSpentAmount: 368990
    },
    addresses: [
      {
        id: 'addr-01',
        userId: 'usr-customer-01',
        name: 'Aarav Mehta',
        phone: '+919820123456',
        addressLine1: 'Penthouse 42, Oberoi Sky City',
        addressLine2: 'Western Express Highway, Borivali East',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400066',
        country: 'India',
        type: 'HOME' as const,
        isDefault: true
      },
      {
        id: 'addr-02',
        userId: 'usr-customer-01',
        name: 'Aarav Mehta (Studio)',
        phone: '+919820123456',
        addressLine1: 'Level 14, Maker Maxity',
        addressLine2: 'Bandra Kurla Complex',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400051',
        country: 'India',
        type: 'WORK' as const,
        isDefault: false
      }
    ],
    wishlist: ['prod-sofa-chesterfield', 'prod-fridge-french'],
    createdAt: '2026-02-10T10:00:00.000Z',
    updatedAt: '2026-09-22T10:00:00.000Z'
  }
];

export const SEED_ADMIN_USER = SEED_ADMIN_USERS[0];

export const SEED_ORDERS: OrderDTO[] = [
  {
    id: 'ord-seed-01',
    orderNumber: 'DIV-2026-98124',
    userId: 'usr-customer-01',
    customerName: 'Aarav Mehta',
    customerEmail: 'aarav.mehta@example.com',
    customerPhone: '+919820123456',
    status: OrderStatus.CONFIRMED,
    paymentStatus: PaymentStatus.SUCCESSFUL,
    paymentMethod: PaymentMethod.RAZORPAY,
    items: [
      {
        id: 'ord-item-01',
        orderId: 'ord-seed-01',
        productId: 'prod-oled-65',
        variantId: 'var-tv-65',
        productName: 'Sony Bravia XR 65" Master Series OLED 4K Google TV',
        productSlug: 'sony-bravia-xr-65-master-series-oled',
        variantTitle: '65 Inch / Titanium Stand',
        sku: 'SNY-XR65-OLED-TITANIUM',
        imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80',
        quantity: 1,
        unitPrice: 219990,
        taxAmount: 39598.2,
        discountAmount: 10000,
        totalAmount: 209990
      }
    ],
    shippingAddress: {
      id: 'addr-01',
      userId: 'usr-customer-01',
      name: 'Aarav Mehta',
      phone: '+919820123456',
      addressLine1: 'Penthouse 42, Oberoi Sky City',
      addressLine2: 'Western Express Highway, Borivali East',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400066',
      country: 'India',
      type: 'HOME',
      isDefault: true
    },
    billingAddress: {
      id: 'addr-01',
      userId: 'usr-customer-01',
      name: 'Aarav Mehta',
      phone: '+919820123456',
      addressLine1: 'Penthouse 42, Oberoi Sky City',
      addressLine2: 'Western Express Highway, Borivali East',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400066',
      country: 'India',
      type: 'HOME',
      isDefault: true
    },
    subtotal: 219990,
    discountAmount: 10000,
    couponCode: 'DIVISHA10',
    taxAmount: 37798.2,
    shippingAmount: 0,
    totalAmount: 209990,
    shipment: null,
    timeline: [
      {
        id: 'tl-01-1',
        orderId: 'ord-seed-01',
        status: OrderStatus.PENDING,
        title: 'Order Placed',
        description: 'Customer completed VIP checkout via Razorpay',
        createdAt: '2026-09-22T14:30:00.000Z'
      },
      {
        id: 'tl-01-2',
        orderId: 'ord-seed-01',
        status: OrderStatus.CONFIRMED,
        title: 'Payment & Order Confirmed',
        description: 'Razorpay capture pay_998811 verified. Allocated to Bhiwandi Central DC.',
        createdAt: '2026-09-22T14:32:00.000Z'
      }
    ],
    notes: 'Please ensure white-glove unboxing and screen wall-mounting checklist is signed by client.',
    createdAt: '2026-09-22T14:30:00.000Z',
    updatedAt: '2026-09-22T14:32:00.000Z'
  },
  {
    id: 'ord-seed-02',
    orderNumber: 'DIV-2026-94810',
    userId: 'usr-customer-01',
    customerName: 'Aarav Mehta',
    customerEmail: 'aarav.mehta@example.com',
    customerPhone: '+919820123456',
    status: OrderStatus.SHIPPED,
    paymentStatus: PaymentStatus.SUCCESSFUL,
    paymentMethod: PaymentMethod.RAZORPAY,
    items: [
      {
        id: 'ord-item-02',
        orderId: 'ord-seed-02',
        productId: 'prod-sofa-chesterfield',
        variantId: 'var-sofa-cognac-3',
        productName: 'Divisha Royal Chesterfield 3-Seater Top-Grain Leather Sofa',
        productSlug: 'divisha-royal-chesterfield-top-grain-leather-sofa',
        variantTitle: 'Cognac Brown / 3-Seater (220cm)',
        sku: 'DIV-SOF-COG-3S',
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
        quantity: 1,
        unitPrice: 159000,
        taxAmount: 28620,
        discountAmount: 0,
        totalAmount: 159000
      }
    ],
    shippingAddress: {
      id: 'addr-01',
      userId: 'usr-customer-01',
      name: 'Aarav Mehta',
      phone: '+919820123456',
      addressLine1: 'Penthouse 42, Oberoi Sky City',
      addressLine2: 'Western Express Highway, Borivali East',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400066',
      country: 'India',
      type: 'HOME',
      isDefault: true
    },
    billingAddress: {
      id: 'addr-01',
      userId: 'usr-customer-01',
      name: 'Aarav Mehta',
      phone: '+919820123456',
      addressLine1: 'Penthouse 42, Oberoi Sky City',
      addressLine2: 'Western Express Highway, Borivali East',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400066',
      country: 'India',
      type: 'HOME',
      isDefault: true
    },
    subtotal: 159000,
    discountAmount: 0,
    couponCode: null,
    taxAmount: 28620,
    shippingAmount: 0,
    totalAmount: 159000,
    shipment: {
      id: 'ship-01',
      orderId: 'ord-seed-02',
      carrier: 'BlueDart Express White-Glove',
      trackingNumber: 'BD77441199IN',
      trackingUrl: 'https://www.bluedart.com/tracking?track=BD77441199IN',
      status: ShipmentStatus.IN_TRANSIT,
      shippedAt: '2026-09-21T11:00:00.000Z',
      estimatedDeliveryDate: '2026-09-25T18:00:00.000Z'
    },
    timeline: [
      {
        id: 'tl-02-1',
        orderId: 'ord-seed-02',
        status: OrderStatus.CONFIRMED,
        title: 'Order Confirmed',
        description: 'Payment authorized. Solid teak frame inspected.',
        createdAt: '2026-09-20T09:15:00.000Z'
      },
      {
        id: 'tl-02-2',
        orderId: 'ord-seed-02',
        status: OrderStatus.PACKED,
        title: 'Timber Climate Crating Complete',
        description: 'Sealed in moisture-barrier crate at Jodhpur Master Atelier.',
        createdAt: '2026-09-21T08:30:00.000Z'
      },
      {
        id: 'tl-02-3',
        orderId: 'ord-seed-02',
        status: OrderStatus.SHIPPED,
        title: 'Dispatched via BlueDart White-Glove',
        description: 'AWB BD77441199IN. Air-ride suspension transit to Mumbai Hub.',
        createdAt: '2026-09-21T11:00:00.000Z'
      }
    ],
    notes: 'Premium air-ride furniture transit.',
    createdAt: '2026-09-20T09:15:00.000Z',
    updatedAt: '2026-09-21T11:00:00.000Z'
  },
  {
    id: 'ord-seed-03',
    orderNumber: 'DIV-2026-88301',
    userId: 'usr-customer-02',
    customerName: 'Rhea Singhania',
    customerEmail: 'rhea.singhania@luxuryestates.in',
    customerPhone: '+919811223344',
    status: OrderStatus.PROCESSING,
    paymentStatus: PaymentStatus.SUCCESSFUL,
    paymentMethod: PaymentMethod.NET_BANKING,
    items: [
      {
        id: 'ord-item-03',
        orderId: 'ord-seed-03',
        productId: 'prod-fridge-french',
        variantId: 'var-fr-653',
        productName: 'Samsung 653L French Door Smart Refrigerator with Family Hub™',
        productSlug: 'samsung-653l-french-door-refrigerator-family-hub',
        variantTitle: '653L / Matte Black Steel',
        sku: 'SAM-FR-653L-BLACK',
        imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=400&q=80',
        quantity: 1,
        unitPrice: 198000,
        taxAmount: 35640,
        discountAmount: 5000,
        totalAmount: 193000
      }
    ],
    shippingAddress: {
      id: 'addr-03',
      userId: 'usr-customer-02',
      name: 'Rhea Singhania',
      phone: '+919811223344',
      addressLine1: 'Villa 12, Golf Links',
      addressLine2: 'Near Lodhi Gardens',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110003',
      country: 'India',
      type: 'HOME',
      isDefault: true
    },
    billingAddress: {
      id: 'addr-03',
      userId: 'usr-customer-02',
      name: 'Rhea Singhania',
      phone: '+919811223344',
      addressLine1: 'Villa 12, Golf Links',
      addressLine2: 'Near Lodhi Gardens',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110003',
      country: 'India',
      type: 'HOME',
      isDefault: true
    },
    subtotal: 198000,
    discountAmount: 5000,
    couponCode: 'FESTIVE5000',
    taxAmount: 34740,
    shippingAmount: 0,
    totalAmount: 193000,
    shipment: null,
    timeline: [
      {
        id: 'tl-03-1',
        orderId: 'ord-seed-03',
        status: OrderStatus.CONFIRMED,
        title: 'Order Confirmed',
        description: 'Payment settled via HDFC Corporate NetBanking',
        createdAt: '2026-09-23T10:00:00.000Z'
      },
      {
        id: 'tl-03-2',
        orderId: 'ord-seed-03',
        status: OrderStatus.PROCESSING,
        title: 'Warehouse Allocation',
        description: 'Unit allocated at Delhi NCR Hub. Preparing heavy appliance handling.',
        createdAt: '2026-09-23T10:15:00.000Z'
      }
    ],
    notes: 'Call 1 hour before arrival. Service lift available.',
    createdAt: '2026-09-23T10:00:00.000Z',
    updatedAt: '2026-09-23T10:15:00.000Z'
  },
  {
    id: 'ord-seed-04',
    orderNumber: 'DIV-2026-77219',
    userId: 'usr-customer-03',
    customerName: 'Devendra Parekh',
    customerEmail: 'devendra.parekh@ahmedabadfine.com',
    customerPhone: '+919723456789',
    status: OrderStatus.DELIVERED,
    paymentStatus: PaymentStatus.SUCCESSFUL,
    paymentMethod: PaymentMethod.UPI,
    items: [
      {
        id: 'ord-item-04',
        orderId: 'ord-seed-04',
        productId: 'prod-bed-teak-king',
        variantId: 'var-bed-king',
        productName: 'Divisha Nordica Floating Solid Teak King Bed with Ambient LED',
        productSlug: 'divisha-nordica-solid-teak-king-bed',
        variantTitle: 'King Size (78" x 72") / Natural Teak Finish',
        sku: 'DIV-BED-KNG-78X72',
        imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80',
        quantity: 1,
        unitPrice: 128000,
        taxAmount: 23040,
        discountAmount: 0,
        totalAmount: 128000
      }
    ],
    shippingAddress: {
      id: 'addr-04',
      userId: 'usr-customer-03',
      name: 'Devendra Parekh',
      phone: '+919723456789',
      addressLine1: 'Bungalow 7, Ambli Road',
      addressLine2: 'Bodakdev',
      city: 'Ahmedabad',
      state: 'Gujarat',
      postalCode: '380058',
      country: 'India',
      type: 'HOME',
      isDefault: true
    },
    billingAddress: {
      id: 'addr-04',
      userId: 'usr-customer-03',
      name: 'Devendra Parekh',
      phone: '+919723456789',
      addressLine1: 'Bungalow 7, Ambli Road',
      addressLine2: 'Bodakdev',
      city: 'Ahmedabad',
      state: 'Gujarat',
      postalCode: '380058',
      country: 'India',
      type: 'HOME',
      isDefault: true
    },
    subtotal: 128000,
    discountAmount: 0,
    couponCode: null,
    taxAmount: 23040,
    shippingAmount: 0,
    totalAmount: 128000,
    shipment: {
      id: 'ship-02',
      orderId: 'ord-seed-04',
      carrier: 'BlueDart Express White-Glove',
      trackingNumber: 'BD55332211IN',
      trackingUrl: 'https://www.bluedart.com/tracking?track=BD55332211IN',
      status: ShipmentStatus.DELIVERED,
      shippedAt: '2026-09-18T10:00:00.000Z',
      actualDeliveryDate: '2026-09-21T16:30:00.000Z'
    },
    timeline: [
      {
        id: 'tl-04-1',
        orderId: 'ord-seed-04',
        status: OrderStatus.CONFIRMED,
        title: 'Order Confirmed',
        description: 'UPI transaction verified.',
        createdAt: '2026-09-17T11:00:00.000Z'
      },
      {
        id: 'tl-04-2',
        orderId: 'ord-seed-04',
        status: OrderStatus.PACKED,
        title: 'Packed & Crating Completed',
        description: 'Timber joinery packed with high-density edge protectors.',
        createdAt: '2026-09-18T08:00:00.000Z'
      },
      {
        id: 'tl-04-3',
        orderId: 'ord-seed-04',
        status: OrderStatus.SHIPPED,
        title: 'Dispatched',
        description: 'In transit via BlueDart AWB BD55332211IN.',
        createdAt: '2026-09-18T10:00:00.000Z'
      },
      {
        id: 'tl-04-4',
        orderId: 'ord-seed-04',
        status: OrderStatus.DELIVERED,
        title: 'Delivered & Assembled',
        description: 'White-glove assembly verified by customer. Signature on file.',
        createdAt: '2026-09-21T16:30:00.000Z'
      }
    ],
    notes: 'Assembly team completed LED lighting connection.',
    createdAt: '2026-09-17T11:00:00.000Z',
    updatedAt: '2026-09-21T16:30:00.000Z'
  }
];

export const SEED_PAGES: PageDTO[] = [
  {
    id: 'page-about',
    slug: 'about-us',
    title: 'About Divisha Electronics & Bespoke Living',
    content: `# The Divisha Legacy: Innovation in Harmony with Nature

Founded with an uncompromising pursuit of perfection, **Divisha Electronics** fuses the pinnacle of modern visual & acoustic technology with artisanal handcrafted furniture.

Headquartered in **Indore, Madhya Pradesh** (*Divisha Tower, A.B. Road, Vijay Nagar*), we believe an extraordinary home is a sanctuary where cutting-edge innovation and timeless materials coexist in quiet grandeur.

### Our Triad of Excellence
- **Authorized Flagship Alliances**: Direct tier-1 partnerships with Sony, Samsung, LG, and premium acoustic innovators.
- **Kiln-Dried Seasoned Timber**: All bespoke furniture is sculpted from sustainably harvested, kiln-dried Burma and Nilambur teak with traditional mortise-and-tenon joinery.
- **White-Glove Deployment**: Every installation is handled by master technicians trained to acoustic and structural perfection across India.
`,
    metaTitle: 'About Us | Divisha Electronics & Luxury Living',
    metaDescription: 'Discover Divisha Electronics — where 4K OLED cinematic technology meets artisanal teak craftsmanship, headquartered in Indore, MP.',
    isPublished: true,
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'page-warranty',
    slug: 'warranty',
    title: 'Warranty & Peace of Mind Guarantee',
    content: `# Uncompromised Protection

Every product purchased from Divisha Electronics comes with authoritative, registered manufacturer and artisan warranties backed by our **Indore Executive Service Center**.

### The Divisha Protection Matrix
- **Electronics & Appliances**: 1 to 3 Years comprehensive direct onsite brand warranty with authorized service engineers.
- **Teakwood Furniture**: 10 Years structural framing & timber joinery warranty against warping, splitting, and joinery degradation.
- **Dedicated Customer Support**: Single-point WhatsApp support for claim verification within 24 hours.
`,
    metaTitle: 'Warranty & Protection Guarantee | Divisha Electronics',
    metaDescription: 'Complete warranty terms and peace-of-mind guarantee for Divisha Electronics & Furniture.',
    isPublished: true,
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'page-craftsmanship',
    slug: 'craftsmanship',
    title: 'The Art of Teakwood Craftsmanship',
    content: `# Sculpted for Generations

At Divisha, wood is not merely raw material; it is living history. Our master woodcrafters bring centuries of inherited artisanal joinery traditions to contemporary interior silhouettes.

### Artisanal Standards
- **Seasoned Timber**: 100% Grade-A Burma and Nilambur teak dried to precise 8-12% moisture equilibrium.
- **Mortise & Tenon Joinery**: Pure structural wood-to-wood joinery without reliance on temporary metal fasteners.
- **Hand-Rubbed Organic Finishes**: Low-VOC organic oil and wax hand-rubbed over 14 distinct polishing stages to highlight the timber's golden grain.
- **Semi-Aniline Full Grain Leathers**: Supple, hand-tufted European bovine hides that age gracefully with an authentic patina.
`,
    metaTitle: 'Artisanal Teakwood Craftsmanship | Divisha Signature',
    metaDescription: 'Explore the traditional joinery, kiln-seasoned teak, and hand-rubbed finishes behind Divisha furniture.',
    isPublished: true,
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'page-contact',
    slug: 'contact',
    title: 'Contact Us & Store Location',
    content: `## Customer Support & Store Location

Whether you need assistance choosing an OLED TV, exploring home electronics, or checking order details, our customer support team is here to assist you.

### Indore Head Office & Store
- **Store & Office Address**: Divisha Tower, A.B. Road, Vijay Nagar, Indore, Madhya Pradesh - 452010
- **GSTIN**: 23AABCD1234F1Z5
- **Phone**: +91 98765 43210 / +91 731 4001234
- **WhatsApp Support**: Available 7 days a week (9:00 AM – 9:00 PM IST)
- **Email**: support@divisha.com
`,
    metaTitle: 'Contact Us & Store Location | Divisha Electronics',
    metaDescription: 'Get in touch with Divisha Electronics customer support for orders, product inquiries, and store visits.',
    isPublished: true,
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
];



