import { Module } from '@nestjs/common';

import { FloristsController } from './florists.controller';
import { FloristsService } from './florists.service';
import { FloristMapper } from './mappers/florist.mapper';
import { AddressMapper } from '@/addresses/mappers/address.mapper';
import { GeocodingModule } from '@/geocoding/geocoding.module';

@Module({
  controllers: [FloristsController],
  imports: [
    GeocodingModule,
  ],
  providers: [
    FloristsService,
    FloristMapper,
    AddressMapper,
  ],
})
export class FloristsModule {}