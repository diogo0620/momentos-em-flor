import { Injectable } from '@nestjs/common';

import { AdminCreateTaxCodeDto } from './dtos/admin-create-tax-code.dto';
import { AdminUpdateTaxCodeDto } from './dtos/admin-update-tax-code.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Exceptions } from '@/common/exceptions/exceptions';
import { ERROR_MESSAGES } from '@/common/errors/error-messages';
import { Prisma } from '@prisma/client';
import { AdminTaxCodeResponseDto } from './dtos/admin-tax-code-response.dto';
import { ApiResponse } from '@/common/responses/api-response';
import { EntityIdResponseDto } from '@/common/responses/dto/entity-id-response.dto';
import { getPagination } from '@/common/database/pagination';
import { getPaginationResponse } from '@/common/database/pagination-response';
import { AdminTaxCodesMapper } from './mappers/admin-tax-codes.mapper';
import { AdminTaxCodeQueryDto } from './dtos/admin-tax-code-query.dto';


@Injectable()
export class AdminTaxCodesService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly mapper: AdminTaxCodesMapper,
    ) { }



    async findAll(query: AdminTaxCodeQueryDto) {
        const { page, pageSize, search, active, sort, order } = query;

        const where: Prisma.TaxCodeWhereInput = {
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            }),
            ...(active !== undefined && { active }),
        };

        const [taxCodes, total] = await Promise.all([
            this.prisma.taxCode.findMany({
                where,
                orderBy: { [sort]: order },
                ...getPagination(page, pageSize),
            }),
            this.prisma.taxCode.count({ where }),
        ]);

        return ApiResponse.paginated(
            this.mapper.toListResponse(taxCodes),
            getPaginationResponse(page, pageSize, total),
        );
    }


    async findOne(id: number): Promise<AdminTaxCodeResponseDto> {
        const taxCode = await this.prisma.taxCode.findUnique({
            where: { id },
        });

        if (!taxCode) {
            Exceptions.notFound(ERROR_MESSAGES.TAX_CODE_NOT_FOUND);
        }

        return ApiResponse.success(
            this.mapper.toDetailResponse(taxCode),
        );
    }

    async create(
        dto: AdminCreateTaxCodeDto,
    ): Promise<EntityIdResponseDto> {
        try {
            const taxCode = await this.prisma.taxCode.create({
                data: {
                    name: dto.name,
                    rate: dto.rate,
                    description: dto.description,
                    active: dto.active ?? true,
                },
            });

            return ApiResponse.success(
                this.mapper.toCreatedResponse(taxCode),
            );
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2002':
                        Exceptions.conflict(ERROR_MESSAGES.TAX_CODE_ALREADY_EXISTS);
                }
            }

            throw error;
        }
    }


    async update(
        id: number,
        dto: AdminUpdateTaxCodeDto,
    ): Promise<void> {
        try {
            await this.prisma.taxCode.update({
                where: { id },
                data: {
                    ...(dto.name !== undefined && {
                        name: dto.name,
                    }),
                    ...(dto.rate !== undefined && {
                        rate: dto.rate,
                    }),
                    ...(dto.description !== undefined && {
                        description: dto.description,
                    }),
                    ...(dto.active !== undefined && {
                        active: dto.active,
                    })
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2002':
                        Exceptions.conflict(ERROR_MESSAGES.TAX_CODE_ALREADY_EXISTS);
                    case 'P2025':
                        Exceptions.notFound(ERROR_MESSAGES.TAX_CODE_NOT_FOUND)
                }
            }

            throw error;
        }
    }


    async delete(id: number): Promise<void> {
        try {
            await this.prisma.taxCode.delete({
                where: { id },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2025':
                        Exceptions.notFound(ERROR_MESSAGES.TAX_CODE_NOT_FOUND);
                    case "P2003":
                        Exceptions.badRequest(ERROR_MESSAGES.TAX_CODE_IN_USE);
                }
            }

            throw error;
        }
    }
}