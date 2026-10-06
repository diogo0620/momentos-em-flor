import { ApiProperty } from '@nestjs/swagger';

import {
    IsInt,
    IsPositive,
} from 'class-validator';

export class CreateCheckoutSessionDto {
    @ApiProperty({
        example: 1,
        description: 'ID of the order to be paid.',
    })
    @IsInt()
    @IsPositive()
    orderId: number;
}