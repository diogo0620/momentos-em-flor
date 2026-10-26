import { Injectable } from '@nestjs/common';

import { PublicCategoryQueryDto } from './dtos/public-category-query.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ApiResponse } from '@/common/responses/api-response';
import { getPagination } from '@/common/database/pagination';
import { getPaginationResponse } from '@/common/database/pagination-response';
import { PublicCategoriesMapper } from './mappers/public-categories.mapper';


@Injectable()
export class PublicCategoriesService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly mapper: PublicCategoriesMapper,
    ) { }



    async findAll(query: PublicCategoryQueryDto) {
        const { page, pageSize, search, sort, featured, order } = query;

        const where: Prisma.CategoryWhereInput = {
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { slug: { contains: search, mode: 'insensitive' } },
                ],
            }),
            active: true,
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






}