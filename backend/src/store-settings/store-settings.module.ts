import { Module } from '@nestjs/common';
import { StorageModule } from '@/storage/storage.module';
import { HomeVideosController } from './home-videos.controller';

import { PrismaModule } from '@/prisma/prisma.module';
import { AdminStoreSettingsController } from './admin/admin-store-settings.controller';
import { AdminStoreSettingsService } from './admin/admin-store-settings.service';
import { AdminStoreSettingsMapper } from './admin/mapper/admin-store-settings.mapper';
import { PublicStoreSettingsController } from './public-store-settings.controller';
import { GeocodingModule } from '@/geocoding/geocoding.module';
import { DeliveryAreaService } from './delivery-area.service';



@Module({
  imports: [
    StorageModule,
    PrismaModule,
    GeocodingModule,
  ],
  controllers: [
    HomeVideosController,
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
