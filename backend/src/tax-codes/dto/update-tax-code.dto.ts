import {
    ApiPropertyOptional,
    PartialType,
} from '@nestjs/swagger';

import {
    CreateTaxCodeDto,
} from './create-tax-code.dto';

export class UpdateTaxCodeDto
    extends PartialType(CreateTaxCodeDto) {

    @ApiPropertyOptional({
        example: true,
    })
    active?: boolean;
}