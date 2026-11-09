import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { PaymentsModule } from '@/payments/payments.module';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { AdminSubscriptionsController } from './admin-subscriptions.controller';

@Module({ imports: [PrismaModule, PaymentsModule], controllers: [SubscriptionsController, AdminSubscriptionsController], providers: [SubscriptionsService] })
export class SubscriptionsModule {}
