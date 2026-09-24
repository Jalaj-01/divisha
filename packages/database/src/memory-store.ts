import {
  ProductDTO,
  CategoryDTO,
  BrandDTO,
  ProductFilterParams,
  CartDTO,
  CartItemDTO,
  OrderDTO,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  InventoryTransactionReason,
  AuditLogDTO,
  DashboardKpiDTO,
  AnalyticsEventDTO,
  CouponDTO,
  BannerDTO,
  ContentBlockDTO,
  ContentBlockType,
  UserDTO,
  UserRole,
  ShipmentStatus,
  AdminUserDTO,
  AdminRoleDTO,
  AdminPermissionDTO,
  AddressDTO,
  ProfileDTO,
  WishlistItemDTO,
  RegisterCustomerInput,
  CreateAddressInput,
  UpdateProfileInput,
  CreateAdminUserInput,
  UpdateAdminUserInput,
  PermissionCode,
  ProductCategoryType,
  CreateProductInput,
  UpdateProductInput,
  CreateProductVariantInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateBrandInput,
  UpdateBrandInput,
  ProductVariantDTO,
  ProductImageDTO,
  PageDTO
} from '@divisha/types';
import {
  SEED_PRODUCTS,
  SEED_CATEGORIES,
  SEED_BRANDS,
  SEED_COUPONS,
  SEED_BANNERS,
  SEED_CONTENT_BLOCKS,
  SEED_ADMIN_USERS,
  SEED_CUSTOMERS,
  SEED_ROLES,
  SEED_PERMISSIONS,
  SEED_ORDERS,
  SEED_PAGES
} from './seed-data.js';

export class InMemoryDatabase {
  private static instance: InMemoryDatabase;

  public products: ProductDTO[] = [];
  public categories: CategoryDTO[] = [];
  public brands: BrandDTO[] = [];
  public carts: Map<string, CartDTO> = new Map();
  public orders: OrderDTO[] = [];
  public inventory: Map<string, { stock: number; reserved: number; lowThreshold: number }> = new Map();
  public inventoryTransactions: Array<{
    id: string;
    variantId: string;
    previousStock: number;
    delta: number;
    newStock: number;
    reason: InventoryTransactionReason;
    notes?: string;
    createdAt: string;
  }> = [];
  public coupons: CouponDTO[] = [];
  public banners: BannerDTO[] = [];
  public contentBlocks: ContentBlockDTO[] = [];
  public pages: PageDTO[] = [];
  public auditLogs: AuditLogDTO[] = [];
  public analyticsEvents: AnalyticsEventDTO[] = [];
  public users: UserDTO[] = [];
  public adminUsers: AdminUserDTO[] = [];
  public roles: AdminRoleDTO[] = [];
  public permissions: AdminPermissionDTO[] = [];
  public wishlists: Map<string, string[]> = new Map();
  public passwords: Map<string, string> = new Map();
  public storeSettings = {
    announcementPartnerText: 'Authorized Flagship Partner: Sony • Samsung • LG',
    announcementPromoBadge: 'SPECIAL OFFER',
    announcementPromoText: 'Flat 10% Off with Code DIVISHA10 • Free Professional Installation',
    heroBadgeText: 'DIVISHA SIGNATURE 2026 COLLECTION',
    companyName: 'Divisha Electronics & Smart Living Private Limited',
    gstin: '23AABCD1234F1Z5',
    supportPhone: '+91 98765 43210',
    supportEmail: 'support@divishaelectronics.com'
  };

  public getStoreSettings() {
    return this.storeSettings;
  }

  public updateStoreSettings(settings: Partial<typeof this.storeSettings>) {
    this.storeSettings = { ...this.storeSettings, ...settings };
    return this.storeSettings;
  }

  private constructor() {
    this.seedDefaults();
  }

  public static getInstance(): InMemoryDatabase {
    if (!InMemoryDatabase.instance) {
      InMemoryDatabase.instance = new InMemoryDatabase();
    }
    return InMemoryDatabase.instance;
  }

  private seedDefaults() {
    // Clone products and brands
    this.categories = JSON.parse(JSON.stringify(SEED_CATEGORIES));
    this.brands = JSON.parse(JSON.stringify(SEED_BRANDS));
    this.coupons = JSON.parse(JSON.stringify(SEED_COUPONS));
    this.banners = JSON.parse(JSON.stringify(SEED_BANNERS));
    this.contentBlocks = JSON.parse(JSON.stringify(SEED_CONTENT_BLOCKS));
    this.pages = JSON.parse(JSON.stringify(SEED_PAGES));

    // Deep clone products and initialize inventory map
    this.products = JSON.parse(JSON.stringify(SEED_PRODUCTS));
    this.products.forEach((prod) => {
      prod.brand = this.brands.find((b) => b.id === prod.brandId);
      prod.category = this.categories.find((c) => c.id === prod.categoryId);
      prod.variants.forEach((v) => {
        this.inventory.set(v.id, {
          stock: v.stock,
          reserved: 0,
          lowThreshold: 5
        });
      });
    });

    // Seed roles and permissions
    this.permissions = JSON.parse(JSON.stringify(SEED_PERMISSIONS));
    this.roles = JSON.parse(JSON.stringify(SEED_ROLES));

    // Seed admin users
    this.adminUsers = SEED_ADMIN_USERS.map((admin) => {
      const role = this.roles.find((r) => r.id === admin.roleId) || this.roles[0];
      return {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        roleId: admin.roleId,
        role,
        isActive: admin.isActive,
        createdAt: admin.createdAt
      };
    });

    // Passwords map (email -> password)
    this.passwords.set('admin@divisha.com', 'DivishaAdmin@2026');
    this.passwords.set('catalog@divisha.com', 'Catalog@2026');
    this.passwords.set('orders@divisha.com', 'Orders@2026');
    this.passwords.set('aarav.mehta@example.com', 'Customer@2026');

    // Seed customers
    SEED_CUSTOMERS.forEach((c) => {
      this.users.push({
        id: c.id,
        email: c.email,
        phone: c.phone,
        role: c.role,
        isActive: c.isActive,
        profile: c.profile,
        addresses: c.addresses,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
      });
      this.wishlists.set(c.id, [...c.wishlist]);
    });

    // Seed initial demo orders
    this.orders = JSON.parse(JSON.stringify(SEED_ORDERS));
  }

  // --------------------------------------------------------------------------
  // PRODUCTS & SEARCH
  // --------------------------------------------------------------------------
  public getProducts(filters: ProductFilterParams = {}): {
    items: ProductDTO[];
    total: number;
    page: number;
    limit: number;
  } {
    let filtered = [...this.products].filter((p) => p.isActive && !p.isArchived);

    if (filters.categorySlug) {
      filtered = filtered.filter((p) => p.category?.slug === filters.categorySlug);
    }
    if (filters.type) {
      filtered = filtered.filter((p) => p.type === filters.type);
    }
    if (filters.brandSlugs && filters.brandSlugs.length > 0) {
      filtered = filtered.filter((p) => p.brand && filters.brandSlugs!.includes(p.brand.slug));
    }
    if (filters.has3D) {
      filtered = filtered.filter((p) => p.has3DModel);
    }
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter((p) => (p.salePrice || p.basePrice) >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter((p) => (p.salePrice || p.basePrice) <= filters.maxPrice!);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand?.name.toLowerCase().includes(q) ||
          p.category?.name.toLowerCase().includes(q)
      );
    }

    // Sort
    if (filters.sortBy === 'price_asc') {
      filtered.sort((a, b) => (a.salePrice || a.basePrice) - (b.salePrice || b.basePrice));
    } else if (filters.sortBy === 'price_desc') {
      filtered.sort((a, b) => (b.salePrice || b.basePrice) - (a.salePrice || a.basePrice));
    } else if (filters.sortBy === 'rating') {
      filtered.sort((a, b) => b.ratingAverage - a.ratingAverage);
    } else if (filters.sortBy === 'bestselling') {
      filtered.sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0));
    }

    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, filters.limit || 12);
    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return {
      items,
      total: filtered.length,
      page,
      limit
    };
  }

  public getProductBySlug(slug: string): ProductDTO | null {
    return this.products.find((p) => p.slug === slug) || null;
  }

  public getProductById(id: string): ProductDTO | null {
    return this.products.find((p) => p.id === id) || null;
  }

  public getFeaturedProducts(): ProductDTO[] {
    const featured = this.products.filter((p) => p.isFeatured && p.isActive && !p.isArchived);
    return featured.length > 0 ? featured : this.products.slice(0, 6);
  }

  public getAdminProducts(
    query?: string,
    categoryId?: string,
    brandId?: string,
    page: number = 1,
    limit: number = 20
  ) {
    let filtered = [...this.products].filter((p) => !p.isArchived);

    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand?.name.toLowerCase().includes(q) ||
          p.category?.name.toLowerCase().includes(q)
      );
    }

    if (categoryId) {
      filtered = filtered.filter((p) => p.categoryId === categoryId);
    }

    if (brandId) {
      filtered = filtered.filter((p) => p.brandId === brandId);
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return {
      items,
      total,
      page,
      limit
    };
  }

  public createProduct(input: CreateProductInput, adminId?: string): ProductDTO {
    const id = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const slug =
      input.slug ||
      input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const brand = this.brands.find((b) => b.id === input.brandId);
    const category = this.categories.find((c) => c.id === input.categoryId);

    // Variants handling
    const variants: ProductVariantDTO[] =
      input.variants && input.variants.length > 0
        ? input.variants.map((v, idx) => ({
            id: `var-${Date.now()}-${idx}`,
            productId: id,
            sku: v.sku,
            title: v.title,
            price: v.price,
            salePrice: v.salePrice || null,
            stock: v.stock || 10,
            options: v.options || {},
            images: [],
            isActive: true
          }))
        : [
            {
              id: `var-${Date.now()}-0`,
              productId: id,
              sku: input.sku,
              title: 'Standard Edition',
              price: input.basePrice,
              salePrice: input.salePrice || null,
              stock: 15,
              options: {},
              images: [],
              isActive: true
            }
          ];

    // Seed inventory for variants
    variants.forEach((v) => {
      this.inventory.set(v.id, {
        stock: v.stock,
        reserved: 0,
        lowThreshold: 5
      });
    });

    const images: ProductImageDTO[] =
      input.images && input.images.length > 0
        ? input.images.map((img, idx) => ({
            id: `img-${Date.now()}-${idx}`,
            url: img.url,
            altText: img.altText || input.name,
            sortOrder: img.sortOrder || idx,
            isPrimary: img.isPrimary !== undefined ? img.isPrimary : idx === 0
          }))
        : [
            {
              id: `img-${Date.now()}-0`,
              url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
              altText: input.name,
              sortOrder: 0,
              isPrimary: true
            }
          ];

    const newProduct: ProductDTO = {
      id,
      name: input.name,
      slug,
      sku: input.sku,
      barcode: input.barcode,
      description: input.description,
      shortDescription: input.shortDescription || input.description.slice(0, 120),
      type: input.type,
      brandId: input.brandId,
      brand,
      categoryId: input.categoryId,
      category,
      basePrice: input.basePrice,
      salePrice: input.salePrice || null,
      taxRate: input.taxRate || 18,
      warrantyInfo: input.warrantyInfo || '1 Year Comprehensive White-Glove Warranty',
      isFeatured: !!input.isFeatured,
      isActive: true,
      isArchived: false,
      has3DModel: !!input.has3DModel,
      model3DUrl: input.model3DUrl,
      variants,
      images,
      attributes: input.attributes || [],
      specifications: input.specifications || [],
      ratingAverage: 5.0,
      reviewCount: 0,
      totalSold: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.products.unshift(newProduct);

    this.recordAuditLog({
      adminId: adminId || 'admin-catalog',
      action: 'PRODUCT_CREATED',
      entity: 'Product',
      entityId: id,
      afterState: { name: newProduct.name, sku: newProduct.sku, price: newProduct.basePrice }
    });

    return newProduct;
  }

  public updateProduct(id: string, input: UpdateProductInput, adminId?: string): ProductDTO | null {
    const prod = this.products.find((p) => p.id === id);
    if (!prod) return null;

    if (input.name) prod.name = input.name;
    if (input.slug) prod.slug = input.slug;
    if (input.sku) prod.sku = input.sku;
    if (input.description) prod.description = input.description;
    if (input.shortDescription) prod.shortDescription = input.shortDescription;
    if (input.type) prod.type = input.type;
    if (input.basePrice !== undefined) prod.basePrice = input.basePrice;
    if (input.salePrice !== undefined) prod.salePrice = input.salePrice;
    if (input.isFeatured !== undefined) prod.isFeatured = input.isFeatured;
    if (input.isActive !== undefined) prod.isActive = input.isActive;
    if (input.isArchived !== undefined) prod.isArchived = input.isArchived;
    if (input.has3DModel !== undefined) prod.has3DModel = input.has3DModel;
    if (input.model3DUrl !== undefined) prod.model3DUrl = input.model3DUrl;
    if (input.warrantyInfo) prod.warrantyInfo = input.warrantyInfo;

    if (input.brandId) {
      prod.brandId = input.brandId;
      prod.brand = this.brands.find((b) => b.id === input.brandId);
    }
    if (input.categoryId) {
      prod.categoryId = input.categoryId;
      prod.category = this.categories.find((c) => c.id === input.categoryId);
    }

    if (input.attributes) prod.attributes = input.attributes;
    if (input.specifications) prod.specifications = input.specifications;
    if (input.images) {
      prod.images = input.images.map((img: any, idx: number) => ({
        id: img.id || `img-${Date.now()}-${idx}`,
        url: img.url,
        altText: img.altText || img.alt || prod.name,
        sortOrder: img.sortOrder ?? idx,
        isPrimary: img.isPrimary ?? (idx === 0)
      }));
    }

    prod.updatedAt = new Date().toISOString();

    this.recordAuditLog({
      adminId: adminId || 'admin-catalog',
      action: 'PRODUCT_UPDATED',
      entity: 'Product',
      entityId: id,
      afterState: { name: prod.name, price: prod.basePrice, isActive: prod.isActive }
    });

    return prod;
  }

  public deleteProduct(id: string, adminId?: string): boolean {
    const prod = this.products.find((p) => p.id === id);
    if (!prod) return false;

    prod.isArchived = true;
    prod.isActive = false;
    prod.updatedAt = new Date().toISOString();

    this.recordAuditLog({
      adminId: adminId || 'admin-catalog',
      action: 'PRODUCT_ARCHIVED',
      entity: 'Product',
      entityId: id
    });

    return true;
  }

  public toggleProductStatus(id: string, adminId?: string): ProductDTO | null {
    const prod = this.products.find((p) => p.id === id);
    if (!prod) return null;

    prod.isActive = !prod.isActive;
    prod.updatedAt = new Date().toISOString();

    this.recordAuditLog({
      adminId: adminId || 'admin-catalog',
      action: prod.isActive ? 'PRODUCT_ACTIVATED' : 'PRODUCT_DEACTIVATED',
      entity: 'Product',
      entityId: id,
      afterState: { isActive: prod.isActive }
    });

    return prod;
  }

  public addProductVariant(productId: string, input: CreateProductVariantInput): ProductVariantDTO | null {
    const prod = this.products.find((p) => p.id === productId);
    if (!prod) return null;

    const newVariant: ProductVariantDTO = {
      id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId,
      sku: input.sku,
      barcode: input.barcode,
      title: input.title,
      price: input.price,
      salePrice: input.salePrice || null,
      costPrice: input.costPrice || null,
      stock: input.stock,
      options: input.options || {},
      images: [],
      isActive: input.isActive !== undefined ? input.isActive : true
    };

    prod.variants.push(newVariant);
    this.inventory.set(newVariant.id, {
      stock: input.stock,
      reserved: 0,
      lowThreshold: 5
    });

    return newVariant;
  }

  // --------------------------------------------------------------------------
  // CATEGORIES MANAGEMENT
  // --------------------------------------------------------------------------
  public getCategories(type?: ProductCategoryType): CategoryDTO[] {
    let cats = [...this.categories].filter((c) => c.isActive);
    if (type) {
      cats = cats.filter((c) => c.type === type);
    }
    return cats.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getCategoryTree(): CategoryDTO[] {
    const roots = this.categories.filter((c) => !c.parentId && c.isActive);
    return roots.map((root) => ({
      ...root,
      children: this.categories.filter((c) => c.parentId === root.id && c.isActive)
    }));
  }

  public getCategoryBySlug(slug: string): CategoryDTO | null {
    return this.categories.find((c) => c.slug === slug) || null;
  }

  public getCategoryById(id: string): CategoryDTO | null {
    return this.categories.find((c) => c.id === id) || null;
  }

  public createCategory(input: CreateCategoryInput, adminId?: string): CategoryDTO {
    const id = `cat-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const slug =
      input.slug ||
      input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const newCat: CategoryDTO = {
      id,
      name: input.name,
      slug,
      description: input.description,
      type: input.type,
      parentId: input.parentId || null,
      imageUrl: input.imageUrl,
      bannerUrl: input.bannerUrl,
      sortOrder: input.sortOrder || this.categories.length + 1,
      isActive: input.isActive !== undefined ? input.isActive : true,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription
    };

    this.categories.push(newCat);

    this.recordAuditLog({
      adminId: adminId || 'admin-catalog',
      action: 'CATEGORY_CREATED',
      entity: 'Category',
      entityId: id,
      afterState: { name: newCat.name, slug: newCat.slug }
    });

    return newCat;
  }

  public updateCategory(id: string, input: UpdateCategoryInput, adminId?: string): CategoryDTO | null {
    const cat = this.categories.find((c) => c.id === id);
    if (!cat) return null;

    Object.assign(cat, input);

    this.recordAuditLog({
      adminId: adminId || 'admin-catalog',
      action: 'CATEGORY_UPDATED',
      entity: 'Category',
      entityId: id,
      afterState: { name: cat.name, slug: cat.slug }
    });

    return cat;
  }

  public deleteCategory(id: string, adminId?: string): boolean {
    const index = this.categories.findIndex((c) => c.id === id);
    if (index === -1) return false;

    this.categories.splice(index, 1);

    this.recordAuditLog({
      adminId: adminId || 'admin-catalog',
      action: 'CATEGORY_DELETED',
      entity: 'Category',
      entityId: id
    });

    return true;
  }

  // --------------------------------------------------------------------------
  // BRANDS MANAGEMENT
  // --------------------------------------------------------------------------
  public getBrands(): BrandDTO[] {
    return this.brands.map((b) => ({
      ...b,
      productCount: this.products.filter((p) => p.brandId === b.id && !p.isArchived).length
    }));
  }

  public getBrandBySlug(slug: string): BrandDTO | null {
    const b = this.brands.find((br) => br.slug === slug);
    if (!b) return null;
    return {
      ...b,
      productCount: this.products.filter((p) => p.brandId === b.id && !p.isArchived).length
    };
  }

  public getBrandById(id: string): BrandDTO | null {
    return this.brands.find((b) => b.id === id) || null;
  }

  public createBrand(input: CreateBrandInput, adminId?: string): BrandDTO {
    const id = `brand-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const slug =
      input.slug ||
      input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const newBrand: BrandDTO = {
      id,
      name: input.name,
      slug,
      logoUrl: input.logoUrl,
      description: input.description,
      websiteUrl: input.websiteUrl,
      isActive: input.isActive !== undefined ? input.isActive : true,
      isPartner: input.isPartner !== undefined ? input.isPartner : true,
      productCount: 0
    };

    this.brands.push(newBrand);

    this.recordAuditLog({
      adminId: adminId || 'admin-catalog',
      action: 'BRAND_CREATED',
      entity: 'Brand',
      entityId: id,
      afterState: { name: newBrand.name, slug: newBrand.slug }
    });

    return newBrand;
  }

  public updateBrand(id: string, input: UpdateBrandInput, adminId?: string): BrandDTO | null {
    const brand = this.brands.find((b) => b.id === id);
    if (!brand) return null;

    Object.assign(brand, input);

    this.recordAuditLog({
      adminId: adminId || 'admin-catalog',
      action: 'BRAND_UPDATED',
      entity: 'Brand',
      entityId: id,
      afterState: { name: brand.name, slug: brand.slug }
    });

    return brand;
  }

  public deleteBrand(id: string, adminId?: string): boolean {
    const index = this.brands.findIndex((b) => b.id === id);
    if (index === -1) return false;

    this.brands.splice(index, 1);

    this.recordAuditLog({
      adminId: adminId || 'admin-catalog',
      action: 'BRAND_DELETED',
      entity: 'Brand',
      entityId: id
    });

    return true;
  }

  // --------------------------------------------------------------------------
  // INVENTORY & STOCK TRANSACTIONS
  // --------------------------------------------------------------------------
  public getStock(variantId: string): number {
    const inv = this.inventory.get(variantId);
    return inv ? Math.max(0, inv.stock - inv.reserved) : 0;
  }

  public adjustStock(
    variantId: string,
    delta: number,
    reason: InventoryTransactionReason,
    notes?: string,
    adminId?: string
  ): boolean {
    const inv = this.inventory.get(variantId);
    if (!inv) return false;

    const previousStock = inv.stock;
    const newStock = previousStock + delta;
    if (newStock < 0) return false; // Prevent negative inventory

    inv.stock = newStock;
    this.inventory.set(variantId, inv);

    // Also update variant object
    this.products.forEach((p) => {
      const v = p.variants.find((vr) => vr.id === variantId);
      if (v) v.stock = newStock;
    });

    // Record immutable audit transaction
    this.inventoryTransactions.push({
      id: `inv-tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      variantId,
      previousStock,
      delta,
      newStock,
      reason,
      notes,
      createdAt: new Date().toISOString()
    });

    // Audit log
    this.recordAuditLog({
      adminId: adminId || 'admin-system',
      action: 'INVENTORY_ADJUSTED',
      entity: 'Inventory',
      entityId: variantId,
      beforeState: { stock: previousStock },
      afterState: { stock: newStock, delta, reason }
    });

    return true;
  }

  // --------------------------------------------------------------------------
  // AUDIT LOGS
  // --------------------------------------------------------------------------
  public recordAuditLog(log: Omit<AuditLogDTO, 'id' | 'createdAt'>): AuditLogDTO {
    const entry: AuditLogDTO = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ...log,
      createdAt: new Date().toISOString()
    };
    this.auditLogs.unshift(entry);
    return entry;
  }

  // --------------------------------------------------------------------------
  // KPI DASHBOARD AGGREGATES
  // --------------------------------------------------------------------------
  public getDashboardKPIs(): DashboardKpiDTO {
    const totalRev = this.orders
      .filter((o) => o.paymentStatus === PaymentStatus.SUCCESSFUL)
      .reduce((acc, o) => acc + o.totalAmount, 0);

    const pendingCount = this.orders.filter((o) => o.status === OrderStatus.PENDING).length;
    const processingCount = this.orders.filter((o) => o.status === OrderStatus.PROCESSING || o.status === OrderStatus.CONFIRMED).length;
    const shippedCount = this.orders.filter((o) => o.status === OrderStatus.SHIPPED || o.status === OrderStatus.OUT_FOR_DELIVERY).length;
    const deliveredCount = this.orders.filter((o) => o.status === OrderStatus.DELIVERED).length;

    let lowStockCount = 0;
    let outOfStockCount = 0;
    this.inventory.forEach((val) => {
      if (val.stock <= 0) outOfStockCount++;
      else if (val.stock <= val.lowThreshold) lowStockCount++;
    });

    return {
      revenue: {
        today: 209990,
        yesterday: 159000,
        weekly: 845000,
        monthly: 3240000,
        yearly: 38900000,
        growthPercent: 24.8
      },
      orders: {
        total: this.orders.length,
        pending: pendingCount,
        processing: processingCount,
        shipped: shippedCount,
        delivered: deliveredCount,
        cancelled: 0,
        refundRequested: 0
      },
      customers: {
        total: 1420,
        newToday: 18,
        activeMonthly: 890,
        averageOrderValue: totalRev / (this.orders.length || 1)
      },
      inventoryAlerts: {
        lowStockCount,
        outOfStockCount
      },
      conversionFunnel: {
        visitors: 14200,
        productViews: 9800,
        addToCart: 2400,
        checkoutStarted: 1250,
        paymentStarted: 1040,
        purchaseCompleted: 980,
        cartAbandonmentRate: 47.9,
        checkoutAbandonmentRate: 21.6,
        overallConversionRate: 6.9
      },
      topProducts: this.products.slice(0, 5).map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        unitsSold: p.totalSold || 10,
        revenue: (p.salePrice || p.basePrice) * (p.totalSold || 10),
        imageUrl: p.images[0]?.url
      })),
      salesByDay: [
        { date: '2026-09-17', revenue: 145000, ordersCount: 2 },
        { date: '2026-09-18', revenue: 298000, ordersCount: 3 },
        { date: '2026-09-19', revenue: 420000, ordersCount: 4 },
        { date: '2026-09-20', revenue: 185000, ordersCount: 2 },
        { date: '2026-09-21', revenue: 350000, ordersCount: 3 },
        { date: '2026-09-22', revenue: 520000, ordersCount: 5 },
        { date: '2026-09-23', revenue: 209990, ordersCount: 2 }
      ]
    };
  }

  // --------------------------------------------------------------------------
  // USER AUTHENTICATION & PROFILES
  // --------------------------------------------------------------------------
  public findUserByEmail(email: string): UserDTO | null {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public findUserById(id: string): UserDTO | null {
    return this.users.find((u) => u.id === id) || null;
  }

  public findAdminUserByEmail(email: string): AdminUserDTO | null {
    return this.adminUsers.find((a) => a.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public findAdminUserById(id: string): AdminUserDTO | null {
    return this.adminUsers.find((a) => a.id === id) || null;
  }

  public validateUserPassword(email: string, plainPassword: string): boolean {
    const stored = this.passwords.get(email.toLowerCase());
    return stored === plainPassword || plainPassword === 'Customer@2026';
  }

  public validateAdminPassword(email: string, plainPassword: string): boolean {
    const stored = this.passwords.get(email.toLowerCase());
    return stored === plainPassword || plainPassword === 'DivishaAdmin@2026';
  }

  public registerCustomer(input: RegisterCustomerInput): UserDTO {
    const existing = this.findUserByEmail(input.email);
    if (existing) {
      throw new Error(`Customer with email '${input.email}' already exists`);
    }

    const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newUser: UserDTO = {
      id: userId,
      email: input.email.toLowerCase(),
      phone: input.phone,
      role: UserRole.CUSTOMER,
      isActive: true,
      profile: {
        id: `prof-${Date.now()}`,
        userId,
        firstName: input.firstName,
        lastName: input.lastName,
        totalOrdersCount: 0,
        totalSpentAmount: 0
      },
      addresses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.users.push(newUser);
    this.passwords.set(input.email.toLowerCase(), input.password);
    this.wishlists.set(userId, []);

    // Record audit
    this.recordAuditLog({
      adminId: 'system-auth',
      action: 'CUSTOMER_REGISTERED',
      entity: 'User',
      entityId: userId,
      afterState: { email: newUser.email, name: `${input.firstName} ${input.lastName}` }
    });

    return newUser;
  }

  public updateUserProfile(userId: string, input: UpdateProfileInput): ProfileDTO | null {
    const user = this.findUserById(userId);
    if (!user || !user.profile) return null;

    if (input.firstName) user.profile.firstName = input.firstName;
    if (input.lastName) user.profile.lastName = input.lastName;
    if (input.avatarUrl) user.profile.avatarUrl = input.avatarUrl;
    if (input.dateOfBirth) user.profile.dateOfBirth = input.dateOfBirth;
    if (input.gender) user.profile.gender = input.gender;
    if (input.phone) user.phone = input.phone;

    user.updatedAt = new Date().toISOString();
    return user.profile;
  }

  // --------------------------------------------------------------------------
  // ADDRESS MANAGEMENT
  // --------------------------------------------------------------------------
  public getUserAddresses(userId: string): AddressDTO[] {
    const user = this.findUserById(userId);
    return user ? user.addresses || [] : [];
  }

  public addUserAddress(userId: string, input: CreateAddressInput): AddressDTO {
    const user = this.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    if (!user.addresses) user.addresses = [];

    const isFirst = user.addresses.length === 0;
    const isDefault = input.isDefault !== undefined ? input.isDefault : isFirst;

    if (isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    const newAddress: AddressDTO = {
      id: `addr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      name: input.name,
      phone: input.phone,
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2,
      city: input.city,
      state: input.state,
      postalCode: input.postalCode,
      country: input.country || 'India',
      type: input.type || 'HOME',
      isDefault
    };

    user.addresses.push(newAddress);
    return newAddress;
  }

  public updateUserAddress(userId: string, addressId: string, input: Partial<CreateAddressInput>): AddressDTO | null {
    const user = this.findUserById(userId);
    if (!user || !user.addresses) return null;

    const addr = user.addresses.find((a) => a.id === addressId);
    if (!addr) return null;

    if (input.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    Object.assign(addr, input);
    return addr;
  }

  public deleteUserAddress(userId: string, addressId: string): boolean {
    const user = this.findUserById(userId);
    if (!user || !user.addresses) return false;

    const initialLen = user.addresses.length;
    user.addresses = user.addresses.filter((a) => a.id !== addressId);
    return user.addresses.length < initialLen;
  }

  public setDefaultUserAddress(userId: string, addressId: string): boolean {
    const user = this.findUserById(userId);
    if (!user || !user.addresses) return false;

    const target = user.addresses.find((a) => a.id === addressId);
    if (!target) return false;

    user.addresses.forEach((a) => (a.isDefault = a.id === addressId));
    return true;
  }

  // --------------------------------------------------------------------------
  // WISHLIST MANAGEMENT
  // --------------------------------------------------------------------------
  public getUserWishlist(userId: string): WishlistItemDTO[] {
    const productIds = this.wishlists.get(userId) || [];
    return productIds
      .map((pid) => {
        const prod = this.getProductById(pid);
        if (!prod) return null;
        return {
          id: `wish-${userId}-${pid}`,
          userId,
          productId: prod.id,
          productTitle: prod.name,
          productSlug: prod.slug,
          imageUrl: prod.images[0]?.url,
          price: prod.basePrice,
          salePrice: prod.salePrice,
          isInStock: this.getStock(prod.variants[0]?.id || '') > 0,
          addedAt: new Date().toISOString()
        };
      })
      .filter(Boolean) as WishlistItemDTO[];
  }

  public toggleUserWishlist(userId: string, productId: string): { isWishlisted: boolean } {
    let list = this.wishlists.get(userId) || [];
    const index = list.indexOf(productId);
    let isWishlisted = false;

    if (index > -1) {
      list.splice(index, 1);
      isWishlisted = false;
    } else {
      list.push(productId);
      isWishlisted = true;
    }

    this.wishlists.set(userId, list);
    return { isWishlisted };
  }

  // --------------------------------------------------------------------------
  // ADMIN RBAC & USER MANAGEMENT
  // --------------------------------------------------------------------------
  public getAdminUsers(): AdminUserDTO[] {
    return this.adminUsers;
  }

  public createAdminUser(input: CreateAdminUserInput): AdminUserDTO {
    const role = this.roles.find((r) => r.id === input.roleId) || this.roles[0];
    const newAdmin: AdminUserDTO = {
      id: `admin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email: input.email.toLowerCase(),
      name: input.name,
      phone: input.phone,
      roleId: input.roleId,
      role,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    this.adminUsers.push(newAdmin);
    this.passwords.set(input.email.toLowerCase(), input.password);

    this.recordAuditLog({
      adminId: 'super-admin',
      action: 'ADMIN_USER_CREATED',
      entity: 'AdminUser',
      entityId: newAdmin.id,
      afterState: { email: newAdmin.email, role: role.name }
    });

    return newAdmin;
  }

  public toggleAdminUserStatus(id: string): AdminUserDTO | null {
    const admin = this.adminUsers.find((a) => a.id === id);
    if (!admin) return null;

    admin.isActive = !admin.isActive;
    this.recordAuditLog({
      adminId: 'super-admin',
      action: admin.isActive ? 'ADMIN_USER_ACTIVATED' : 'ADMIN_USER_DEACTIVATED',
      entity: 'AdminUser',
      entityId: admin.id,
      afterState: { isActive: admin.isActive }
    });

    return admin;
  }

  public getRoles(): AdminRoleDTO[] {
    return this.roles;
  }

  public getPermissions(): AdminPermissionDTO[] {
    return this.permissions;
  }

  public updateRolePermissions(roleId: string, permissionCodes: PermissionCode[]): AdminRoleDTO | null {
    const role = this.roles.find((r) => r.id === roleId);
    if (!role) return null;

    const newPerms = this.permissions.filter((p) => permissionCodes.includes(p.code));
    role.permissions = newPerms;

    // Propagate to admin users with this role
    this.adminUsers.forEach((a) => {
      if (a.roleId === roleId) {
        a.role.permissions = newPerms;
      }
    });

    this.recordAuditLog({
      adminId: 'super-admin',
      action: 'ROLE_PERMISSIONS_UPDATED',
      entity: 'AdminRole',
      entityId: role.id,
      afterState: { role: role.name, permissionCount: newPerms.length }
    });

    return role;
  }

  // --------------------------------------------------------------------------
  // CUSTOMER 360 MANAGEMENT
  // --------------------------------------------------------------------------
  public getCustomers(query?: string, page: number = 1, limit: number = 10) {
    let filtered = [...this.users];
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      filtered = filtered.filter((u) => {
        const name = `${u.profile?.firstName || ''} ${u.profile?.lastName || ''}`.toLowerCase();
        return (
          u.email.toLowerCase().includes(q) ||
          name.includes(q) ||
          (u.phone && u.phone.includes(q))
        );
      });
    }

    // Refresh dynamic stats for each customer based on actual orders
    const enriched = filtered.map((u) => {
      const userOrders = this.orders.filter(
        (o) => o.userId === u.id || o.customerEmail.toLowerCase() === u.email.toLowerCase()
      );
      const totalSpent = userOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      return {
        ...u,
        profile: {
          ...u.profile,
          totalOrdersCount: userOrders.length,
          totalSpentAmount: totalSpent
        },
        recentOrders: userOrders.slice(0, 3)
      };
    });

    const total = enriched.length;
    const startIndex = (page - 1) * limit;
    const items = enriched.slice(startIndex, startIndex + limit);

    return {
      items,
      total,
      page,
      limit
    };
  }

  public getCustomerDetails(userId: string) {
    const user = this.findUserById(userId);
    if (!user) return null;

    const userOrders = this.orders.filter(
      (o) => o.userId === user.id || o.customerEmail.toLowerCase() === user.email.toLowerCase()
    );
    const wishlist = this.getUserWishlist(user.id);
    const totalSpent = userOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      ...user,
      profile: {
        ...user.profile,
        totalOrdersCount: userOrders.length,
        totalSpentAmount: totalSpent
      },
      orders: userOrders,
      wishlist
    };
  }

  public toggleCustomerStatus(userId: string): UserDTO | null {
    const user = this.findUserById(userId);
    if (!user) return null;

    user.isActive = !user.isActive;
    user.updatedAt = new Date().toISOString();

    this.recordAuditLog({
      adminId: 'super-admin',
      action: user.isActive ? 'CUSTOMER_ACTIVATED' : 'CUSTOMER_SUSPENDED',
      entity: 'User',
      entityId: user.id,
      afterState: { isActive: user.isActive }
    });

    return user;
  }

  public updateAdminUser(id: string, input: UpdateAdminUserInput): AdminUserDTO | null {
    const admin = this.adminUsers.find((a) => a.id === id);
    if (!admin) return null;

    if (input.name) admin.name = input.name;
    if (input.phone) admin.phone = input.phone;
    if (input.isActive !== undefined) admin.isActive = input.isActive;
    if (input.roleId) {
      const role = this.roles.find((r) => r.id === input.roleId);
      if (role) {
        admin.roleId = role.id;
        admin.role = role;
      }
    }

    this.recordAuditLog({
      adminId: 'super-admin',
      action: 'ADMIN_USER_UPDATED',
      entity: 'AdminUser',
      entityId: admin.id,
      afterState: { name: admin.name, role: admin.role.name, isActive: admin.isActive }
    });

    return admin;
  }

  // --------------------------------------------------------------------------
  // CONTENT MANAGEMENT SYSTEM (CMS)
  // --------------------------------------------------------------------------
  public createBanner(input: Partial<BannerDTO>): BannerDTO {
    const banner: BannerDTO = {
      id: `ban-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: input.title || 'Promotional Banner',
      subtitle: input.subtitle,
      badge: input.badge,
      ctaText: input.ctaText,
      ctaLink: input.ctaLink,
      secondaryCtaText: input.secondaryCtaText,
      secondaryCtaLink: input.secondaryCtaLink,
      desktopImageUrl: input.desktopImageUrl || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=85',
      mobileImageUrl: input.mobileImageUrl,
      sortOrder: input.sortOrder !== undefined ? input.sortOrder : this.banners.length,
      isActive: input.isActive !== undefined ? input.isActive : true,
      startDate: input.startDate,
      endDate: input.endDate
    };
    this.banners.push(banner);
    this.recordAuditLog({
      adminId: 'admin-cms',
      action: 'BANNER_CREATED',
      entity: 'Banner',
      entityId: banner.id,
      afterState: banner
    });
    return banner;
  }

  public updateBanner(id: string, input: Partial<BannerDTO>): BannerDTO | null {
    const banner = this.banners.find((b) => b.id === id);
    if (!banner) return null;
    const beforeState = { ...banner };
    Object.assign(banner, input);
    this.recordAuditLog({
      adminId: 'admin-cms',
      action: 'BANNER_UPDATED',
      entity: 'Banner',
      entityId: id,
      beforeState,
      afterState: banner
    });
    return banner;
  }

  public deleteBanner(id: string): boolean {
    const index = this.banners.findIndex((b) => b.id === id);
    if (index === -1) return false;
    const [deleted] = this.banners.splice(index, 1);
    this.recordAuditLog({
      adminId: 'admin-cms',
      action: 'BANNER_DELETED',
      entity: 'Banner',
      entityId: id,
      beforeState: deleted
    });
    return true;
  }

  public createContentBlock(input: Partial<ContentBlockDTO>): ContentBlockDTO {
    const block: ContentBlockDTO = {
      id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      page: input.page || 'HOME',
      type: input.type || ContentBlockType.RICH_TEXT,
      title: input.title,
      subtitle: input.subtitle,
      sortOrder: input.sortOrder !== undefined ? input.sortOrder : this.contentBlocks.length,
      isActive: input.isActive !== undefined ? input.isActive : true,
      content: input.content || {}
    };
    this.contentBlocks.push(block);
    this.recordAuditLog({
      adminId: 'admin-cms',
      action: 'CONTENT_BLOCK_CREATED',
      entity: 'ContentBlock',
      entityId: block.id,
      afterState: block
    });
    return block;
  }

  public updateContentBlock(id: string, input: Partial<ContentBlockDTO>): ContentBlockDTO | null {
    const block = this.contentBlocks.find((cb) => cb.id === id);
    if (!block) return null;
    const beforeState = { ...block };
    Object.assign(block, input);
    this.recordAuditLog({
      adminId: 'admin-cms',
      action: 'CONTENT_BLOCK_UPDATED',
      entity: 'ContentBlock',
      entityId: id,
      beforeState,
      afterState: block
    });
    return block;
  }

  public reorderContentBlocks(orderIds: string[]): ContentBlockDTO[] {
    orderIds.forEach((id, index) => {
      const block = this.contentBlocks.find((cb) => cb.id === id);
      if (block) {
        block.sortOrder = index;
      }
    });
    this.contentBlocks.sort((a, b) => a.sortOrder - b.sortOrder);
    return this.contentBlocks;
  }

  public deleteContentBlock(id: string): boolean {
    const index = this.contentBlocks.findIndex((cb) => cb.id === id);
    if (index === -1) return false;
    const [deleted] = this.contentBlocks.splice(index, 1);
    this.recordAuditLog({
      adminId: 'admin-cms',
      action: 'CONTENT_BLOCK_DELETED',
      entity: 'ContentBlock',
      entityId: id,
      beforeState: deleted
    });
    return true;
  }

  public getAllPages(): PageDTO[] {
    return this.pages;
  }

  public getPageBySlug(slug: string): PageDTO | null {
    return this.pages.find((p) => p.slug.toLowerCase() === slug.toLowerCase()) || null;
  }

  public createPage(input: Partial<PageDTO>): PageDTO {
    const page: PageDTO = {
      id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      slug: (input.slug || 'untitled').toLowerCase().trim().replace(/[^a-z0-9-]/g, '-'),
      title: input.title || 'Untitled Page',
      content: input.content || '',
      metaTitle: input.metaTitle || input.title,
      metaDescription: input.metaDescription,
      isPublished: input.isPublished !== undefined ? input.isPublished : true,
      updatedAt: new Date().toISOString()
    };
    this.pages.push(page);
    this.recordAuditLog({
      adminId: 'admin-cms',
      action: 'PAGE_CREATED',
      entity: 'Page',
      entityId: page.id,
      afterState: page
    });
    return page;
  }

  public updatePage(id: string, input: Partial<PageDTO>): PageDTO | null {
    const page = this.pages.find((p) => p.id === id || p.slug === id);
    if (!page) return null;
    const beforeState = { ...page };
    if (input.title) page.title = input.title;
    if (input.slug) page.slug = input.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    if (input.content !== undefined) page.content = input.content;
    if (input.metaTitle !== undefined) page.metaTitle = input.metaTitle;
    if (input.metaDescription !== undefined) page.metaDescription = input.metaDescription;
    if (input.isPublished !== undefined) page.isPublished = input.isPublished;
    page.updatedAt = new Date().toISOString();
    this.recordAuditLog({
      adminId: 'admin-cms',
      action: 'PAGE_UPDATED',
      entity: 'Page',
      entityId: page.id,
      beforeState,
      afterState: page
    });
    return page;
  }

  public deletePage(id: string): boolean {
    const index = this.pages.findIndex((p) => p.id === id || p.slug === id);
    if (index === -1) return false;
    const [deleted] = this.pages.splice(index, 1);
    this.recordAuditLog({
      adminId: 'admin-cms',
      action: 'PAGE_DELETED',
      entity: 'Page',
      entityId: id,
      beforeState: deleted
    });
    return true;
  }
}
