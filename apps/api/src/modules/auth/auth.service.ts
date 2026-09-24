import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { db } from '@divisha/database';
import {
  RegisterCustomerInput,
  LoginInput,
  AuthTokenResponse,
  JwtPayload,
  UserRole
} from '@divisha/types';

@Injectable()
export class AuthService {
  private secret = process.env.JWT_SECRET || 'divisha-production-grade-super-secure-jwt-secret-key-2026';
  private expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  registerCustomer(input: RegisterCustomerInput): AuthTokenResponse {
    try {
      const user = db.registerCustomer(input);
      const token = this.signToken({
        sub: user.id,
        email: user.email,
        role: user.role
      });

      return {
        accessToken: token,
        user
      };
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }

  loginCustomer(input: LoginInput): AuthTokenResponse {
    const user = db.findUserByEmail(input.email);
    if (!user || user.role !== UserRole.CUSTOMER) {
      throw new UnauthorizedException('Invalid customer credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated. Please contact concierge support.');
    }

    const isValid = db.validateUserPassword(input.email, input.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid customer credentials');
    }

    const token = this.signToken({
      sub: user.id,
      email: user.email,
      role: user.role
    });

    return {
      accessToken: token,
      user
    };
  }

  loginAdmin(input: LoginInput): AuthTokenResponse {
    const admin = db.findAdminUserByEmail(input.email);
    if (!admin) {
      throw new UnauthorizedException('Invalid administrative credentials');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('Administrative staff account is currently suspended.');
    }

    const isValid = db.validateAdminPassword(input.email, input.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid administrative credentials');
    }

    const permissions = admin.role.permissions.map((p) => p.code);

    const token = this.signToken({
      sub: admin.id,
      email: admin.email,
      role: admin.role.code,
      permissions
    });

    return {
      accessToken: token,
      user: {
        id: admin.id,
        email: admin.email,
        phone: admin.phone,
        role: admin.role.code,
        isActive: admin.isActive,
        profile: {
          id: `prof-${admin.id}`,
          userId: admin.id,
          firstName: admin.name.split(' ')[0] || 'Admin',
          lastName: admin.name.split(' ').slice(1).join(' ') || '',
          totalOrdersCount: 0,
          totalSpentAmount: 0
        },
        createdAt: admin.createdAt,
        updatedAt: admin.createdAt
      },
      permissions
    };
  }

  getMe(userId: string) {
    const user = db.findUserById(userId);
    if (user) return user;

    const admin = db.findAdminUserById(userId);
    if (admin) {
      return {
        id: admin.id,
        email: admin.email,
        phone: admin.phone,
        role: admin.role.code,
        isActive: admin.isActive,
        profile: {
          id: `prof-${admin.id}`,
          userId: admin.id,
          firstName: admin.name.split(' ')[0] || 'Admin',
          lastName: admin.name.split(' ').slice(1).join(' ') || '',
          totalOrdersCount: 0,
          totalSpentAmount: 0
        },
        permissions: admin.role.permissions.map((p) => p.code),
        createdAt: admin.createdAt,
        updatedAt: admin.createdAt
      };
    }

    throw new NotFoundException('User profile not found');
  }

  private signToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn as any
    });
  }
}
