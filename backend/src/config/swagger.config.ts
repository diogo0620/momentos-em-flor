import { DocumentBuilder } from '@nestjs/swagger';

export function createSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('Momentos em Flor API')
    .setDescription('REST API')
    .setVersion('1.0.0')
    .build();
}