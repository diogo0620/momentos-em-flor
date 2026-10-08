import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderMapper } from './mappers/order.mapper';
import { OrderDistributionService } from './services/order-distribution.service';
import { OrderCreatedListener } from '@/events/order/order-created.listener';
import { OrderStatusService } from './services/order-status.service';
import { GeocodingModule } from '@/geocoding/geocoding.module';
import { StoreSettingsService } from '@/store-settings/store-settings.service';
import { CustomerOrderMapper } from './mappers/customer-order.mapper';

@Module({
  imports: [PrismaModule,GeocodingModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrderMapper, CustomerOrderMapper, OrderDistributionService,OrderStatusService, OrderCreatedListener, StoreSettingsService],
  exports: [OrdersService,OrderStatusService,OrderDistributionService],
})
export class OrdersModule {}