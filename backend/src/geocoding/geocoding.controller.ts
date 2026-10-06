import {
    Body,
    Controller,
    Post,
} from '@nestjs/common';

import { GeocodingService } from './geocoding.service';
import { GeocodeAddressDto } from './dto/geocoding.dto';

@Controller('geocoding')
export class GeocodingController {
    constructor(
        private readonly geocodingService: GeocodingService,
    ) {}

    @Post()
    async geocodeAddress(
        @Body() address: GeocodeAddressDto,
    ) {
        return this.geocodingService.geocodeAddress(
            address,
        );
    }
}