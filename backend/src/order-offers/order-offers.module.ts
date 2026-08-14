import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';

import { OrderOffersController } from './order-offers.controller';
import { OrderOffersService } from './order-offers.service';
import { OrderOfferMapper } from './mappers/order-offer.mapper';
import { OrdersModule } from '@/orders/orders.module';
import { OrderOfferExpirationService } from './order-offers-expiration.service';

@Module({
  imports: [
    PrismaModule,
    OrdersModule,
  ],
  controllers: [
    OrderOffersController,
  ],
  providers: [
    OrderOffersService,
    OrderOfferMapper,
    OrderOfferExpirationService
    
  ],
  exports: [
    OrderOffersService,
  ],
})
export class OrderOffersModule {}