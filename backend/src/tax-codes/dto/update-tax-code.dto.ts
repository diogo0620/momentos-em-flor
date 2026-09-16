import {
    ApiPropertyOptional,
    PartialType,
} from '@nestjs/swagger';

import {
    CreateTaxCodeDto,
} from './create-tax-code.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateTaxCodeDto
    extends PartialType(CreateTaxCodeDto) {

    @ApiPropertyOptional({
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    active?: boolean;
}