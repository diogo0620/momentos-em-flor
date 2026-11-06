import { ApiProperty } from '@nestjs/swagger';
import { OrderOfferStatus } from '@prisma/client';

export class AdminOrderOfferOrderResponseDto {

    @ApiProperty() deliveryDate!: Date;

    @ApiProperty() deliveryTimeSlot!: string;

    @ApiProperty() deliveryDistrict!: string;

    @ApiProperty() deliveryCity!: string;
}

export class FloristOrderOfferListResponseDto {
    @ApiProperty() id!: number;

    @ApiProperty() order!: AdminOrderOfferOrderResponseDto;
    @ApiProperty({ enum: OrderOfferStatus }) status!: OrderOfferStatus;
    @ApiProperty({ type: Number }) price!: number;
    @ApiProperty({ type: Number }) distanceKm!: number;
    
    @ApiProperty() createdAt!: Date;
    @ApiProperty() expiresAt!: Date;
}
