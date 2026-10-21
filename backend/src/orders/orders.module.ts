import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';
import { CustomerOrdersController } from './customer/customer-orders.controller';
import { CustomerOrdersMapper } from './customer/mappers/customer-orders.mapper';
import { CustomerOrdersService } from './customer/customer-orders.service';
import { AdminStoreSettingsService } from '@/store-settings/admin/admin-store-settings.service';
import { AdminStoreSettingsMapper } from '@/store-settings/admin/mapper/admin-store-settings.mapper';
import { AdminOrdersController } from './admin/admin-orders.controller';
import { AdminOrdersService } from './admin/admin-orders.service';
import { AdminOrdersMapper } from './admin/mappers/admin-orders.mapper';




@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [
    CustomerOrdersController,
    AdminOrdersController
  ],
  providers: [
    CustomerOrdersService,
    CustomerOrdersMapper,
    AdminStoreSettingsService,
    AdminStoreSettingsMapper,
    AdminOrdersService,
    AdminOrdersMapper
  ]
})
export class OrdersModule {}