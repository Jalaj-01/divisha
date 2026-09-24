import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import {
  CreateAddressInput,
  UpdateProfileInput,
  JwtPayload
} from '@divisha/types';

@ApiTags('Customer Profiles & Addresses')
@Controller('v1/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current customer profile' })
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.getProfile(user.sub);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update customer profile information' })
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() input: UpdateProfileInput
  ) {
    return this.usersService.updateProfile(user.sub, input);
  }

  @Get('addresses')
  @ApiOperation({ summary: 'Get list of customer saved shipping & billing addresses' })
  getAddresses(@CurrentUser() user: JwtPayload) {
    return this.usersService.getAddresses(user.sub);
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Add a new shipping or billing address' })
  addAddress(
    @CurrentUser() user: JwtPayload,
    @Body() input: CreateAddressInput
  ) {
    return this.usersService.addAddress(user.sub, input);
  }

  @Put('addresses/:id')
  @ApiOperation({ summary: 'Update an existing address' })
  updateAddress(
    @CurrentUser() user: JwtPayload,
    @Param('id') addressId: string,
    @Body() input: Partial<CreateAddressInput>
  ) {
    return this.usersService.updateAddress(user.sub, addressId, input);
  }

  @Delete('addresses/:id')
  @ApiOperation({ summary: 'Delete a saved address' })
  deleteAddress(
    @CurrentUser() user: JwtPayload,
    @Param('id') addressId: string
  ) {
    return this.usersService.deleteAddress(user.sub, addressId);
  }

  @Patch('addresses/:id/default')
  @ApiOperation({ summary: 'Set address as primary default shipping destination' })
  setDefaultAddress(
    @CurrentUser() user: JwtPayload,
    @Param('id') addressId: string
  ) {
    return this.usersService.setDefaultAddress(user.sub, addressId);
  }

  @Get('wishlist')
  @ApiOperation({ summary: 'Get customer saved wishlist items' })
  getWishlist(@CurrentUser() user: JwtPayload) {
    return this.usersService.getWishlist(user.sub);
  }

  @Post('wishlist/:productId/toggle')
  @ApiOperation({ summary: 'Toggle product in customer wishlist' })
  toggleWishlist(
    @CurrentUser() user: JwtPayload,
    @Param('productId') productId: string
  ) {
    return this.usersService.toggleWishlist(user.sub, productId);
  }
}
