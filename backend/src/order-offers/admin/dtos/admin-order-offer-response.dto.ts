
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderOfferStatus,OrderOfferDeclineReason,OrderOfferCancellationReason } from '@prisma/client';

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

export class AdminOrderOfferResponseDto {
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

    @ApiPropertyOptional({
        example: 3.5,
        nullable: true,
        description: 'Distância entre a morada de entrega e a florista, em quilómetros.',
    })
    distanceKm!: number | null;

    @ApiPropertyOptional({ nullable: true, type: String })
    viewedAt?: Date | null;

    @ApiPropertyOptional({ nullable: true, type: String })
    acceptedAt?: Date | null;

    @ApiPropertyOptional({ nullable: true, type: String })
    declinedAt?: Date | null;

    @ApiPropertyOptional({ nullable: true, type: String })
    expiresAt?: Date | null;

    @ApiPropertyOptional({
        enum: OrderOfferDeclineReason,
        nullable: true,
    })
    declineReason?: OrderOfferDeclineReason | null;

    @ApiPropertyOptional({ nullable: true })
    declineReasonDetails?: string | null;

    @ApiPropertyOptional({ nullable: true, type: String })
    cancelledAt?: Date | null;

    @ApiPropertyOptional({
        enum: OrderOfferCancellationReason,
        nullable: true,
    })
    cancellationReason?: OrderOfferCancellationReason | null;

    @ApiProperty({ type: String, format: 'date-time' })
    createdAt?: Date;

    @ApiProperty({ type: String, format: 'date-time' })
    updatedAt?: Date;


}
