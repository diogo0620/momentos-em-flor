
import { Injectable } from '@nestjs/common';

import { BaseMapper } from '@/common/mappers/base.mapper';
import { Prisma } from '@prisma/client';
import { AdminTaxCodeResponseDto } from '../dtos/admin-tax-code-response.dto';
import { AdminTaxCodeListResponseDto } from '../dtos/admin-tax-code-list-response.dto';

type TaxCodeWithMoloniSync = Prisma.TaxCodeGetPayload<{
  include: { moloniSync: true };
}>;

@Injectable()
export class AdminTaxCodesMapper extends BaseMapper<
  TaxCodeWithMoloniSync,
  AdminTaxCodeResponseDto,
  AdminTaxCodeListResponseDto
> {
  toDetailResponse(taxCode: TaxCodeWithMoloniSync): AdminTaxCodeResponseDto {
    return {
      id: taxCode.id,
      name: taxCode.name,
      rate: taxCode.rate.toNumber(),
      description: taxCode.description,
      active: taxCode.active,
      moloniId: taxCode.moloniSync?.moloniId ?? null,
      createdAt: taxCode.createdAt,
      updatedAt: taxCode.updatedAt,
    };
  }

  protected toListItemResponse(
    taxCode: TaxCodeWithMoloniSync,
  ): AdminTaxCodeListResponseDto {
    return {
      id: taxCode.id,
      name: taxCode.name,
      rate: taxCode.rate.toNumber(),
      description: taxCode.description,
      active: taxCode.active,
      moloniId: taxCode.moloniSync?.moloniId ?? null,
    };
  }
}
