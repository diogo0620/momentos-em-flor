import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { getPagination } from '@/common/database/pagination';
import { getPaginationResponse } from '@/common/database/pagination-response';
import { ApiResponse } from '@/common/responses/api-response';

import { CategoryQueryDto } from './query/category-query.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CATEGORY_MESSAGES } from './constants/category.messages';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll(query: CategoryQueryDto) {
  const where = query.search
    ? {
        name: {
          contains: query.search,
          mode: 'insensitive' as const,
        },
      }
    : {};

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
    CategoryResponseDto.fromEntities(categories),
    getPaginationResponse(
      query.page,
      query.pageSize,
      total,
    ),
  );
}

  async findOne(id: number) {
    const category =
      await this.prisma.category.findUnique({
        where: { id },
      });

    if (!category) {
      throw new NotFoundException(
        CATEGORY_MESSAGES.NOT_FOUND,
      );
    }

    return ApiResponse.success(
      CategoryResponseDto.fromEntity(
        category,
      ),
    );
  }

  async create(
    dto: CreateCategoryDto,
  ) {
    const exists =
      await this.prisma.category.findFirst({
        where: {
          name: dto.name,
        },
      });

    if (exists) {
      throw new ConflictException(
        CATEGORY_MESSAGES.ALREADY_EXISTS,
      );
    }

    const category =
      await this.prisma.category.create({
        data: dto,
      });

    return ApiResponse.success(
      CategoryResponseDto.fromEntity(
        category,
      ),
      CATEGORY_MESSAGES.CREATED,
    );
  }

  async update(
    id: number,
    dto: UpdateCategoryDto,
  ) {
    await this.findOne(id);

    const category =
      await this.prisma.category.update({
        where: { id },
        data: dto,
      });

    return ApiResponse.success(
      CategoryResponseDto.fromEntity(
        category,
      ),
      CATEGORY_MESSAGES.UPDATED,
    );
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.category.delete({
      where: { id },
    });

    return ApiResponse.success(
      null,
      CATEGORY_MESSAGES.DELETED,
    );
  }
}