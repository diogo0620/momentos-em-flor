import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';
import { AdminCategoriesController } from './admin/admin-categories.controller';
import { AdminCategoriesMapper } from './admin/mappers/admin-categories.mapper';
import { AdminCategoriesService } from './admin/admin-categories.service';
import { PublicCategoriesController } from './public/public-categories.controller';
import { PublicCategoriesService } from './public/public-categories.service';
import { PublicCategoriesMapper } from './public/mappers/public-categories.mapper';
import { StorageModule } from '@/storage/storage.module';



@Module({
  imports: [
    PrismaModule,
    StorageModule
  ],
  controllers: [
    AdminCategoriesController,
    PublicCategoriesController
  ],
  providers: [
    AdminCategoriesService,
    AdminCategoriesMapper,
    PublicCategoriesService,
    PublicCategoriesMapper
  ]
})
export class CategoriesModule {}