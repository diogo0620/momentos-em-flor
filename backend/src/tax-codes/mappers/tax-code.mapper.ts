import {
    Injectable,
} from '@nestjs/common';

import { TaxCode } from '@prisma/client';

import {
    BaseMapper,
} from '@/common/mappers/base.mapper';

import {
    TaxCodeResponseDto,
} from '../dto/tax-code-response.dto';

@Injectable()
export class TaxCodeMapper
    extends BaseMapper<
        TaxCode,
        TaxCodeResponseDto
    > {

    toResponse(
        taxCode: TaxCode,
    ): TaxCodeResponseDto {

        return {
            id:
                taxCode.id,

            code:
                taxCode.code,

            name:
                taxCode.name,

            rate:
                taxCode.rate.toNumber(),

            active:
                taxCode.active,

            createdAt:
                taxCode.createdAt,

            updatedAt:
                taxCode.updatedAt,
        };
    }
}