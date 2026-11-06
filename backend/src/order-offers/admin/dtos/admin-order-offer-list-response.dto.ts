
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderOfferStatus } from '@prisma/client';

export class AdminOrderOfferFloristResponseDto {
    @ApiProperty({ example: 5 })
    id!: number;

    @ApiProperty({ example: 'Flores da Maria' })
    name!: string;
}

export class AdminOrderOfferOrderResponseDto {
    @ApiProperty({ example: 5 })
    id!: number;

    @ApiProperty({ example: 'Flores da Maria' })
    orderNumber!: string;
}

export class AdminOrderOfferListResponseDto {
    @ApiProperty({ example: 123 })
    id!: number;

    @ApiProperty({
        type: AdminOrderOfferOrderResponseDto,
        description: 'Encomenda associada à proposta.',
    })
    order!: AdminOrderOfferOrderResponseDto;

    @ApiProperty({
        type: AdminOrderOfferFloristResponseDto,
        description: 'Florista associada à proposta.',
    })
    florist!: AdminOrderOfferFloristResponseDto;

    @ApiProperty({
        example: 45.90,
        description: 'Preço proposto pela florista.',
    })
    price!: number;

    @ApiProperty({
        enum: OrderOfferStatus,
        example: OrderOfferStatus.PENDING,
    })
    status!: OrderOfferStatus;

    @ApiProperty()
    expiresAt!: Date;

    
}
