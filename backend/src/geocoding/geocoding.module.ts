import { Module } from '@nestjs/common';
import { GoogleGeocodingService } from './google-geocoding-service';
import { GeocodingService } from './geocoding.service';
import { AdminGeocodingController } from './admin-geocoding.controller';

@Module({
    controllers: [AdminGeocodingController],
    providers: [GoogleGeocodingService, GeocodingService],
    exports: [GoogleGeocodingService, GeocodingService],
})
export class GeocodingModule {}
