import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductMapper } from './mappers/product.mapper';
import { CategoryMapper } from '@/categories/mappers/category.mapper';
import { ProductsAdminController } from './products-admin.controller';
import { ProductConfigurationService } from './product-configuration-service';

@Module({
  controllers: [ProductsController, ProductsAdminController],
  providers: [ProductsService, ProductMapper, CategoryMapper, ProductConfigurationService]
})
export class ProductsModule {}
