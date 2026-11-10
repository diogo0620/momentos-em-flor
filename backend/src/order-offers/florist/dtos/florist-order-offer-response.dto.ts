import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderOfferCancellationReason, OrderOfferDeclineReason, OrderOfferStatus } from '@prisma/client';

export class FloristOrderOfferItemResponseDto {
    @ApiProperty() id!: number;
    @ApiProperty() name!: string;
    @ApiPropertyOptional({ nullable: true }) description!: string | null;
    @ApiPropertyOptional({ nullable: true }) variantName!: string | null;
    @ApiProperty() quantity!: number;
}

export class AdminOrderOfferOrderResponseDto {
    @ApiProperty() deliveryDate!: Date;
    @ApiProperty() deliveryTimeSlot!: string;
    @ApiProperty() deliveryDistrict!: string;
    @ApiProperty() deliveryCity!: string;
    @ApiPropertyOptional({ nullable: true }) recipientFirstName?: string;
    @ApiPropertyOptional({ nullable: true }) recipientLastName?: string | null;
    @ApiPropertyOptional({ nullable: true }) recipientPhone?: string | null;
    @ApiPropertyOptional({ nullable: true }) deliveryStreet?: string;
    @ApiPropertyOptional({ nullable: true }) deliveryStreetNumber?: string;
    @ApiPropertyOptional({ nullable: true }) deliveryStreet2?: string | null;
    @ApiPropertyOptional({ nullable: true }) deliveryPostalCode?: string;
    @ApiPropertyOptional({ nullable: true }) deliveryInstructions?: string | null;
    @ApiPropertyOptional({ nullable: true }) cardMessage?: string | null;
    @ApiProperty({ type: [FloristOrderOfferItemResponseDto] }) items!: FloristOrderOfferItemResponseDto[];
}

export class FloristOrderOfferResponseDto {
    @ApiProperty() id!: number;
    @ApiProperty() order!: AdminOrderOfferOrderResponseDto;
    @ApiProperty({ enum: OrderOfferStatus }) status!: OrderOfferStatus;
    @ApiProperty({ type: Number }) price!: number;
    @ApiProperty({ type: Number }) distanceKm!: number;
    @ApiPropertyOptional() acceptedAt!: Date | null;
    @ApiPropertyOptional() declinedAt!: Date | null;
    @ApiPropertyOptional() cancelledAt!: Date | null;
    @ApiProperty() expiresAt!: Date;
    @ApiPropertyOptional({ enum: OrderOfferDeclineReason, nullable: true }) declineReason!: OrderOfferDeclineReason | null;
    @ApiPropertyOptional({ nullable: true }) declineReasonDetails!: string | null;
    @ApiPropertyOptional({ enum: OrderOfferCancellationReason, nullable: true }) cancellationReason!: OrderOfferCancellationReason | null;
    @ApiProperty() createdAt!: Date;
    @ApiProperty() updatedAt!: Date;
}
