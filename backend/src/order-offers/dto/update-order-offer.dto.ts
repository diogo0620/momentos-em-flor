import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsInt,
    IsNumber,
    IsOptional,
    IsPositive,
} from 'class-validator';

export class UpdateOrderOfferDto {
    @ApiPropertyOptional({
        example: 2,
    })
    @IsOptional()
    @IsInt()
    @IsPositive()
    floristId?: number;

    @ApiPropertyOptional({
        example: 35,
        description:
            'Total compensation offered to the florist',
    })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    compensationAmount?: number;
}