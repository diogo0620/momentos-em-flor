import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderMapper } from './mappers/order.mapper';
import { OrderDistributionService } from './services/order-distribution.service';

@Module({
  imports: [PrismaModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrderMapper, OrderDistributionService],
  exports: [OrdersService],
})
export class OrdersModule {}