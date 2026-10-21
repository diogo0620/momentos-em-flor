import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';
import { AdminStoreSettingsController } from './admin/admin-store-settings.controller';
import { AdminStoreSettingsService } from './admin/admin-store-settings.service';
import { AdminStoreSettingsMapper } from './admin/mapper/admin-store-settings.mapper';



@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [
    AdminStoreSettingsController,
  ],
  providers: [
    AdminStoreSettingsService,
    AdminStoreSettingsMapper
  ],
  exports: [AdminStoreSettingsService,AdminStoreSettingsMapper]
})
export class StoreSettingsModule {}