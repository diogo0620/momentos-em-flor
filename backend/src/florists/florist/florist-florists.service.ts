import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { Exceptions } from '@/common/exceptions/exceptions';
import { ERROR_MESSAGES } from '@/common/errors/error-messages';
import { Prisma } from '@prisma/client';
import { ApiResponse } from '@/common/responses/api-response';
import { FloristFloristsMapper } from './mappers/florist-florists.mapper';
import { FloristUpdateFloristDto } from './dtos/florist-update-florist.dto';
import { FloristFloristResponseDto } from './dtos/florist-florist-response.dto';


@Injectable()
export class FloristFloristsService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly mapper: FloristFloristsMapper,
    ) { }


    async findOne(id: number): Promise<FloristFloristResponseDto> {
        const florist = await this.prisma.florist.findUnique({
            where: { id }
        });

        if (!florist) {
            Exceptions.notFound(ERROR_MESSAGES.FLORIST_NOT_FOUND);
        }

        return ApiResponse.success(
            this.mapper.toDetailResponse(florist),
        );
    }



    async update(
        id: number,
        dto: FloristUpdateFloristDto,
    ): Promise<void> {
        try {
            await this.prisma.florist.update({
                where: { id },
                data: {
                    ...(dto.name !== undefined && {
                        name: dto.name,
                    }),
                    ...(dto.legalName !== undefined && {
                        legalName: dto.legalName,
                    }),
                    ...(dto.taxNumber !== undefined && {
                        taxNumber: dto.taxNumber,
                    }),
                    ...(dto.email !== undefined && {
                        email: dto.email,
                    }),
                    ...(dto.phone !== undefined && {
                        phone: dto.phone,
                    }),
                    ...(dto.website !== undefined && {
                        website: dto.website,
                    }),
                    ...(dto.description !== undefined && {
                        description: dto.description,
                    }),
                    ...(dto.addressStreet !== undefined && {
                        addressStreet: dto.addressStreet,
                    }),
                    ...(dto.addressStreetNumber !== undefined && {
                        addressStreetNumber: dto.addressStreetNumber,
                    }),
                    ...(dto.addressStreet2 !== undefined && {
                        addressStreet2: dto.addressStreet2,
                    }),
                    ...(dto.addressPostalCode !== undefined && {
                        addressPostalCode: dto.addressPostalCode,
                    }),
                    ...(dto.addressCity !== undefined && {
                        addressCity: dto.addressCity,
                    }),
                    ...(dto.addressDistrict !== undefined && {
                        addressDistrict: dto.addressDistrict,
                    }),
                    ...(dto.addressCountryCode !== undefined && {
                        addressCountryCode: dto.addressCountryCode,
                    }),
                    ...(dto.deliveryRadiusKm !== undefined && {
                        deliveryRadiusKm: dto.deliveryRadiusKm,
                    }),
                    ...(dto.acceptingOrders !== undefined && {
                        acceptingOrders: dto.acceptingOrders,
                    }),
                    ...(dto.active !== undefined && {
                        active: dto.active,
                    }),
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2002':
                        Exceptions.conflict(ERROR_MESSAGES.FLORIST_ALREADY_EXISTS);
                    case 'P2025':
                        Exceptions.notFound(ERROR_MESSAGES.FLORIST_NOT_FOUND)
                }
            }

            throw error;
        }
    }
}