import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@divisha/types';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((res) => {
        // If response is already formatted with success/meta, return as is
        if (res && typeof res === 'object' && 'success' in res) {
          return {
            ...res,
            timestamp: res.timestamp || new Date().toISOString()
          };
        }

        // Check if response has pagination metadata
        if (res && typeof res === 'object' && 'items' in res && 'total' in res) {
          const { items, total, page, limit } = res;
          const totalPages = Math.ceil(total / (limit || 10));
          return {
            success: true,
            data: items,
            meta: {
              page: page || 1,
              limit: limit || 10,
              totalItems: total,
              totalPages,
              hasNextPage: (page || 1) < totalPages,
              hasPrevPage: (page || 1) > 1
            },
            timestamp: new Date().toISOString()
          };
        }

        return {
          success: true,
          data: res,
          timestamp: new Date().toISOString()
        };
      })
    );
  }
}
