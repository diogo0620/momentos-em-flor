import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';
import { AdminProductsController } from './admin/admin-products.controller';
import { AdminProductsMapper } from './admin/mappers/admin-products.mapper';
import { AdminProductsService } from './admin/admin-products.service';
import { PublicProductsController } from './public/public-products.controller';
import { PublicProductsService } from './public/public-products.service';
import { PublicProductsMapper } from './public/mappers/public-products.mapper';
import { StorageModule } from '@/storage/storage.module';



@Module({
  imports: [
    PrismaModule,
    StorageModule
  ],
  controllers: [
    AdminProductsController,
    PublicProductsController
  ],
  providers: [
    AdminProductsService,
    AdminProductsMapper,
    PublicProductsService,
    PublicProductsMapper,
  ]
})
export class ProductsModule {}