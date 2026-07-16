import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { getPagination } from '@/common/database/pagination';
import { getPaginationResponse } from '@/common/database/pagination-response';
import { ApiResponse } from '@/common/responses/api-response';
import { generateSlug } from '@/common/utils/slug';

import { CategoryQueryDto } from './query/category-query.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CATEGORY_MESSAGES } from './constants/category.messages';
import { Exceptions } from '@/common/exceptions/exceptions';
import { CategoryMapper } from './mappers/category.mapper';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: CategoryMapper,
  ) { }

  async findAll(query: CategoryQueryDto) {
    const where = {
      ...(query.search && {
        OR: [
          {
            name: {
              contains: query.search,
              mode: 'insensitive' as const,
            },
          },
          {
            slug: {
              contains: query.search,
              mode: 'insensitive' as const,
            },
          },
        ],
      }),
    };

    const orderBy = query.sort
      ? { [query.sort]: query.order }
      : { name: 'asc' as const };

    const categories = await this.prisma.category.findMany({
      where,
      orderBy,
      ...getPagination(query.page, query.pageSize),
    });

    const total = await this.prisma.category.count({
      where,
    });

    return ApiResponse.paginated(
      this.mapper.toResponses(categories),
      getPaginationResponse(
        query.page,
        query.pageSize,
        total,
      ),
    );
  }

  async findOne(id: number) {
    const category = await this.getCategoryOrThrow(id);

    return ApiResponse.success(
      this.mapper.toResponse(category),
    );
  }

  async findBySlug(slug: string) {
    const category =
      await this.prisma.category.findUnique({
        where: {
            slug
        },
      });

    if (!category) {
      Exceptions.notFound(
        CATEGORY_MESSAGES.NOT_FOUND,
      );
    }

    return ApiResponse.success(
      this.mapper.toResponse(category),
    );
  }

  async create(dto: CreateCategoryDto) {
    const slug = this.buildSlug(dto.name);

    const exists =
      await this.prisma.category.findFirst({
        where: {
          OR: [
            {
              name: dto.name,
            },
            {
              slug,
            },
          ],
        },
      });

    if (exists) {
      Exceptions.conflict(
        CATEGORY_MESSAGES.ALREADY_EXISTS,
      );
    }

    const category =
      await this.prisma.category.create({
        data: {
          ...dto,
          slug,
        },
      });

    return ApiResponse.success(
      this.mapper.toResponse(category),
      CATEGORY_MESSAGES.CREATED,
    );
  }

  async update(
    id: number,
    dto: UpdateCategoryDto,
  ) {
    await this.getCategoryOrThrow(id);

    const slug = dto.name
      ? this.buildSlug(dto.name)
      : undefined;

    const exists =
      await this.prisma.category.findFirst({
        where: {
          id: {
            not: id,
          },

          OR: [
            ...(dto.name
              ? [
                {
                  name: dto.name,
                },
              ]
              : []),

            ...(slug
              ? [
                {
                  slug,
                },
              ]
              : []),
          ],
        },
      });

    if (exists) {
      Exceptions.conflict(
        CATEGORY_MESSAGES.ALREADY_EXISTS,
      );
    }

    const category =
      await this.prisma.category.update({
        where: {
          id,
        },
        data: {
          ...dto,
          ...(slug && { slug }),
        },
      });

    return ApiResponse.success(
      this.mapper.toResponse(category),
      CATEGORY_MESSAGES.UPDATED,
    );
  }

  async remove(id: number) {
    await this.getCategoryOrThrow(id);

    await this.prisma.category.delete({
      where: {
        id,
      },
    });

    return ApiResponse.success(
      null,
      CATEGORY_MESSAGES.DELETED,
    );
  }

  private async getCategoryOrThrow(
    id: number,
  ) {
    const category =
      await this.prisma.category.findFirst({
        where: {
          id
        },
      });

    if (!category) {
      Exceptions.notFound(
        CATEGORY_MESSAGES.NOT_FOUND,
      );
    }

    return category;
  }

  private buildSlug(
    name: string,
  ) {
    return generateSlug(name);
  }
}