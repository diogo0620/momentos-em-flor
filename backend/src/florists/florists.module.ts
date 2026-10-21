import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';
import { AdminFloristsController } from './admin/admin-florists.controller';
import { AdminFloristsMapper } from './admin/mappers/admin-florists.mapper';
import { AdminFloristsService } from './admin/admin-florists.service';
import { FloristFloristsController } from './florist/florist-florists.controller';
import { FloristFloristsService } from './florist/florist-florists.service';
import { FloristFloristsMapper } from './florist/mappers/florist-florists.mapper';



@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [
    AdminFloristsController,
    FloristFloristsController
  ],
  providers: [
    AdminFloristsService,
    AdminFloristsMapper,
    FloristFloristsService,
    FloristFloristsMapper
  ]
})
export class FloristsModule {}