import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import { createSwaggerConfig } from '@/config/swagger.config';
import { createCorsConfig } from '@/config/cors.config';

import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';

import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule, {rawBody: true}
  );

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(
    new HttpExceptionFilter(),
  );

  app.enableCors(createCorsConfig());

  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.ENABLE_SWAGGER === 'true'
  ) {
    const document = SwaggerModule.createDocument(
      app,
      createSwaggerConfig(),
    );

    SwaggerModule.setup('api/docs', app, document);
  }

  app.use(cookieParser());

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port')!;
  const host = process.env.HOST ?? '0.0.0.0';

  app.enableShutdownHooks();

  await app.listen(port, host);

  const publicApiUrl = process.env.BACKEND_URL
    ? process.env.BACKEND_URL.replace(/\/$/, '')
    : `http://${host}:${port}/api`;

  console.log(`🚀 Backend running on ${publicApiUrl}`);

  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.ENABLE_SWAGGER === 'true'
  ) {
    console.log(`📚 Swagger available at http://${host}:${port}/api/docs`);
  }
}

bootstrap();
