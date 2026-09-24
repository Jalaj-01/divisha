import { UserRole, PermissionCode } from './enums.js';

export interface AddressDTO {
  id: string;
  userId?: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  type: 'HOME' | 'WORK' | 'OTHER';
  isDefault: boolean;
}

export interface ProfileDTO {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  totalOrdersCount: number;
  totalSpentAmount: number;
}

export interface UserDTO {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  profile?: ProfileDTO;
  addresses?: AddressDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminPermissionDTO {
  id: string;
  code: PermissionCode;
  name: string;
  module: string;
  description: string;
}

export interface AdminRoleDTO {
  id: string;
  name: string;
  code: UserRole;
  description: string;
  permissions: AdminPermissionDTO[];
  userCount?: number;
  isSystem: boolean;
}

export interface AdminUserDTO {
  id: string;
  email: string;
  name: string;
  phone?: string;
  roleId: string;
  role: AdminRoleDTO;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AuditLogDTO {
  id: string;
  adminId: string;
  adminName?: string;
  adminEmail?: string;
  action: string;
  entity: string;
  entityId: string;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// -----------------------------------------------------------------------------
// AUTH & INPUT DTOs
// -----------------------------------------------------------------------------

export interface RegisterCustomerInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken?: string;
  user: UserDTO;
  permissions?: string[];
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  permissions?: string[];
  iat?: number;
  exp?: number;
}

export interface CreateAddressInput {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  type?: 'HOME' | 'WORK' | 'OTHER';
  isDefault?: boolean;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface CreateAdminUserInput {
  email: string;
  name: string;
  password: string;
  roleId: string;
  phone?: string;
}

export interface UpdateAdminUserInput {
  name?: string;
  roleId?: string;
  isActive?: boolean;
  phone?: string;
}

export interface UpdateRolePermissionsInput {
  roleId: string;
  permissionCodes: PermissionCode[];
}
