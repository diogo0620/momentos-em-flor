import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';
import { AdminStoreSettingsController } from './admin/admin-store-settings.controller';
import { AdminStoreSettingsService } from './admin/admin-store-settings.service';
import { AdminStoreSettingsMapper } from './admin/mapper/admin-store-settings.mapper';
import { PublicStoreSettingsController } from './public-store-settings.controller';
import { GeocodingModule } from '@/geocoding/geocoding.module';
import { DeliveryAreaService } from './delivery-area.service';



@Module({
  imports: [
    PrismaModule,
    GeocodingModule,
  ],
  controllers: [
    AdminStoreSettingsController,
    PublicStoreSettingsController,
  ],
  providers: [
    AdminStoreSettingsService,
    AdminStoreSettingsMapper,
    DeliveryAreaService,
  ],
  exports: [AdminStoreSettingsService, AdminStoreSettingsMapper, DeliveryAreaService]
})
export class StoreSettingsModule {}
