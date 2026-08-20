import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

import { Exceptions } from '@/common/exceptions/exceptions';
import { getPagination } from '@/common/database/pagination';
import { ApiResponse } from '@/common/responses/api-response';
import { getPaginationResponse } from '@/common/database/pagination-response';

import { FloristMapper } from './mappers/florist.mapper';
import { FloristQueryDto } from './query/florist-query.dto';
import { CreateFloristDto } from './dto/create-florist.dto';
import { FloristResponseDto } from './dto/florist-response.dto';
import { FLORIST_MESSAGES } from './constants/florist.messages';
import { UpdateFloristDto } from './dto/update-florist.dto';

import { GeocodingService } from '@/geocoding/geocoding.service';

import { UserRole } from '@prisma/client';

@Injectable()
export class FloristsService {
    constructor(
        private readonly prisma: PrismaService,

        private readonly floristMapper:
            FloristMapper,

        private readonly geocodingService:
            GeocodingService,
    ) { }

    async findAll(
        query: FloristQueryDto,
    ) {
        const where = {
            deletedAt: null,

            ...(query.search && {
                OR: [
                    {
                        name: {
                            contains:
                                query.search,

                            mode:
                                'insensitive' as const,
                        },
                    },
                ],
            }),
        };

        const orderBy = query.sort
            ? {
                [query.sort]:
                    query.order,
            }
            : {
                name:
                    'asc' as const,
            };

        const florists =
            await this.prisma.florist.findMany({
                where,

                include: {
                    address: true,
                },

                orderBy,

                ...getPagination(
                    query.page,
                    query.pageSize,
                ),
            });

        const total =
            await this.prisma.florist.count({
                where,
            });

        return ApiResponse.paginated(
            this.floristMapper.toResponses(
                florists,
            ),

            getPaginationResponse(
                query.page,
                query.pageSize,
                total,
            ),
        );
    }

    async findOne(
        id: number,
    ) {
        /*
         * findOne needs the florist admins,
         * unlike the lighter queries.
         */
        const florist =
            await this.getFloristWithAdminsOrThrow(
                id,
            );

        return ApiResponse.success(
            this.floristMapper.toResponse(
                florist,
            ),
        );
    }

    async create(
        createFloristDto: CreateFloristDto,
    ): Promise<FloristResponseDto> {
        const exists =
            await this.prisma.florist.findFirst({
                where: {
                    deletedAt: null,

                    OR: [
                        {
                            taxNumber:
                                createFloristDto
                                    .taxNumber,
                        },

                        {
                            email:
                                createFloristDto
                                    .email,
                        },
                    ],
                },
            });

        if (exists) {
            Exceptions.conflict(
                FLORIST_MESSAGES
                    .ALREADY_EXISTS,
            );
        }

        /*
         * Geocode florist address.
         *
         * Latitude and longitude are generated
         * by the backend and are not provided
         * by the client.
         */
        const coordinates =
            await this.geocodingService
                .geocodeAddress({
                    street:
                        createFloristDto
                            .address
                            .street,

                    street2:
                        createFloristDto
                            .address
                            .street2,

                    postalCode:
                        createFloristDto
                            .address
                            .postalCode,

                    city:
                        createFloristDto
                            .address
                            .city,

                    district:
                        createFloristDto
                            .address
                            .district,

                    countryCode:
                        createFloristDto
                            .address
                            .countryCode,
                });

        const florist =
            await this.prisma.$transaction(
                async (tx) => {
                    const address =
                        await tx.address.create({
                            data: {
                                ...createFloristDto
                                    .address,

                                latitude:
                                    coordinates
                                        .latitude,

                                longitude:
                                    coordinates
                                        .longitude,
                            },
                        });

                    return tx.florist.create({
                        data: {
                            name:
                                createFloristDto
                                    .name,

                            legalName:
                                createFloristDto
                                    .legalName,

                            taxNumber:
                                createFloristDto
                                    .taxNumber,

                            email:
                                createFloristDto
                                    .email,

                            phone:
                                createFloristDto
                                    .phone,

                            website:
                                createFloristDto
                                    .website,

                            description:
                                createFloristDto
                                    .description,

                            deliveryRadiusKm:
                                createFloristDto
                                    .deliveryRadiusKm,

                            addressId:
                                address.id,
                        },

                        include: {
                            address: true,
                        },
                    });
                },
            );

        return this.floristMapper.toResponse(
            florist,
        );
    }

    async update(
        id: number,
        dto: UpdateFloristDto,
    ) {
        /*
         * Lightweight query.
         *
         * No admins are loaded because update
         * does not need them.
         */
        const florist =
            await this.getFloristOrThrow(
                id,
            );

        const exists =
            await this.prisma.florist.findFirst({
                where: {
                    deletedAt: null,

                    id: {
                        not: id,
                    },

                    OR: [
                        ...(dto.email
                            ? [
                                {
                                    email:
                                        dto.email,
                                },
                            ]
                            : []),

                        ...(dto.taxNumber
                            ? [
                                {
                                    taxNumber:
                                        dto.taxNumber,
                                },
                            ]
                            : []),
                    ],
                },
            });

        if (exists) {
            Exceptions.conflict(
                FLORIST_MESSAGES
                    .ALREADY_EXISTS,
            );
        }

        const {
            address,
            ...floristData
        } = dto;

        let coordinates:
            | {
                latitude: number;
                longitude: number;
            }
            | undefined;

        /*
         * Re-geocode only when the address
         * is being changed.
         */
        if (address) {
            const finalAddress = {
                street:
                    address.street ??
                    florist.address.street,

                street2:
                    address.street2 ??
                    florist.address.street2,

                postalCode:
                    address.postalCode ??
                    florist.address.postalCode,

                city:
                    address.city ??
                    florist.address.city,

                district:
                    address.district ??
                    florist.address.district,

                countryCode:
                    (
                        address.countryCode ??
                        florist.address
                            .countryCode
                    ).toUpperCase(),
            };

            coordinates =
                await this.geocodingService
                    .geocodeAddress(
                        finalAddress,
                    );
        }

        const updatedFlorist =
            await this.prisma.$transaction(
                async (tx) => {
                    if (address) {
                        await tx.address.update({
                            where: {
                                id:
                                    florist
                                        .address
                                        .id,
                            },

                            data: {
                                ...address,

                                ...(coordinates && {
                                    latitude:
                                        coordinates
                                            .latitude,

                                    longitude:
                                        coordinates
                                            .longitude,
                                }),
                            },
                        });
                    }

                    return tx.florist.update({
                        where: {
                            id,
                        },

                        data:
                            floristData,

                        include: {
                            address: true,
                        },
                    });
                },
            );

        return ApiResponse.success(
            this.floristMapper.toResponse(
                updatedFlorist,
            ),

            FLORIST_MESSAGES.UPDATED,
        );
    }

    async remove(
        id: number,
    ) {
        /*
         * Lightweight query.
         *
         * No admins are loaded because remove
         * does not need them.
         */
        await this.getFloristOrThrow(
            id,
        );

        await this.prisma.florist.update({
            where: {
                id,
            },

            data: {
                active:
                    false,

                deletedAt:
                    new Date(),
            },
        });

        return ApiResponse.success(
            null,

            FLORIST_MESSAGES.DELETED,
        );
    }

    /*
     * Lightweight florist lookup.
     *
     * Used by update/remove and other operations
     * that do not need the florist admins.
     */
    private async getFloristOrThrow(
        id: number,
    ) {
        const florist =
            await this.prisma.florist.findFirst({
                where: {
                    id,

                    deletedAt: null,
                },

                include: {
                    address: true,
                },
            });

        if (!florist) {
            Exceptions.notFound(
                FLORIST_MESSAGES.NOT_FOUND,
            );
        }

        return florist;
    }

    /*
     * Full florist lookup for findOne.
     *
     * Includes the florist administrators.
     */
    private async getFloristWithAdminsOrThrow(
        id: number,
    ) {
        const florist =
            await this.prisma.florist.findFirst({
                where: {
                    id,

                    deletedAt: null,
                },

                include: {
                    address: true,

                    users: {
                        where: {
                            deletedAt:
                                null,

                            role:
                                UserRole.FLORIST,
                        },

                        select: {
                            id:
                                true,

                            firstName:
                                true,

                            lastName:
                                true,

                            email:
                                true,

                            phone:
                                true,

                            active:
                                true,

                            emailVerified:
                                true,

                            createdAt:
                                true,

                            updatedAt:
                                true,
                        },

                        orderBy: {
                            createdAt:
                                'asc',
                        },
                    },
                },
            });

        if (!florist) {
            Exceptions.notFound(
                FLORIST_MESSAGES.NOT_FOUND,
            );
        }

        return florist;
    }
}