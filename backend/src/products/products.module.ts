import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';
import { AdminProductsController } from './admin/admin-products.controller';
import { AdminProductsMapper } from './admin/mappers/admin-products.mapper';
import { AdminProductsService } from './admin/admin-products.service';
import { PublicProductsController } from './public/public-products.controller';
import { PublicProductsService } from './public/public-products.service';
import { PublicProductsMapper } from './public/mappers/public-products.mapper';
import { StorageModule } from '@/storage/storage.module';
import { AdminProductImagesController } from './admin/admin-product-images.controller';
import { AdminProductImagesService } from './admin/admin-product-images.service';



@Module({
  imports: [
    PrismaModule,
    StorageModule
  ],
  controllers: [
    AdminProductsController,
    PublicProductsController,
    AdminProductImagesController
  ],
  providers: [
    AdminProductsService,
    AdminProductsMapper,
    PublicProductsService,
    PublicProductsMapper,
    AdminProductImagesService
  ]
})
export class ProductsModule {}