import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionCode, UserRole } from '@divisha/types';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator.js';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<PermissionCode[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    // If no specific permissions are decorated, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User context missing. JwtAuthGuard must run before RbacGuard.');
    }

    // SUPER_ADMIN has full system privileges
    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    const userPermissions: string[] = user.permissions || [];
    const missingPermissions = requiredPermissions.filter(
      (perm) => !userPermissions.includes(perm)
    );

    if (missingPermissions.length > 0) {
      throw new ForbiddenException(
        `Insufficient privileges. Missing permissions: ${missingPermissions.join(', ')}`
      );
    }

    return true;
  }
}
