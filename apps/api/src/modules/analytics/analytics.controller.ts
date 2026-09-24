import { Controller, Get, Post, Body, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service.js';
import { AnalyticsEventDTO } from '@divisha/types';

@ApiTags('Analytics & Telemetry')
@Controller('v1/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('event')
  @ApiOperation({ summary: 'Stream user funnel telemetry event (page_view, product_view, add_to_cart, checkout_started, purchase)' })
  recordEvent(@Body() event: AnalyticsEventDTO) {
    return this.analyticsService.recordEvent(event);
  }

  @Get('events')
  @ApiOperation({ summary: 'Get recent telemetry event stream' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getEvents(@Query('limit') limit?: string) {
    return this.analyticsService.getEvents(limit ? parseInt(limit, 10) : 50);
  }

  @Get('kpis')
  @ApiOperation({ summary: 'Get aggregated sales metrics, conversion funnel, and low-stock alerts' })
  getKPIs() {
    return this.analyticsService.getDashboardKPIs();
  }

  @Get('reports/export')
  @ApiOperation({ summary: 'Export financial and operational report as CSV (type=orders|inventory|tax)' })
  @ApiQuery({ name: 'type', required: true, enum: ['orders', 'inventory', 'tax'] })
  exportReport(
    @Query('type') type: 'orders' | 'inventory' | 'tax',
    @Res() res: any
  ) {
    const report = this.analyticsService.generateCsvReport(type || 'orders');
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.header('Content-Disposition', `attachment; filename="${report.filename}"`);
    return res.send(report.content);
  }
}
