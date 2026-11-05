import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { Exceptions } from '@/common/exceptions/exceptions';
import { ERROR_MESSAGES } from '@/common/errors/error-messages';
import { ApiResponse } from '@/common/responses/api-response';
import { getPagination } from '@/common/database/pagination';
import { getPaginationResponse } from '@/common/database/pagination-response';
import { FloristCompensationQueryDto } from '../dtos/florist-compensation-query.dto';
import {
  floristCompensationInclude,
  getCompensationSort,
  toFloristCompensationResponse,
} from '../florist-compensation-select';

@Injectable()
export class FloristCompensationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    user: AuthenticatedUser,
    query: FloristCompensationQueryDto,
  ) {
    const floristId = this.getFloristId(user);
    const where: Prisma.FloristCompensationWhereInput = {
      floristId,
      ...(query.status && { status: query.status }),
      ...(query.search && {
        order: {
          orderNumber: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.floristCompensation.findMany({
        where,
        include: floristCompensationInclude,
        orderBy: { [getCompensationSort(query.sort)]: query.order },
        ...getPagination(query.page, query.pageSize),
      }),
      this.prisma.floristCompensation.count({ where }),
    ]);

    return ApiResponse.paginated(
      items.map(toFloristCompensationResponse),
      getPaginationResponse(query.page, query.pageSize, total),
    );
  }

  async findOne(user: AuthenticatedUser, id: number) {
    const floristId = this.getFloristId(user);
    const compensation = await this.prisma.floristCompensation.findFirst({
      where: { id, floristId },
      include: floristCompensationInclude,
    });

    if (!compensation) {
      Exceptions.notFound(ERROR_MESSAGES.FLORIST_COMPENSATION_NOT_FOUND);
    }

    return ApiResponse.success(toFloristCompensationResponse(compensation));
  }

  private getFloristId(user: AuthenticatedUser): number {
    if (!user.floristId) Exceptions.forbidden();
    return user.floristId;
  }
}
