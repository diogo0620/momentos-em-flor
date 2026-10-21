
import { Injectable } from '@nestjs/common';

import { Florist } from '@prisma/client';

import { FloristFloristResponseDto } from '../dtos/florist-florist-response.dto';



@Injectable()
export class FloristFloristsMapper{
    toDetailResponse(florist: Florist): FloristFloristResponseDto {
        return {
            id: florist.id,
            name: florist.name,
            legalName: florist.legalName ?? undefined,
            taxNumber: florist.taxNumber,
            email: florist.email,
            phone: florist.phone,
            website: florist.website ?? undefined,
            description: florist.description ?? undefined,
            addressStreet: florist.addressStreet,
            addressStreetNumber: florist.addressStreetNumber,
            addressStreet2: florist.addressStreet2 ?? undefined,
            addressPostalCode: florist.addressPostalCode,
            addressCity: florist.addressCity,
            addressDistrict: florist.addressDistrict,
            addressCountryCode: florist.addressCountryCode,
            addressLatitude: florist.addressLatitude?.toNumber(),
            addressLongitude: florist.addressLongitude?.toNumber(),
            deliveryRadiusKm: florist.deliveryRadiusKm.toNumber(),
            acceptingOrders: florist.acceptingOrders,
            active: florist.active,
            createdAt: florist.createdAt,
            updatedAt: florist.updatedAt,
        };
    }

}
