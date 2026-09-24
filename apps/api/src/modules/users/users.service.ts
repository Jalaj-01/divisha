import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db } from '@divisha/database';
import {
  CreateAddressInput,
  UpdateProfileInput,
  AddressDTO,
  ProfileDTO,
  WishlistItemDTO
} from '@divisha/types';

@Injectable()
export class UsersService {
  getProfile(userId: string): ProfileDTO {
    const user = db.findUserById(userId);
    if (!user || !user.profile) {
      throw new NotFoundException('Customer profile not found');
    }
    return user.profile;
  }

  updateProfile(userId: string, input: UpdateProfileInput): ProfileDTO {
    const updated = db.updateUserProfile(userId, input);
    if (!updated) {
      throw new NotFoundException('Customer profile not found');
    }
    return updated;
  }

  getAddresses(userId: string): AddressDTO[] {
    return db.getUserAddresses(userId);
  }

  addAddress(userId: string, input: CreateAddressInput): AddressDTO {
    try {
      return db.addUserAddress(userId, input);
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  updateAddress(userId: string, addressId: string, input: Partial<CreateAddressInput>): AddressDTO {
    const updated = db.updateUserAddress(userId, addressId, input);
    if (!updated) {
      throw new NotFoundException('Address not found');
    }
    return updated;
  }

  deleteAddress(userId: string, addressId: string): { success: boolean } {
    const success = db.deleteUserAddress(userId, addressId);
    if (!success) {
      throw new NotFoundException('Address not found or already deleted');
    }
    return { success: true };
  }

  setDefaultAddress(userId: string, addressId: string): { success: boolean } {
    const success = db.setDefaultUserAddress(userId, addressId);
    if (!success) {
      throw new NotFoundException('Address not found');
    }
    return { success: true };
  }

  getWishlist(userId: string): WishlistItemDTO[] {
    return db.getUserWishlist(userId);
  }

  toggleWishlist(userId: string, productId: string): { isWishlisted: boolean } {
    const prod = db.getProductById(productId);
    if (!prod) {
      throw new NotFoundException(`Product '${productId}' not found`);
    }
    return db.toggleUserWishlist(userId, productId);
  }
}
