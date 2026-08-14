import { ApiProperty } from '@nestjs/swagger';
import {
    IsInt,
    IsNumber,
    IsPositive,
} from 'class-validator';

export class CreateOrderOfferDto {
    @ApiProperty({
        example: 1,
    })
    @IsInt()
    @IsPositive()
    orderId: number;

    @ApiProperty({
        example: 1,
    })
    @IsInt()
    @IsPositive()
    floristId: number;

    @ApiProperty({
        example: 35,
        description:
            'Total compensation offered to the florist',
    })
    @IsNumber()
    @IsPositive()
    compensationAmount: number;
}