import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { FileLoggerService } from './file-logger.service';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: FileLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const startedAt = Date.now();

    return next.handle().pipe(
      finalize(() => {
        const durationMs = Date.now() - startedAt;

        this.logger.http(`${request.method} ${request.originalUrl} ${response.statusCode} ${durationMs}ms`, {
          ip: request.ip,
          params: this.sanitize(request.params),
          query: this.sanitize(request.query),
          body: this.sanitize(request.body),
        });
      }),
    );
  }

  private sanitize(value: unknown): unknown {
    const sensitiveKeys = new Set([
      'password',
      'senha',
      'token',
      'authorization',
      'accessToken',
      'refreshToken',
    ]);

    if (Array.isArray(value)) {
      return value.map((item) => this.sanitize(item));
    }

    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, currentValue]) => [
          key,
          sensitiveKeys.has(key) ? '[REDACTED]' : this.sanitize(currentValue),
        ]),
      );
    }

    return value;
  }
}
