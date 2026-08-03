import { Module } from '@nestjs/common';

import { FloristsController } from './florists.controller';
import { FloristsService } from './florists.service';
import { FloristMapper } from './mappers/florist.mapper';
import { AddressMapper } from '@/addresses/mappers/address.mapper';

@Module({
  controllers: [FloristsController],
  providers: [
    FloristsService,
    FloristMapper,
    AddressMapper,
  ],
})
export class FloristsModule {}