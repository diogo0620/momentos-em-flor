import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';
import { EmailModule } from '@/email/email.module';

import { OrderOfferCreatedListener } from './order-offers/order-offer-created.listener';
import { OrderOfferEmailService } from './order-offers/order-offer-email.service';
import { GeocodingModule } from '@/geocoding/geocoding.module';
import { MoloniModule } from '@/moloni/moloni.module';
import { AutomaticOrderOffersService } from './orders/automatic-order-offers.service';
import { OrderPaidAutomationListener } from './orders/order-paid-automation.listener';
import { OrderOfferNotificationAutomationService } from './order-offers/order-offer-notification-automation.service';

@Module({
  imports: [
    PrismaModule,
    EmailModule,
    GeocodingModule,
    MoloniModule,
  ],
  providers: [
    OrderOfferCreatedListener,
    OrderOfferEmailService,
    AutomaticOrderOffersService,
    OrderPaidAutomationListener,
    OrderOfferNotificationAutomationService,
  ],
})
export class EventsModule {}
