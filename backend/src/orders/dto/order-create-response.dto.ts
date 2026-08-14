import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class OrderCreateResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    orderNumber: string;

    @ApiProperty({
        enum: OrderStatus,
    })
    status: OrderStatus;

    @ApiProperty()
    createdAt: Date;
}