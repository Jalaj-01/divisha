import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('API Gateway Root')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'API Gateway overview and portal navigation' })
  getRoot() {
    return {
      service: 'Divisha Electronics & Bespoke Living — Core API Gateway',
      company: 'Divisha Electronics & Bespoke Living Private Limited',
      headquarters: 'Indore, Madhya Pradesh - 452010',
      gstin: '23AABCD1234F1Z5',
      status: 'operational',
      environment: process.env.NODE_ENV || 'development',
      portals: {
        storefront: 'http://localhost:3000',
        adminPortal: 'http://localhost:3001',
        swaggerDocs: 'http://localhost:4000/api/docs',
        healthCheck: 'http://localhost:4000/health'
      },
      endpoints: {
        products: '/v1/products',
        cart: '/v1/cart',
        checkout: '/v1/checkout',
        orders: '/v1/orders',
        inventory: '/v1/inventory',
        cms: '/v1/cms',
        whatsapp: '/v1/whatsapp',
        analytics: '/v1/analytics',
        admin: '/v1/admin'
      },
      timestamp: new Date().toISOString()
    };
  }
}
