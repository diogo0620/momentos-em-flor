import { Injectable } from '@nestjs/common';

import { AdminCreateFloristDto } from './dtos/admin-create-florist.dto';
import { AdminUpdateFloristDto } from './dtos/admin-update-florist.dto';
import { AdminFloristQueryDto } from './dtos/admin-florist-query.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Exceptions } from '@/common/exceptions/exceptions';
import { ERROR_MESSAGES } from '@/common/errors/error-messages';
import { Prisma, UserRole } from '@prisma/client';
import { AdminFloristResponseDto } from './dtos/admin-florist-response.dto';
import { ApiResponse } from '@/common/responses/api-response';
import { AdminFloristsMapper } from './mappers/admin-florists.mapper';
import { EntityIdResponseDto } from '@/common/responses/dto/entity-id-response.dto';
import { getPagination } from '@/common/database/pagination';
import { getPaginationResponse } from '@/common/database/pagination-response';


@Injectable()
export class AdminFloristsService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly mapper: AdminFloristsMapper,
    ) { }



    async findAll(query: AdminFloristQueryDto) {
        const { page, pageSize, search, active, acceptingOrders, addressDistrict, sort, order } = query;

        const where: Prisma.FloristWhereInput = {
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { legalName: { contains: search, mode: 'insensitive' } },
                    { taxNumber: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ],
            }),
            ...(active !== undefined && { active }),
            ...(acceptingOrders !== undefined && { acceptingOrders }),
            ...(addressDistrict !== undefined && { addressDistrict }),
        };

        const [florists, total] = await Promise.all([
            this.prisma.florist.findMany({
                where,
                orderBy: { [sort]: order },
                ...getPagination(page, pageSize),
            }),
            this.prisma.florist.count({ where }),
        ]);

        return ApiResponse.paginated(
            this.mapper.toListResponse(florists),
            getPaginationResponse(page, pageSize, total),
        );
    }


    async findOne(id: number): Promise<AdminFloristResponseDto> {
        const florist = await this.prisma.florist.findUnique({
            where: { id },
            include: {
                users: {
                    where: {
                        floristId: id,
                        role: UserRole.FLORIST
                    },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        active: true
                    }
                }
            }
        });

        if (!florist) {
            Exceptions.notFound(ERROR_MESSAGES.FLORIST_NOT_FOUND);
        }

        return ApiResponse.success(
            this.mapper.toDetailResponse(florist),
        );
    }

    async create(
        dto: AdminCreateFloristDto,
    ): Promise<EntityIdResponseDto> {
        try {
            const florist = await this.prisma.florist.create({
                data: {
                    name: dto.name,
                    legalName: dto.legalName,
                    taxNumber: dto.taxNumber,
                    email: dto.email,
                    phone: dto.phone,
                    website: dto.website,
                    description: dto.description,
                    addressStreet: dto.addressStreet,
                    addressStreetNumber: dto.addressStreetNumber,
                    addressStreet2: dto.addressStreet2,
                    addressPostalCode: dto.addressPostalCode,
                    addressCity: dto.addressCity,
                    addressDistrict: dto.addressDistrict,
                    addressCountryCode: dto.addressCountryCode,
                    deliveryRadiusKm: dto.deliveryRadiusKm,
                    acceptingOrders: dto.acceptingOrders ?? true,
                    active: dto.active ?? true
                },
            });

            return ApiResponse.success(
                this.mapper.toCreatedResponse(florist),
            );
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2002':
                        Exceptions.conflict(ERROR_MESSAGES.FLORIST_ALREADY_EXISTS);
                    //case 'P2003':
                    //Exceptions.badRequest(ERROR_MESSAGES.INVALID_FLORIST_REFERENCE);
                }
            }

            throw error;
        }
    }


    async update(
        id: number,
        dto: AdminUpdateFloristDto,
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


    async delete(id: number): Promise<void> {
        try {
            await this.prisma.florist.delete({
                where: { id },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2025':
                        Exceptions.notFound(ERROR_MESSAGES.FLORIST_NOT_FOUND);
                }
            }

            throw error;
        }
    }
}