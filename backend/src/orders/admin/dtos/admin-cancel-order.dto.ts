import { ApiProperty } from '@nestjs/swagger';
import { OrderCancellationReason } from '@prisma/client';
import {
    IsEnum,
    IsNotEmpty,
    IsString,
    MaxLength,
} from 'class-validator';

export class AdminCancelOrderDto {
    @ApiProperty({ enum: OrderCancellationReason })
    @IsEnum(OrderCancellationReason)
    cancellationReason!: OrderCancellationReason;

    @ApiProperty({
        example: 'A florista informou não ter disponibilidade para a data.',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    cancellationReasonDetails!: string;
}