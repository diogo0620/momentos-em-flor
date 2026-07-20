import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductMapper } from './mappers/product.mapper';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductMapper]
})
export class ProductsModule {}
