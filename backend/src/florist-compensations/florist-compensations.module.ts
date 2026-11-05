import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { FloristCompensationLifecycleService } from './florist-compensation-lifecycle.service';
import { AdminFloristCompensationsController } from './admin/admin-florist-compensations.controller';
import { AdminFloristCompensationsService } from './admin/admin-florist-compensations.service';
import { FloristCompensationsController } from './florist/florist-compensations.controller';
import { FloristCompensationsService } from './florist/florist-compensations.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    AdminFloristCompensationsController,
    FloristCompensationsController,
  ],
  providers: [
    FloristCompensationLifecycleService,
    AdminFloristCompensationsService,
    FloristCompensationsService,
  ],
  exports: [FloristCompensationLifecycleService],
})
export class FloristCompensationsModule {}
