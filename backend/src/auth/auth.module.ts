import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PrismaModule } from '@/prisma/prisma.module';
import { UsersModule } from '@/users/users.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-guard';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '15m',
        },
      }),
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy,RolesGuard, OptionalJwtAuthGuard],
  exports: [AuthService],
})
export class AuthModule { }