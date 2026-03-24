import { ConsoleLogger, Injectable, LogLevel } from '@nestjs/common';
import { appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { inspect } from 'node:util';

type LogMetadata = Record<string, unknown> | undefined;

@Injectable()
export class FileLoggerService extends ConsoleLogger {
  private readonly logsDir = join(process.cwd(), 'logs');

  constructor() {
    super();
    this.ensureLogsDir();
  }

  override log(message: unknown, context?: string): void {
    this.write('log', message, context);
    super.log(message, context);
  }

  override error(message: unknown, stack?: string, context?: string): void {
    this.write('error', message, context, { stack });
    super.error(message, stack, context);
  }

  override warn(message: unknown, context?: string): void {
    this.write('warn', message, context);
    super.warn(message, context);
  }

  override debug(message: unknown, context?: string): void {
    this.write('debug', message, context);
    super.debug(message, context);
  }

  override verbose(message: unknown, context?: string): void {
    this.write('verbose', message, context);
    super.verbose(message, context);
  }

  override fatal(message: unknown, context?: string): void {
    this.write('fatal', message, context);
    super.fatal(message, context);
  }

  startSession(): void {
    const line = `\n[${this.formatTimestamp()}] [BOOT] Nova execucao iniciada\n`;
    appendFileSync(this.getLogFilePath(), line, 'utf8');
  }

  http(message: string, metadata?: LogMetadata): void {
    this.write('http', message, 'HTTP', metadata);
  }

  private write(
    level: LogLevel | 'http',
    message: unknown,
    context?: string,
    metadata?: LogMetadata,
  ): void {
    const payload = this.serializeMessage(message);
    const suffix = metadata ? ` ${this.serializeMetadata(metadata)}` : '';
    const line = `[${this.formatTimestamp()}] [${level.toUpperCase()}]${context ? ` [${context}]` : ''} ${payload}${suffix}\n`;

    appendFileSync(this.getLogFilePath(), line, 'utf8');
  }

  private ensureLogsDir(): void {
    if (!existsSync(this.logsDir)) {
      mkdirSync(this.logsDir, { recursive: true });
    }
  }

  private getLogFilePath(): string {
    return join(this.logsDir, `${this.getCurrentDate()}.log`);
  }

  private getCurrentDate(): string {
    return new Intl.DateTimeFormat('sv-SE', {
      timeZone: process.env.LOG_TIMEZONE || 'America/Sao_Paulo',
    }).format(new Date());
  }

  private formatTimestamp(): string {
    const parts = new Intl.DateTimeFormat('sv-SE', {
      timeZone: process.env.LOG_TIMEZONE || 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).formatToParts(new Date());

    const value = (type: string) =>
      parts.find((part) => part.type === type)?.value ?? '00';

    return `${value('year')}-${value('month')}-${value('day')} ${value('hour')}:${value('minute')}:${value('second')}`;
  }

  private serializeMessage(message: unknown): string {
    if (typeof message === 'string') {
      return message;
    }

    return inspect(message, { depth: 5, breakLength: Infinity, compact: true });
  }

  private serializeMetadata(metadata: LogMetadata): string {
    return inspect(metadata, {
      depth: 5,
      breakLength: Infinity,
      compact: true,
    });
  }
}
