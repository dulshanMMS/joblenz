import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Wraps every successful controller response in a consistent shape
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = _context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode: response.statusCode,
        data,
      })),
    );
  }
}
