import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { LoggerModule } from './common/logger/logger.module'
import appConfig from '@/config/app.config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TaxCodesModule } from './tax-codes/tax-codes.module';
import { FloristsModule } from './florists/florists.module';
import { StoreSettingsModule } from './store-settings/store-settings.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { OrderOffersModule } from './order-offers/order-offers.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    StoreSettingsModule,
    UsersModule,
    CategoriesModule,
    TaxCodesModule,
    FloristsModule,
    ProductsModule,
    OrdersModule,
    OrderOffersModule,
    PaymentsModule,
    UploadsModule,
    LoggerModule
  ],
})
export class AppModule { }