
import { Injectable } from '@nestjs/common';

import { BaseMapper } from '@/common/mappers/base.mapper';
import { TaxCode } from '@prisma/client';
import { AdminTaxCodeResponseDto } from '../dtos/admin-tax-code-response.dto';
import { AdminTaxCodeListResponseDto } from '../dtos/admin-tax-code-list-response.dto';


@Injectable()
export class AdminTaxCodesMapper extends BaseMapper<
  TaxCode,
  AdminTaxCodeResponseDto,
  AdminTaxCodeListResponseDto
> {
  toDetailResponse(taxCode: TaxCode): AdminTaxCodeResponseDto {
    return {
      id: taxCode.id,
      name: taxCode.name,
      rate: taxCode.rate.toNumber(),
      description: taxCode.description,
      active: taxCode.active,
      createdAt: taxCode.createdAt,
      updatedAt: taxCode.updatedAt,
    };
  }

  protected toListItemResponse(
    taxCode: TaxCode,
  ): AdminTaxCodeListResponseDto {
    return {
      id: taxCode.id,
      name: taxCode.name,
      rate: taxCode.rate.toNumber(),
      description: taxCode.description,
      active: taxCode.active,
    };
  }
}
