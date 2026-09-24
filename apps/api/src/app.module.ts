import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { HealthModule } from './modules/health/health.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { ProductsModule } from './modules/products/products.module.js';
import { CategoriesModule } from './modules/categories/categories.module.js';
import { BrandsModule } from './modules/brands/brands.module.js';
import { CartModule } from './modules/cart/cart.module.js';
import { CheckoutModule } from './modules/checkout/checkout.module.js';
import { PaymentsModule } from './modules/payments/payments.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { InventoryModule } from './modules/inventory/inventory.module.js';
import { CmsModule } from './modules/cms/cms.module.js';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module.js';
import { AnalyticsModule } from './modules/analytics/analytics.module.js';
import { AdminModule } from './modules/admin/admin.module.js';

@Module({
  imports: [
    HealthModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    BrandsModule,
    CartModule,
    CheckoutModule,
    PaymentsModule,
    OrdersModule,
    InventoryModule,
    CmsModule,
    WhatsAppModule,
    AnalyticsModule,
    AdminModule
  ],
  controllers: [AppController]
})
export class AppModule {}

