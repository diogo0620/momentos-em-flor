import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsInt,
    IsNumber,
    IsOptional,
    IsPositive,
} from 'class-validator';

export class UpdateOrderOfferDto {
    @ApiProperty({
        example: 35,
        description:
            'Price offered to the florist',
    })
    @IsNumber()
    @IsPositive()
    price: number;
}