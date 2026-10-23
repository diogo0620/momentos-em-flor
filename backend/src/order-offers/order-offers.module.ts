import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';
import { AdminOrderOffersController } from './admin/admin-order-offers.controller';
import { AdminOrderOffersService } from './admin/admin-order-offers.service';
import { AdminOrderOffersMapper } from './admin/mappers/admin-order-offers.mapper';




@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [
    AdminOrderOffersController
  ],
  providers: [

    
    AdminOrderOffersService,
    AdminOrderOffersMapper
  ]
})
export class OrderOffersModule {}