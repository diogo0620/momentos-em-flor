import {
    Injectable,
} from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

import {
    Exceptions,
} from '@/common/exceptions/exceptions';

import {
    ApiResponse,
} from '@/common/responses/api-response';

import {
    TaxCodeMapper,
} from './mappers/tax-code.mapper';

import {
    CreateTaxCodeDto,
} from './dto/create-tax-code.dto';

import {
    UpdateTaxCodeDto,
} from './dto/update-tax-code.dto';

import {
    TAX_CODE_MESSAGES,
} from './constants/tax-code.messages';

@Injectable()
export class TaxCodesService {

    constructor(
        private readonly prisma:
            PrismaService,

        private readonly taxCodeMapper:
            TaxCodeMapper,
    ) {}


    /*
     * Find all tax codes
     */
    async findAll() {

        const taxCodes =
            await this.prisma.taxCode.findMany({

                where: {
                    deletedAt: null,
                },

                orderBy: [
                    {
                        active: 'desc',
                    },
                    {
                        rate: 'asc',
                    },
                    {
                        name: 'asc',
                    },
                ],
            });


        return ApiResponse.success(
            this.taxCodeMapper.toResponses(
                taxCodes,
            ),
        );
    }


    /*
     * Find one tax code
     */
    async findOne(
        id: number,
    ) {

        const taxCode =
            await this.getTaxCodeOrThrow(id);


        return ApiResponse.success(
            this.taxCodeMapper.toResponse(
                taxCode,
            ),
        );
    }


    /*
     * Create tax code
     */
    async create(
        dto: CreateTaxCodeDto,
    ) {

        const code =
            dto.code
                .trim()
                .toUpperCase();


        /*
         * Check duplicate code
         */
        const exists =
            await this.prisma.taxCode.findFirst({
                where: {
                    code,

                    deletedAt: null,
                },
            });


        if (exists) {
            Exceptions.conflict(
                TAX_CODE_MESSAGES.ALREADY_EXISTS,
            );
        }


        /*
         * Validate rate
         */
        if (
            dto.rate < 0 ||
            dto.rate > 100
        ) {
            Exceptions.badRequest(
                TAX_CODE_MESSAGES.RATE_INVALID,
            );
        }


        /*
         * Create
         */
        const taxCode =
            await this.prisma.taxCode.create({

                data: {
                    code,

                    name:
                        dto.name.trim(),

                    rate:
                        dto.rate,
                },
            });


        return ApiResponse.success(
            this.taxCodeMapper.toResponse(
                taxCode,
            ),

            TAX_CODE_MESSAGES.CREATED,
        );
    }


    /*
     * Update tax code
     */
    async update(
        id: number,
        dto: UpdateTaxCodeDto,
    ) {

        const currentTaxCode =
            await this.getTaxCodeOrThrow(id);


        /*
         * Validate rate
         */
        if (
            dto.rate !== undefined &&
            (
                dto.rate < 0 ||
                dto.rate > 100
            )
        ) {
            Exceptions.badRequest(
                TAX_CODE_MESSAGES.RATE_INVALID,
            );
        }


        /*
         * Check duplicate code
         */
        const code =
            dto.code !== undefined
                ? dto.code
                    .trim()
                    .toUpperCase()
                : undefined;


        if (code !== undefined) {

            const exists =
                await this.prisma.taxCode.findFirst({
                    where: {

                        code,

                        id: {
                            not: id,
                        },

                        deletedAt: null,
                    },
                });


            if (exists) {
                Exceptions.conflict(
                    TAX_CODE_MESSAGES
                        .ALREADY_EXISTS,
                );
            }
        }


        /*
         * Check if tax code is being
         * deactivated.
         */
        if (
            dto.active === false &&
            currentTaxCode.active
        ) {

            await this.ensureNotInUse(id);
        }


        /*
         * Update
         */
        const taxCode =
            await this.prisma.taxCode.update({

                where: {
                    id,
                },

                data: {

                    ...(code !== undefined && {
                        code,
                    }),

                    ...(dto.name !== undefined && {
                        name:
                            dto.name.trim(),
                    }),

                    ...(dto.rate !== undefined && {
                        rate:
                            dto.rate,
                    }),

                    ...(dto.active !== undefined && {
                        active:
                            dto.active,
                    }),
                },
            });


        return ApiResponse.success(
            this.taxCodeMapper.toResponse(
                taxCode,
            ),

            TAX_CODE_MESSAGES.UPDATED,
        );
    }


    /*
     * Delete tax code
     *
     * Soft delete.
     */
    async remove(
        id: number,
    ) {

        await this.getTaxCodeOrThrow(id);


        /*
         * A tax code cannot be deleted
         * while active products use it.
         */
        await this.ensureNotInUse(id);


        await this.prisma.taxCode.update({

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

            TAX_CODE_MESSAGES.DELETED,
        );
    }


    /*
     * Get tax code or throw
     */
    private async getTaxCodeOrThrow(
        id: number,
    ) {

        const taxCode =
            await this.prisma.taxCode.findFirst({

                where: {

                    id,

                    deletedAt: null,
                },
            });


        if (!taxCode) {
            Exceptions.notFound(
                TAX_CODE_MESSAGES.NOT_FOUND,
            );
        }


        return taxCode;
    }


    /*
     * Ensure tax code is not being
     * used by active products.
     */
    private async ensureNotInUse(
        taxCodeId: number,
    ) {

        const product =
            await this.prisma.product.findFirst({

                where: {

                    taxCodeId,

                    active: true,

                    deletedAt: null,
                },

                select: {
                    id: true,
                },
            });


        if (product) {
            Exceptions.badRequest(
                TAX_CODE_MESSAGES.IN_USE,
            );
        }
    }
}