import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { RegisterCustomerInput, LoginInput, JwtPayload } from '@divisha/types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Authentication & Identity')
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('customer/register')
  @ApiOperation({ summary: 'Customer Signup / Registration with email and profile details' })
  registerCustomer(@Body() input: RegisterCustomerInput) {
    return this.authService.registerCustomer(input);
  }

  @Post('customer/login')
  @ApiOperation({ summary: 'Customer Login with email and password' })
  loginCustomer(@Body() input: LoginInput) {
    return this.authService.loginCustomer(input);
  }

  @Post('admin/login')
  @ApiOperation({ summary: 'Admin Portal Login with RBAC roles and granular permissions token' })
  loginAdmin(@Body() input: LoginInput) {
    return this.authService.loginAdmin(input);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user/admin profile and session details' })
  getMe(@CurrentUser() user: JwtPayload) {
    return this.authService.getMe(user.sub);
  }
}
