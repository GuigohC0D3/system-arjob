import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './logging/all-exceptions.filter';
import { FileLoggerService } from './logging/file-logger.service';
import { HttpLoggingInterceptor } from './logging/http-logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(FileLoggerService);

  app.useLogger(logger);
  logger.startSession();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.use((_, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    next();
  });
  
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  });

  const port = Number(process.env.PORT) || 3000;
  app.useGlobalInterceptors(app.get(HttpLoggingInterceptor));
  app.useGlobalFilters(app.get(AllExceptionsFilter));
  await app.listen(port);
  logger.log(`Backend iniciado na porta ${port}`, 'Bootstrap');
}
void bootstrap();
