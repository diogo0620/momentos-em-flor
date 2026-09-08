import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { LoggerModule } from './common/logger/logger.module';
import { HealthModule } from './health/health.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { FloristsModule } from './florists/florists.module';
import appConfig from '@/config/app.config';
import { FloristCompensationRulesModule } from './florist-compensation-rules/florist-compensation-rules.module';
import { OrdersModule } from './orders/orders.module';
import { OrderOffersModule } from './order-offers/order-offers.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ReviewsModule } from './reviews/reviews.module';
import { TaxCodesModule } from './tax-codes/tax-codes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    PrismaModule,
    CategoriesModule,
    LoggerModule,
    HealthModule,
    UploadsModule,
    UsersModule,
    AuthModule,
    ProductsModule,
    FloristsModule,
    FloristCompensationRulesModule,
    OrdersModule,
    OrderOffersModule,
    ReviewsModule,
    TaxCodesModule,
  ],
})
export class AppModule { }