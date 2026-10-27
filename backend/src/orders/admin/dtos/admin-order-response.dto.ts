import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    DeliveryTimeSlot,
    Occasion,
    OrderCancellationReason,
    OrderItemType,
    OrderOfferStatus,
    OrderStatus,
    PaymentStatus,
    ProductType,
    ProductVariantType,
    ReviewCategory,
    UserRole,
} from '@prisma/client';

export class AdminOrderFloristResponseDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    name!: string;
}

export class AdminOrderTaxCodeResponseDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    name!: string;
}


export class AdminOrderProductResponseDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    name!: string;
}

export class AdminOrderItemComponentResponseDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    orderItemId!: number;

    @ApiProperty()
    componentId!: number;

    @ApiProperty()
    componentName!: string;

    @ApiProperty()
    quantity!: number;

    @ApiProperty()
    additionalUnits!: number;

    @ApiProperty({ type: Number })
    customerPricePerAdditionalUnit!: number;

    @ApiProperty({ type: Number })
    customerTotalPrice!: number;
}

export class AdminOrderItemResponseDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    orderId!: number;

    @ApiPropertyOptional({ type: Number, nullable: true })
    productId!: number | null;

    @ApiProperty({ enum: OrderItemType })
    type!: OrderItemType;

    @ApiProperty()
    name!: string;

    @ApiPropertyOptional({ nullable: true })
    description!: string | null;

    @ApiPropertyOptional({ type: Number, nullable: true })
    variantId!: number | null;

    @ApiPropertyOptional({ enum: ProductVariantType, nullable: true })
    variantType!: ProductVariantType | null;

    @ApiPropertyOptional({ nullable: true })
    variantName!: string | null;

    @ApiProperty()
    quantity!: number;

    @ApiProperty({ type: Number })
    customerPrice!: number;

    @ApiProperty({ type: Number })
    floristPrice!: number;

    @ApiProperty({ type: Number })
    netAmount!: number;

    @ApiProperty({ type: Number })
    taxAmount!: number;

    @ApiProperty({ type: Number })
    grossAmount!: number;

    @ApiPropertyOptional({ type: Number, nullable: true })
    taxCodeId!: number | null;

    @ApiPropertyOptional({ type: Number, nullable: true })
    taxRate!: number | null;

    @ApiPropertyOptional({
        type: AdminOrderTaxCodeResponseDto,
        nullable: true,
    })
    taxCode!: AdminOrderTaxCodeResponseDto | null;

    @ApiPropertyOptional({
        type: AdminOrderProductResponseDto,
        nullable: true,
    })
    product!: AdminOrderProductResponseDto | null;

    @ApiProperty({ type: [AdminOrderItemComponentResponseDto] })
    components!: AdminOrderItemComponentResponseDto[];

}

export class AdminOrderOfferResponseDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    orderId!: number;

    @ApiProperty()
    floristId!: number;

    @ApiProperty({ type: Number })
    price!: number;

    @ApiProperty({ enum: OrderOfferStatus })
    status!: OrderOfferStatus;

    @ApiProperty({ type: Number })
    distanceKm!: number;

    @ApiPropertyOptional({ nullable: true })
    viewedAt!: Date | null;

    @ApiPropertyOptional({ nullable: true })
    acceptedAt!: Date | null;

    @ApiPropertyOptional({ nullable: true })
    declinedAt!: Date | null;

    @ApiProperty()
    expiresAt!: Date;

    @ApiPropertyOptional({ nullable: true })
    declineReason!: string | null;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;

    @ApiProperty({ type: AdminOrderFloristResponseDto })
    florist!: AdminOrderFloristResponseDto;
}

export class AdminOrderReviewRatingResponseDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    reviewId!: number;

    @ApiProperty({ enum: ReviewCategory })
    category!: ReviewCategory;

    @ApiProperty()
    rating!: number;

    @ApiProperty()
    createdAt!: Date;
}


export class AdminOrderPaymentResponseDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    orderId!: number;

    @ApiProperty({ enum: PaymentStatus })
    status!: PaymentStatus;

    @ApiProperty({ type: Number })
    amount!: number;

    @ApiProperty()
    currency!: string;

    @ApiPropertyOptional({ nullable: true })
    stripeSessionId!: string | null;

    @ApiPropertyOptional({ nullable: true })
    stripePaymentIntentId!: string | null;

    @ApiPropertyOptional({ nullable: true })
    paidAt!: Date | null;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}

export class AdminOrderTaxTotalResponseDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    orderId!: number;

    @ApiProperty()
    taxCodeId!: number;

    @ApiProperty({ type: Number })
    netAmount!: number;

    @ApiProperty({ type: Number })
    taxAmount!: number;

    @ApiProperty({ type: Number })
    grossAmount!: number;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;

    @ApiProperty({ type: AdminOrderTaxCodeResponseDto })
    taxCode!: AdminOrderTaxCodeResponseDto;
}

export class AdminOrderResponseDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    orderNumber!: string;

    @ApiProperty({ enum: OrderStatus })
    status!: OrderStatus;

    // Customer snapshot and relation
    @ApiPropertyOptional({ type: Number, nullable: true })
    customerId!: number | null;

    @ApiProperty()
    customerFirstName!: string;

    @ApiProperty()
    customerLastName!: string;

    @ApiProperty()
    customerEmail!: string;

    @ApiProperty()
    customerPhone!: string;

    @ApiPropertyOptional({ nullable: true })
    customerTaxNumber!: string | null;

    @ApiPropertyOptional({
        type: AdminOrderFloristResponseDto,
        nullable: true,
    })
    assignedFlorist!: AdminOrderFloristResponseDto | null;

    // Recipient
    @ApiProperty()
    recipientFirstName!: string;

    @ApiPropertyOptional({ nullable: true })
    recipientLastName!: string | null;

    @ApiPropertyOptional({ nullable: true })
    recipientPhone!: string | null;

    @ApiPropertyOptional({ enum: Occasion, nullable: true })
    occasion!: Occasion | null;

    // Delivery
    @ApiProperty()
    deliveryDate!: Date;

    @ApiProperty({ enum: DeliveryTimeSlot })
    deliveryTimeSlot!: DeliveryTimeSlot;

    @ApiPropertyOptional({ nullable: true })
    deliveryInstructions!: string | null;

    @ApiProperty()
    deliveryStreet!: string;

    @ApiProperty()
    deliveryStreetNumber!: string;

    @ApiPropertyOptional({ nullable: true })
    deliveryStreet2!: string | null;

    @ApiProperty()
    deliveryPostalCode!: string;

    @ApiProperty()
    deliveryCity!: string;

    @ApiProperty()
    deliveryDistrict!: string;

    @ApiProperty()
    deliveryCountryCode!: string;

    // Card and internal notes
    @ApiPropertyOptional({ nullable: true })
    cardMessage!: string | null;

    @ApiPropertyOptional({ nullable: true })
    notes!: string | null;

    // Monetary totals
    @ApiProperty({ type: Number })
    subtotal!: number;

    @ApiProperty({ type: Number })
    taxAmount!: number;

    @ApiProperty({ type: Number })
    deliveryFee!: number;

    @ApiProperty({ type: Number })
    discount!: number;

    @ApiProperty({ type: Number })
    total!: number;

    @ApiPropertyOptional({ nullable: true })
    assignedAt!: Date | null;

    @ApiPropertyOptional({ nullable: true })
    paidAt!: Date | null;

    @ApiPropertyOptional({ nullable: true })
    inProductionAt!: Date | null;

    @ApiPropertyOptional({ nullable: true })
    readyForDeliveryAt!: Date | null;

    @ApiPropertyOptional({ nullable: true })
    deliveredAt!: Date | null;

    @ApiPropertyOptional({ nullable: true })
    cancelledAt!: Date | null;

    @ApiPropertyOptional({
        enum: OrderCancellationReason,
        nullable: true,
    })
    cancellationReason!: OrderCancellationReason | null;

    @ApiPropertyOptional({ nullable: true })
    cancellationReasonDetails!: string | null;

    // Related records
    @ApiProperty({ type: [AdminOrderItemResponseDto] })
    items!: AdminOrderItemResponseDto[];

    @ApiProperty({ type: [AdminOrderOfferResponseDto] })
    offers!: AdminOrderOfferResponseDto[];

    @ApiProperty({ type: [AdminOrderTaxTotalResponseDto] })
    taxTotals!: AdminOrderTaxTotalResponseDto[];

    // Timestamps
    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}
