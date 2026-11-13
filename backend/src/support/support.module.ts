import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { AdminSupportController } from './admin-support.controller';
import { CustomerSupportController } from './customer-support.controller';
import { SupportService } from './support.service';

@Module({
  imports: [PrismaModule],
  controllers: [CustomerSupportController, AdminSupportController],
  providers: [SupportService],
})
export class SupportModule {}
