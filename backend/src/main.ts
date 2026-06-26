import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import { createSwaggerConfig } from '@/config/swagger.config';
import { corsConfig } from '@/config/cors.config';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );


  /*
  app.useGlobalFilters(
    new HttpExceptionFilter(),
  );
  */

  app.enableCors(corsConfig);

  const document =
  SwaggerModule.createDocument(
    app,
    createSwaggerConfig(),
  );


  SwaggerModule.setup('api/docs', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port')!;
  await app.listen(port);

  console.log(`🚀 Backend running on http://localhost:${port}/api`);
  console.log(`📚 Swagger available at http://localhost:${port}/api/docs`);
}

bootstrap();