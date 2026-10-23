import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { Exceptions } from '@/common/exceptions/exceptions';
import { ERROR_MESSAGES } from '@/common/errors/error-messages';
import { Prisma } from '@prisma/client';
import { PublicProductResponseDto } from './dtos/public-product-response.dto';
import { ApiResponse } from '@/common/responses/api-response';
import { PublicProductsMapper } from './mappers/public-products.mapper';
import { getPagination } from '@/common/database/pagination';
import { getPaginationResponse } from '@/common/database/pagination-response';
import { PublicProductQueryDto } from './dtos/public-product-query.dto';
import { SupabaseStorageService } from '@/storage/supabase-storage.service';


@Injectable()
export class PublicProductsService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly mapper: PublicProductsMapper,
        private readonly storageService: SupabaseStorageService,
    ) { }



    async findAll(query: PublicProductQueryDto) {
        const { page, pageSize, search, sort, categoryId, type, featured, minPrice, maxPrice, order } = query;

        const where: Prisma.ProductWhereInput = {
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { slug: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            }),
            active: true,
            ...(type !== undefined && { type }),
            ...(featured !== undefined && { featured }),
            ...(categoryId !== undefined && { categories: { some: { id: categoryId, } } }),
            ...(minPrice !== undefined || maxPrice !== undefined ? {customerPrice: {...(minPrice !== undefined && {gte: minPrice}),...(maxPrice !== undefined && {lte: maxPrice})},
      }
    : {}),
        };

        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                orderBy: { [sort]: order },
                ...getPagination(page, pageSize),
                include: { images: { where: { isPrimary: true }, take: 1 } },
            }),
            this.prisma.product.count({ where }),
        ]);

        return ApiResponse.paginated(
            this.mapper.toListResponse(products),
            getPaginationResponse(page, pageSize, total),
        );
    }


    async findOne(slug: string): Promise<PublicProductResponseDto> {
        const product = await this.prisma.product.findUnique({
            where: { slug, active: true },
            include: {
                categories: { select: { id: true, name: true }, where: { active: true } },
                components: { where: { active: true }, orderBy: { sortOrder: 'asc' } },
                variants: { where: { active: true }, orderBy: { sortOrder: 'asc', } },
                images: { orderBy: [{isPrimary: 'desc'}, {sortOrder: 'asc'} ] },
            },
        });

        if (!product) {
            Exceptions.notFound(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
        }

        return ApiResponse.success(
            this.mapper.toDetailResponse(product),
        );
    }


}