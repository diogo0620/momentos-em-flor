import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

export interface GeocodeAddressInput {
    street: string;
    street2?: string | null;
    postalCode: string;
    city: string;
    district?: string | null;
    countryCode: string;
}

export interface GeocodeResult {
    latitude: number;
    longitude: number;
}

@Injectable()
export class GeocodingService {
    constructor(
        private readonly configService:
            ConfigService,
    ) { }

    async geocodeAddress(
    address: GeocodeAddressInput,
): Promise<GeocodeResult> {
    const apiKey =
        this.configService.get<string>(
            'GOOGLE_MAPS_API_KEY',
        );

    if (!apiKey) {
        throw new InternalServerErrorException(
            'Google Maps API key is not configured.',
        );
    }

    const addressQuery = [
        address.street,
        address.street2,
        address.postalCode,
        address.city,
        address.district,
        'Portugal',
    ]
        .filter(Boolean)
        .join(', ');

    const encodedAddress =
        encodeURIComponent(addressQuery);

    const url =
        `https://geocode.googleapis.com/v4/geocode/address/${encodedAddress}`;

    console.debug(
        'Geocoding address:',
        addressQuery,
    );

    const response = await fetch(
        url,
        {
            method: 'GET',
            headers: {
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask':
                    'results.location,results.formattedAddress,results.granularity,results.placeId',
            },
        },
    );

    if (!response.ok) {
        const errorBody =
            await response.text();

        console.error(
            'Google Geocoding API error:',
            response.status,
            errorBody,
        );

        throw new InternalServerErrorException(
            'Unable to geocode address.',
        );
    }

    const data = await response.json();

    console.debug(
        'Google Geocoding response:',
        JSON.stringify(data, null, 2),
    );

    const results = data.results;

    if (
        !Array.isArray(results) ||
        results.length === 0
    ) {
        throw new BadRequestException(
            'Unable to determine coordinates for the provided address.',
        );
    }

    const result = results[0];

    if (!result?.location) {
        throw new BadRequestException(
            'Unable to determine coordinates for the provided address.',
        );
    }

    console.debug(
        'Selected geocoding result:',
        {
            formattedAddress:
                result.formattedAddress,

            granularity:
                result.granularity,

            placeId:
                result.placeId,

            latitude:
                result.location.latitude,

            longitude:
                result.location.longitude,
        },
    );

    return {
        latitude:
            result.location.latitude,

        longitude:
            result.location.longitude,
    };
}
}