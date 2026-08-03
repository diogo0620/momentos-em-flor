import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

import { generateSlug } from '@/common/utils/slug';
import { Exceptions } from '@/common/exceptions/exceptions';
import { CATEGORY_MESSAGES } from '@/categories/constants/category.messages';
import { getPagination } from '@/common/database/pagination';
import { ApiResponse } from '@/common/responses/api-response';
import { getPaginationResponse } from '@/common/database/pagination-response';

import { FloristMapper } from './mappers/florist.mapper';
import { FloristQueryDto } from './query/florist-query.dto';
import { CreateFloristDto } from './dto/create-florist.dto';
import { FloristResponseDto } from './dto/florist-response.dto';
import { FLORIST_MESSAGES } from './constants/florist.messages';
import { UpdateFloristDto } from './dto/update-florist.dto';
import { ADDRESS_MESSAGES } from '@/addresses/constants/address.messages';

@Injectable()
export class FloristsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly floristMapper: FloristMapper,
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
                            contains: query.search,
                            mode: 'insensitive' as const,
                        },
                    }
                ],
            }),
        };

        const orderBy = query.sort
            ? { [query.sort]: query.order }
            : { name: 'asc' as const };

        const florists = await this.prisma.florist.findMany({
            where,
            include: {
                address: true,
            },
            orderBy,
            ...getPagination(query.page, query.pageSize),
        });

        const total = await this.prisma.florist.count({
            where,
        });

        return ApiResponse.paginated(
            this.floristMapper.toResponses(florists),
            getPaginationResponse(
                query.page,
                query.pageSize,
                total,
            ),
        );
    }

    async findOne(id: number) {
        const florist = await this.getFloristOrThrow(id);

        return ApiResponse.success(
            this.floristMapper.toResponse(florist),
        );
    }

    async create(createFloristDto: CreateFloristDto): Promise<FloristResponseDto> {
        const exists =
            await this.prisma.florist.findFirst({
                where: {
                    deletedAt: null,

                    OR: [
                        {
                            taxNumber:
                                createFloristDto.taxNumber,
                        },
                        {
                            email:
                                createFloristDto.email,
                        },
                    ],
                },
            });

        if (exists) {
            Exceptions.conflict(FLORIST_MESSAGES.ALREADY_EXISTS);
        }

        const florist = await this.prisma.$transaction(
            async (tx) => {
                const address = await tx.address.create({
                    data: createFloristDto.address,
                });

                return tx.florist.create({
                    data: {
                        name: createFloristDto.name,
                        legalName: createFloristDto.legalName,
                        taxNumber: createFloristDto.taxNumber,
                        email: createFloristDto.email,
                        phone: createFloristDto.phone,
                        website: createFloristDto.website,
                        description: createFloristDto.description,
                        deliveryRadiusKm:
                            createFloristDto.deliveryRadiusKm,

                        addressId: address.id,
                    },
                    include: {
                        address: true,
                    },
                });
            },
        );

        return this.floristMapper.toResponse(florist);
    }

    async update(
        id: number,
        dto: UpdateFloristDto,
    ) {
        const florist = await this.getFloristOrThrow(id);

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
                                    email: dto.email,
                                },
                            ]
                            : []),

                        ...(dto.taxNumber
                            ? [
                                {
                                    taxNumber: dto.taxNumber,
                                },
                            ]
                            : []),
                    ],
                },
            });

        if (exists) {
            Exceptions.conflict(
                FLORIST_MESSAGES.ALREADY_EXISTS,
            );
        }

        if (exists) {
            Exceptions.conflict(
                FLORIST_MESSAGES.ALREADY_EXISTS,
            );
        }

        const { address, ...floristData } = dto;

        const updatedFlorist =
            await this.prisma.$transaction(
                async (tx) => {

                    if (address) {
                        await tx.address.update({
                            where: {
                                id: florist.address.id,
                            },
                            data: address,
                        });
                    }

                    return tx.florist.update({
                        where: {
                            id,
                        },

                        data: floristData,

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

    async remove(id: number) {
        await this.getFloristOrThrow(id);

        await this.prisma.florist.update({
            where: {
                id,
            },
            data: {
                active: false,
                deletedAt: new Date(),
            },
        });

        return ApiResponse.success(
            null,
            FLORIST_MESSAGES.DELETED,
        );
    }

    private async getFloristOrThrow(
        id: number,
    ) {
        const florist = await this.prisma.florist.findFirst({
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

}