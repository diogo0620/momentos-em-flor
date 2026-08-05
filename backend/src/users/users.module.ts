import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserMapper } from './mappers/user.mapper';

@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [
    UsersController,
  ],
  providers: [
    UsersService,
    UserMapper,
  ],
  exports: [
    UsersService,
  ],
})
export class UsersModule {}