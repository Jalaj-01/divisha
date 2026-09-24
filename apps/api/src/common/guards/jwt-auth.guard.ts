import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '@divisha/types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private secret = process.env.JWT_SECRET || 'divisha-production-grade-super-secure-jwt-secret-key-2026';

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] || request.headers['Authorization'];

    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('Missing Authorization Bearer token');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Invalid Authorization format. Expected Bearer <token>');
    }

    const token = parts[1];
    try {
      const decoded = jwt.verify(token, this.secret) as JwtPayload;
      request.user = decoded;
      return true;
    } catch (err: any) {
      throw new UnauthorizedException(`Session expired or token invalid: ${err.message}`);
    }
  }
}
