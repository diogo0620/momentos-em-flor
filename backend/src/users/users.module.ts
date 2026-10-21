import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';
import { AdminUsersController } from './admin/admin-users.controller';
import { AdminUsersService } from './admin/admin-users.service';
import { AdminUsersMapper } from './admin/mappers/admin-users.mapper';
import { PublicUsersController } from './public/public-users.controller';
import { PublicUsersService } from './public/public-users.service';
import { PublicUsersMapper } from './public/mappers/public-users.mapper';
import { CustomerUsersController } from './customer/customer-users.controller';
import { CustomerUsersService } from './customer/customer-users.service';
import { CustomerUsersMapper } from './customer/mappers/customer-users.mapper';
import { FloristUsersController } from './florist/florist-users.controller';
import { FloristUsersService } from './florist/florist-users.service';
import { FloristUsersMapper } from './florist/mappers/florist-users.mapper';



@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [
    AdminUsersController,
    PublicUsersController,
    CustomerUsersController,
    FloristUsersController
  ],
  providers: [
    AdminUsersService,
    AdminUsersMapper,
    PublicUsersService,
    PublicUsersMapper,
    CustomerUsersService,
    CustomerUsersMapper,
    FloristUsersService,
    FloristUsersMapper
  ]
})
export class UsersModule {}