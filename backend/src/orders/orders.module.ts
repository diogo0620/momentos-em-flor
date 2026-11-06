import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';
import { CustomerOrdersController } from './customer/customer-orders.controller';
import { CustomerOrdersMapper } from './customer/mappers/customer-orders.mapper';
import { CustomerOrdersService } from './customer/customer-orders.service';
import { AdminOrdersController } from './admin/admin-orders.controller';
import { AdminOrdersService } from './admin/admin-orders.service';
import { AdminOrdersMapper } from './admin/mappers/admin-orders.mapper';
import { StorageModule } from '@/storage/storage.module';
import { FloristOrdersController } from './florist/florist-orders.controller';
import { FloristOrdersService } from './florist/florist-orders.service';
import { FloristOrdersMapper } from './florist/mappers/florist-orders.mapper';
import { PaymentsModule } from '@/payments/payments.module';
import { FloristCompensationsModule } from '@/florist-compensations/florist-compensations.module';
import { StoreSettingsModule } from '@/store-settings/store-settings.module';
import { MoloniModule } from '@/moloni/moloni.module';




@Module({
  imports: [
    PrismaModule,
    StorageModule,
    PaymentsModule,
    FloristCompensationsModule,
    StoreSettingsModule,
    MoloniModule,
  ],
  controllers: [
    CustomerOrdersController,
    AdminOrdersController,
    FloristOrdersController
  ],
  providers: [
    CustomerOrdersService,
    CustomerOrdersMapper,
    AdminOrdersService,
    AdminOrdersMapper,
    FloristOrdersService,
    FloristOrdersMapper
  ]
})
export class OrdersModule {}
