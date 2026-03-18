import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { FileLoggerService } from './file-logger.service';

@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: FileLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = isHttpException ? exception.getResponse() : 'Internal server error';
    const message =
      typeof errorResponse === 'string'
        ? errorResponse
        : JSON.stringify(errorResponse);

    const stack =
      exception instanceof Error ? exception.stack : JSON.stringify(exception);

    this.logger.error(
      `${request.method} ${request.originalUrl} ${status} - ${message}`,
      stack,
      'ExceptionsFilter',
    );

    response.status(status).json({
      statusCode: status,
      message: isHttpException ? errorResponse : 'Internal server error',
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
    });
  }
}
