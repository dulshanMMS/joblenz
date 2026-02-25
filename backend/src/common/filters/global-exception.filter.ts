import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

// Catches all exceptions and formats them into a consistent error shape
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? this.extractMessage(exception)
        : 'Internal server error';

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
    });
  }

  private extractMessage(exception: HttpException): string | string[] {
    const response = exception.getResponse();

    if (typeof response === 'string') {
      return response;
    }

    // class-validator returns { message: string[] } for validation errors
    if (typeof response === 'object' && 'message' in response) {
      return (response as { message: string | string[] }).message;
    }

    return exception.message;
  }
}
