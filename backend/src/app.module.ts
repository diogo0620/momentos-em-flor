import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { LoggerModule } from './common/logger/logger.module';
import { HealthModule } from './health/health.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import appConfig from '@/config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    PrismaModule,
    CategoriesModule,
    LoggerModule,
    HealthModule,
    UploadsModule,
    UsersModule,
    AuthModule
  ],
})
export class AppModule { }