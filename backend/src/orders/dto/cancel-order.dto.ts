import {
    ApiProperty,
} from '@nestjs/swagger';

import {
    IsEnum,
} from 'class-validator';

import {
    OrderCancellationReason,
} from '@prisma/client';

export class CancelOrderDto {
    @ApiProperty({
        enum: OrderCancellationReason,
        example:
            OrderCancellationReason.CUSTOMER_REQUEST,
    })
    @IsEnum(OrderCancellationReason)
    reason: OrderCancellationReason;
}