import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';
import { AdminOrderOffersController } from './admin/admin-order-offers.controller';
import { AdminOrderOffersService } from './admin/admin-order-offers.service';
import { AdminOrderOffersMapper } from './admin/mappers/admin-order-offers.mapper';
import { FloristOrderOffersController } from './florist/florist-order-offers.controller';
import { FloristOrderOffersService } from './florist/florist-order-offers.service';
import { FloristOrderOffersMapper } from './florist/mappers/florist-order-offers.mapper';
import { FloristCompensationsModule } from '@/florist-compensations/florist-compensations.module';
import { GeocodingModule } from '@/geocoding/geocoding.module';




@Module({
  imports: [
    PrismaModule,
    FloristCompensationsModule,
    GeocodingModule,
  ],
  controllers: [
    AdminOrderOffersController,
    FloristOrderOffersController
  ],
  providers: [
    AdminOrderOffersService,
    AdminOrderOffersMapper,
    FloristOrderOffersService,
    FloristOrderOffersMapper
  ]
})
export class OrderOffersModule {}
