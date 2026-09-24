import { Controller, Get, Post, Patch, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { WhatsAppService } from './whatsapp.service.js';
import {
  WhatsAppProductInquiryData,
  WhatsAppMessageType,
  WhatsAppQuoteDTO,
  WhatsAppDispatchAlertDTO
} from '@divisha/types';

@ApiTags('WhatsApp Concierge, Chat & Calling')
@Controller('v1/whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsAppService: WhatsAppService) {}

  @Get('departments')
  @ApiOperation({ summary: 'Get active WhatsApp concierge departments (Sales, Custom Furniture, Tech Support)' })
  getDepartments() {
    return this.whatsAppService.getDepartments();
  }

  @Patch('departments/:id')
  @ApiOperation({ summary: 'Update department online availability and hours' })
  @ApiParam({ name: 'id', example: 'dept-sales' })
  updateDepartment(
    @Param('id') id: string,
    @Body() body: { isAvailable: boolean; operatingHours?: string }
  ) {
    return this.whatsAppService.updateDepartmentStatus(id, body.isAvailable, body.operatingHours);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get official Meta Cloud API approved message templates' })
  getTemplates() {
    return this.whatsAppService.getTemplates();
  }

  @Post('inquire-link')
  @ApiOperation({ summary: 'Generate encoded WhatsApp direct chat link for a specific product or variant' })
  generateInquireLink(
    @Body() data: WhatsAppProductInquiryData,
    @Query('phone') phone?: string
  ) {
    return this.whatsAppService.generateProductInquiryLink(data, phone);
  }

  @Post('quote-link')
  @ApiOperation({ summary: 'Generate tailored luxury VIP quotation link and formatted WhatsApp message' })
  generateQuoteLink(@Body() dto: WhatsAppQuoteDTO) {
    return this.whatsAppService.generateQuoteLink(dto);
  }

  @Post('dispatch-alert')
  @ApiOperation({ summary: 'Trigger BlueDart white-glove shipping alert via WhatsApp' })
  dispatchAlert(@Body() dto: WhatsAppDispatchAlertDTO) {
    return this.whatsAppService.sendDispatchAlert(dto);
  }

  @Get('call-action')
  @ApiOperation({ summary: 'Get direct Click-to-Call and WhatsApp Calling URLs' })
  getCallAction(@Query('phone') phone?: string) {
    return this.whatsAppService.generateCallUrl(phone);
  }

  @Post('simulate-alert')
  @ApiOperation({ summary: 'Simulate transactional WhatsApp alert (Order confirmation, Dispatch, Delivery)' })
  simulateAlert(
    @Body()
    payload: {
      toPhone: string;
      type: WhatsAppMessageType;
      parameters: Record<string, string>;
      recipientName?: string;
      department?: string;
    }
  ) {
    return this.whatsAppService.sendTransactionalAlert(payload);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get recent WhatsApp dispatch logs' })
  @ApiQuery({ name: 'type', required: false, enum: WhatsAppMessageType })
  @ApiQuery({ name: 'phone', required: false })
  getLogs(@Query('type') type?: string, @Query('phone') phone?: string) {
    return this.whatsAppService.getMessageLogs({ type, phone });
  }
}
