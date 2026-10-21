
import { Injectable } from '@nestjs/common';

import { BaseMapper } from '@/common/mappers/base.mapper';
import { Florist, Prisma } from '@prisma/client';

import { AdminFloristResponseDto } from '../dtos/admin-florist-response.dto';
import { AdminFloristListResponseDto } from '../dtos/admin-florist-list-response.dto';

type FloristWithUsers = Prisma.FloristGetPayload<{
    include: {
        users: {
            select: {
                id: true;
                firstName: true;
                lastName: true;
                email: true;
                active: true;
            };
        };
    };
}>;

@Injectable()
export class AdminFloristsMapper extends BaseMapper<
    Florist,
    AdminFloristResponseDto,
    AdminFloristListResponseDto
> {
    toDetailResponse(florist: FloristWithUsers): AdminFloristResponseDto {
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
            admins: florist.users.map((user) => ({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                active: user.active,
            })),
            active: florist.active,
            createdAt: florist.createdAt,
            updatedAt: florist.updatedAt,
        };
    }

    protected toListItemResponse(
        florist: Florist,
    ): AdminFloristListResponseDto {
        return {
            id: florist.id,
            name: florist.name,
            addressCity: florist.addressCity,
            addressDistrict: florist.addressDistrict,
            acceptingOrders: florist.acceptingOrders,
            active: florist.active
        };
    }
}
