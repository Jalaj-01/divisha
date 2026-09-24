import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false })
  );

  // Enable CORS for Storefront & Admin Portal
  await app.register(require('@fastify/cors'), {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  });

  // Global pipes & filters
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false
    })
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Setup OpenAPI / Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Divisha Electronics — Core API Gateway')
    .setDescription(
      'Production-grade REST API powering Customer Storefront, Mobile App, and 42-section Admin Operations Portal for high-end electronics and bespoke furniture.'
    )
    .setVersion('1.0.0')
    .addTag('Products & Catalog', 'Faceted search, categories, brands, specifications, and 3D assets')
    .addTag('Shopping Cart', 'Authoritative server-side price calculation and stock validation')
    .addTag('Checkout & Order Processing', 'Atomic multi-step checkout with stock locks')
    .addTag('Payments & Gateways', 'Razorpay integration with cryptographic signature verification and webhooks')
    .addTag('Inventory Management', 'Authoritative stock levels and mandatory reason audit trails')
    .addTag('WhatsApp Concierge, Chat & Calling', 'Multi-department concierge, direct calling, and automated alerts')
    .addTag('Admin Operations & RBAC', 'Executive dashboard, KPI aggregates, audit trails, and global search')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Divisha Electronics API Docs'
  });

  const port = process.env.PORT || process.env.API_PORT || 4000;
  await app.listen(port, '0.0.0.0');

  console.log(`=======================================================`);
  console.log(`🚀 DIVISHA ELECTRONICS API GATEWAY RUNNING ON PORT ${port}`);
  console.log(`📖 OPENAPI DOCS AVAILABLE AT: http://localhost:${port}/api/docs`);
  console.log(`❤️  HEALTH CHECK: http://localhost:${port}/health`);
  console.log(`=======================================================`);
}

bootstrap().catch((err) => {
  console.error('Fatal error starting Divisha API Gateway:', err);
  process.exit(1);
});
