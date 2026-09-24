import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('System & Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Check API and system health status' })
  checkHealth() {
    return {
      status: 'healthy',
      service: 'Divisha Electronics High-Throughput REST Gateway',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }

  @Get('version')
  @ApiOperation({ summary: 'Get current API version and platform capabilities' })
  getVersion() {
    return {
      version: '1.0.0',
      apiPrefix: '/api/v1',
      supportedFeatures: [
        'PostgreSQL-Relational-Schema',
        'Redis-Caching-Queue-Abstraction',
        'Razorpay-Idempotent-Payments',
        'Authoritative-Server-Inventory',
        'WhatsApp-Concierge-Calling',
        'React-Three-Fiber-3D-Models',
        'Admin-Audit-Logging'
      ]
    };
  }
}
