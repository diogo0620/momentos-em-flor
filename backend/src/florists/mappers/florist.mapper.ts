import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { BaseMapper } from '@/common/mappers/base.mapper';

import { FloristResponseDto } from '../dto/florist-response.dto';
import { AddressMapper } from '@/addresses/mappers/address.mapper';

type FloristWithAddress =
    Prisma.FloristGetPayload<{
        include: {
            address: true;
        };
    }>;

@Injectable()
export class FloristMapper
    extends BaseMapper<
        FloristWithAddress,
        FloristResponseDto
    > {

    constructor(
        private readonly addressMapper: AddressMapper,
    ) {
        super();
    }

    toResponse(
        florist: FloristWithAddress,
    ): FloristResponseDto {
        return {
            id: florist.id,
            name: florist.name,
            legalName: florist.legalName ?? undefined,
            taxNumber: florist.taxNumber,
            email: florist.email,
            phone: florist.phone,
            website: florist.website ?? undefined,
            description: florist.description ?? undefined,
            active: florist.active,
            acceptingOrders: florist.acceptingOrders,
            deliveryRadiusKm: florist.deliveryRadiusKm.toNumber(),
            address: this.addressMapper.toResponse(
                florist.address,
            ),
            createdAt: florist.createdAt,
            updatedAt: florist.updatedAt,
        };
    }
}