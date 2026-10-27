import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderItemType, OrderStatus, ProductVariantType } from '@prisma/client';

export class FloristOrderItemComponentResponseDto {
    @ApiProperty() id!: number;
    @ApiProperty() componentName!: string;
    @ApiProperty() quantity!: number;
}

export class FloristOrderItemResponseDto {
    @ApiProperty() id!: number;
    @ApiProperty({ enum: OrderItemType }) type!: OrderItemType;
    @ApiProperty() name!: string;
    @ApiPropertyOptional({ nullable: true }) description!: string | null;
    @ApiPropertyOptional({ enum: ProductVariantType, nullable: true }) variantType!: ProductVariantType | null;
    @ApiPropertyOptional({ nullable: true }) variantName!: string | null;
    @ApiProperty() quantity!: number;
    @ApiProperty({ type: [FloristOrderItemComponentResponseDto] }) components!: FloristOrderItemComponentResponseDto[];
}

export class FloristOrderResponseDto {
    @ApiProperty() id!: number;
    @ApiProperty() orderNumber!: string;
    @ApiProperty({ enum: OrderStatus }) status!: OrderStatus;
    @ApiProperty() deliveryDate!: Date;
    @ApiProperty() deliveryTimeSlot!: string;
    @ApiProperty() recipientFirstName!: string;
    @ApiPropertyOptional({ nullable: true }) recipientLastName!: string | null;
    @ApiPropertyOptional({ nullable: true }) recipientPhone!: string | null;
    @ApiProperty() deliveryStreet!: string;
    @ApiProperty() deliveryStreetNumber!: string;
    @ApiPropertyOptional({ nullable: true }) deliveryStreet2!: string | null;
    @ApiProperty() deliveryPostalCode!: string;
    @ApiProperty() deliveryCity!: string;
    @ApiProperty() deliveryDistrict!: string;
    @ApiPropertyOptional({ nullable: true }) deliveryInstructions!: string | null;
    @ApiPropertyOptional({ nullable: true }) cardMessage!: string | null;
    @ApiProperty() price!: number;
    @ApiProperty({ type: [FloristOrderItemResponseDto] }) items!: FloristOrderItemResponseDto[];
    @ApiPropertyOptional() paidAt!: Date | null;
    @ApiPropertyOptional() assignedAt!: Date | null;
    @ApiPropertyOptional() inProductionAt!: Date | null;
    @ApiPropertyOptional() readyForDeliveryAt!: Date | null;
    @ApiPropertyOptional() deliveredAt!: Date | null;
    @ApiPropertyOptional() cancelledAt!: Date | null;
    @ApiProperty() createdAt!: Date;
}
