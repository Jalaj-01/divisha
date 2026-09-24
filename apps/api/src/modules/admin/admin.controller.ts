import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Body,
  Query
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service.js';
import {
  OrderStatus,
  CreateAdminUserInput,
  UpdateAdminUserInput,
  PermissionCode
} from '@divisha/types';

@ApiTags('Admin Operations & RBAC')
@Controller('v1/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get complete administrative overview KPIs and conversion funnel' })
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get immutable audit logs for administrative operations' })
  getAuditLogs() {
    return this.adminService.getAuditLogs();
  }

  @Patch('orders/:id/status')
  @ApiOperation({ summary: 'Transition order state with required operational timeline notes' })
  updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: OrderStatus; notes?: string; adminId?: string }
  ) {
    return this.adminService.updateOrderStatus(id, body.status, body.notes, body.adminId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Universal global search across orders, SKUs, products, and customers' })
  @ApiQuery({ name: 'q', required: true })
  globalSearch(@Query('q') q: string) {
    return this.adminService.globalSearch(q);
  }

  // --------------------------------------------------------------------------
  // CUSTOMER 360 ENDPOINTS
  // --------------------------------------------------------------------------
  @Get('customers')
  @ApiOperation({ summary: 'List and search customers with order counts and spent totals' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getCustomers(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.adminService.getCustomers(
      q,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10
    );
  }

  @Get('customers/:id')
  @ApiOperation({ summary: 'Get complete 360-degree customer profile including order history and wishlist' })
  getCustomerDetails(@Param('id') id: string) {
    return this.adminService.getCustomerDetails(id);
  }

  @Patch('customers/:id/toggle-status')
  @ApiOperation({ summary: 'Suspend or activate a customer account' })
  toggleCustomerStatus(@Param('id') id: string) {
    return this.adminService.toggleCustomerStatus(id);
  }

  // --------------------------------------------------------------------------
  // RBAC: ROLES & PERMISSIONS
  // --------------------------------------------------------------------------
  @Get('roles')
  @ApiOperation({ summary: 'List all administrative roles and attached granular permission sets' })
  getRoles() {
    return this.adminService.getRoles();
  }

  @Get('permissions')
  @ApiOperation({ summary: 'List all granular security permission codes across modules' })
  getPermissions() {
    return this.adminService.getPermissions();
  }

  @Put('roles/:id/permissions')
  @ApiOperation({ summary: 'Update granular permissions matrix for an administrative role' })
  updateRolePermissions(
    @Param('id') roleId: string,
    @Body() body: { permissionCodes: PermissionCode[] }
  ) {
    return this.adminService.updateRolePermissions(roleId, body.permissionCodes);
  }

  // --------------------------------------------------------------------------
  // ADMINISTRATIVE USERS
  // --------------------------------------------------------------------------
  @Get('admin-users')
  @ApiOperation({ summary: 'List all internal administrative staff accounts' })
  getAdminUsers() {
    return this.adminService.getAdminUsers();
  }

  @Post('admin-users')
  @ApiOperation({ summary: 'Create a new administrative staff member' })
  createAdminUser(@Body() input: CreateAdminUserInput) {
    return this.adminService.createAdminUser(input);
  }

  @Patch('admin-users/:id')
  @ApiOperation({ summary: 'Update administrative user details' })
  updateAdminUser(
    @Param('id') id: string,
    @Body() input: UpdateAdminUserInput
  ) {
    return this.adminService.updateAdminUser(id, input);
  }

  @Patch('admin-users/:id/toggle-status')
  @ApiOperation({ summary: 'Activate or deactivate administrative access for a staff user' })
  toggleAdminUserStatus(@Param('id') id: string) {
    return this.adminService.toggleAdminUserStatus(id);
  }
}

