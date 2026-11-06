import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';
import { AdminTaxCodesController } from './admin/admin-tax-codes.controller';
import { AdminTaxCodesMapper } from './admin/mappers/admin-tax-codes.mapper';
import { AdminTaxCodesService } from './admin/admin-tax-codes.service'



@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [
    AdminTaxCodesController
  ],
  providers: [
    AdminTaxCodesService,
    AdminTaxCodesMapper
  ]
})
export class TaxCodesModule {}