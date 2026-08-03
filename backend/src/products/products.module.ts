import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductMapper } from './mappers/product.mapper';
import { CategoryMapper } from '@/categories/mappers/category.mapper';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductMapper, CategoryMapper]
})
export class ProductsModule {}
