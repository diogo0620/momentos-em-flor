import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';

import { OrderOffersController } from './order-offers.controller';
import { OrderOffersService } from './order-offers.service';
import { OrderOfferMapper } from './mappers/order-offer.mapper';

@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [
    OrderOffersController,
  ],
  providers: [
    OrderOffersService,
    OrderOfferMapper,
  ],
  exports: [
    OrderOffersService,
  ],
})
export class OrderOffersModule {}