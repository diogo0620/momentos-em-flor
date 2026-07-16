import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';

import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategoryMapper } from './mappers/category.mapper';

@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [
    CategoriesController,
  ],
  providers: [
    CategoriesService,
    CategoryMapper,
  ],
  exports: [
    CategoriesService,
  ],
})
export class CategoriesModule {}