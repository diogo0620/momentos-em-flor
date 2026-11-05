import { Injectable } from '@nestjs/common';
import { FloristCompensationStatus, Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { Exceptions } from '@/common/exceptions/exceptions';
import { ERROR_MESSAGES } from '@/common/errors/error-messages';
import { ApiResponse } from '@/common/responses/api-response';
import { getPagination } from '@/common/database/pagination';
import { getPaginationResponse } from '@/common/database/pagination-response';
import { FloristCompensationQueryDto } from '../dtos/florist-compensation-query.dto';
import { MarkFloristCompensationPaidDto } from '../dtos/mark-florist-compensation-paid.dto';
import {
  floristCompensationInclude,
  getCompensationSort,
  toAdminFloristCompensationResponse,
} from '../florist-compensation-select';

@Injectable()
export class AdminFloristCompensationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: FloristCompensationQueryDto) {
    const where: Prisma.FloristCompensationWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.search && {
        OR: [
          {
            order: {
              orderNumber: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
          },
          {
            florist: {
              name: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
          },
          {
            paymentReference: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        ],
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
      items.map(toAdminFloristCompensationResponse),
      getPaginationResponse(query.page, query.pageSize, total),
    );
  }

  async findOne(id: number) {
    const compensation = await this.prisma.floristCompensation.findUnique({
      where: { id },
      include: floristCompensationInclude,
    });

    if (!compensation) {
      Exceptions.notFound(ERROR_MESSAGES.FLORIST_COMPENSATION_NOT_FOUND);
    }

    return ApiResponse.success(toAdminFloristCompensationResponse(compensation));
  }

  async markPaid(
    id: number,
    dto: MarkFloristCompensationPaidDto,
  ): Promise<void> {
    const updated = await this.prisma.floristCompensation.updateMany({
      where: {
        id,
        status: FloristCompensationStatus.DUE,
      },
      data: {
        status: FloristCompensationStatus.PAID,
        paidAt: new Date(),
        paymentReference: dto.paymentReference.trim(),
        paymentNotes: dto.paymentNotes?.trim() || null,
      },
    });

    if (updated.count === 1) return;

    const compensation = await this.prisma.floristCompensation.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!compensation) {
      Exceptions.notFound(ERROR_MESSAGES.FLORIST_COMPENSATION_NOT_FOUND);
    }

    Exceptions.badRequest(ERROR_MESSAGES.FLORIST_COMPENSATION_NOT_DUE);
  }
}
