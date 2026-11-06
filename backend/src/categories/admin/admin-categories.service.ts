import { Injectable, Logger } from '@nestjs/common';

import { AdminCreateCategoryDto } from './dtos/admin-create-category.dto';
import { AdminUpdateCategoryDto } from './dtos/admin-update-category.dto';
import { AdminCategoryQueryDto } from './dtos/admin-category-query.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Exceptions } from '@/common/exceptions/exceptions';
import { ERROR_MESSAGES } from '@/common/errors/error-messages';
import { Prisma } from '@prisma/client';
import { AdminCategoryResponseDto } from './dtos/admin-category-response.dto';
import { ApiResponse } from '@/common/responses/api-response';
import { AdminCategoriesMapper } from './mappers/admin-categories.mapper';
import { EntityIdResponseDto } from '@/common/responses/dto/entity-id-response.dto';
import { getPagination } from '@/common/database/pagination';
import { getPaginationResponse } from '@/common/database/pagination-response';


@Injectable()
export class AdminCategoriesService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly mapper: AdminCategoriesMapper,
    ) { }



    async findAll(query: AdminCategoryQueryDto) {
        const { page, pageSize, search, active, sort, featured, order } = query;

        const where: Prisma.CategoryWhereInput = {
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { slug: { contains: search, mode: 'insensitive' } },
                ],
            }),
            ...(active !== undefined && { active }),
            ...(featured !== undefined && { featured }),
        };

        const [categories, total] = await Promise.all([
            this.prisma.category.findMany({
                where,
                orderBy: { [sort]: order },
                ...getPagination(page, pageSize),
            }),
            this.prisma.category.count({ where }),
        ]);

        return ApiResponse.paginated(
            this.mapper.toListResponse(categories),
            getPaginationResponse(page, pageSize, total),
        );
    }


    async findOne(id: number): Promise<AdminCategoryResponseDto> {
        const category = await this.prisma.category.findUnique({
            where: { id },
        });

        if (!category) {
            Exceptions.notFound(ERROR_MESSAGES.CATEGORY_NOT_FOUND);
        }

        return ApiResponse.success(
            this.mapper.toDetailResponse(category),
        );
    }

    async create(
        dto: AdminCreateCategoryDto,
    ): Promise<EntityIdResponseDto> {
        try {
            const category = await this.prisma.category.create({
                data: {
                    name: dto.name,
                    slug: dto.slug,
                    description: dto.description,
                    featured: dto.featured,
                    active: dto.active ?? true,
                },
            });

            return ApiResponse.success(
                this.mapper.toCreatedResponse(category),
            );
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2002':
                        Exceptions.conflict(ERROR_MESSAGES.CATEGORY_ALREADY_EXISTS);
                    //case 'P2003':
                    //Exceptions.badRequest(ERROR_MESSAGES.INVALID_CATEGORY_REFERENCE);
                }
            }

            throw error;
        }
    }


    async update(
        id: number,
        dto: AdminUpdateCategoryDto,
    ): Promise<void> {
        try {
            Logger.log("update", dto)
            await this.prisma.category.update({
                where: { id },
                data: {
                    ...(dto.name !== undefined && {
                        name: dto.name,
                    }),
                    ...(dto.slug !== undefined && {
                        slug: dto.slug,
                    }),
                    ...(dto.description !== undefined && {
                        description: dto.description,
                    }),
                    ...(dto.featured !== undefined && {
                        featured: dto.featured,
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
                        Exceptions.conflict(ERROR_MESSAGES.CATEGORY_ALREADY_EXISTS);
                    case 'P2025':
                        Exceptions.notFound(ERROR_MESSAGES.CATEGORY_NOT_FOUND)
                }
            }

            throw error;
        }
    }


    async delete(id: number): Promise<void> {
        try {
            await this.prisma.category.delete({
                where: { id },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2025':
                        Exceptions.notFound(ERROR_MESSAGES.CATEGORY_NOT_FOUND);
                }
            }

            throw error;
        }
    }
}