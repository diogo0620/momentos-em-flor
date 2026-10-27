import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class FloristOrderListResponseDto {
    @ApiProperty() id!: number;
    @ApiProperty() orderNumber!: string;
    @ApiProperty({ enum: OrderStatus }) status!: OrderStatus;
    @ApiProperty() deliveryDate!: Date;
    @ApiProperty() deliveryTimeSlot!: string;
    @ApiProperty() deliveryCity!: string;
    @ApiProperty() deliveryDistrict!: string;
    @ApiProperty() createdAt!: Date;
    @ApiProperty() price!: number;
}
