import {
    Injectable,
    InternalServerErrorException,
    Logger,
    ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type GeocodeAddress = {
    street: string;
    streetNumber: string;
    street2?: string | null;
    postalCode: string;
    city: string;
    district?: string | null;
    countryCode: string;
};

export type Coordinates = {
    latitude: number;
    longitude: number;
};

type GoogleGeocodingResponse = {
    status: string;
    error_message?: string;
    results: Array<{
        geometry?: {
            location?: {
                lat?: number;
                lng?: number;
            };
        };
    }>;
};

@Injectable()
export class GoogleGeocodingService {
    private readonly logger = new Logger(GoogleGeocodingService.name);
    private readonly apiKey: string;

    constructor(configService: ConfigService) {
        this.apiKey = configService.getOrThrow<string>(
            'GOOGLE_MAPS_API_KEY',
        );
    }

    async geocode(address: GeocodeAddress): Promise<Coordinates | null> {
        const query = this.formatAddress(address);
        const url = new URL(
            'https://maps.googleapis.com/maps/api/geocode/json',
        );

        url.searchParams.set('address', query);
        url.searchParams.set('key', this.apiKey);

        let response: Response;

        Logger.log("url", url)

        try {
            response = await fetch(url);
        } catch (error) {
            this.logger.error('Google Geocoding request failed.', error);
            throw new ServiceUnavailableException(
                'The geocoding service is currently unavailable.',
            );
        }

        if (!response.ok) {
            this.logger.error(
                `Google Geocoding returned HTTP ${response.status}.`,
            );
            throw new ServiceUnavailableException(
                'The geocoding service is currently unavailable.',
            );
        }

        const payload =
            (await response.json()) as GoogleGeocodingResponse;

        if (payload.status === 'ZERO_RESULTS') {
            return null;
        }

        if (payload.status !== 'OK') {
            this.logger.error(
                `Google Geocoding returned status ${payload.status}.`,
            );
            throw new InternalServerErrorException(
                'Unable to geocode the address.',
            );
        }

        Logger.log("Payload", payload)

        const location = payload.results[0]?.geometry?.location;

        Logger.log("Location", location)

        if (
            !location ||
            !Number.isFinite(location.lat) ||
            !Number.isFinite(location.lng)
        ) {
            this.logger.error(
                'Google Geocoding returned an invalid location.',
            );
            throw new InternalServerErrorException(
                'Unable to geocode the address.',
            );
        }

        if (location.lat && location.lng)
            return { latitude: location.lat, longitude: location.lng };

        return null;
    }

    private formatAddress(address: GeocodeAddress): string {
        return [
            `${address.streetNumber.trim()} ${address.street.trim()}`,
            address.street2,
            `${address.postalCode.trim()} ${address.city.trim()}`,
            address.district,
            address.countryCode.trim().toUpperCase(),
        ]
            .filter((part): part is string => Boolean(part?.trim()))
            .join(", ");
    }
}
