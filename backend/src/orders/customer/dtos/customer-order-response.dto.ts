import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

import {
    DeliveryTimeSlot,
    Occasion,
    OrderStatus,
    OrderCancellationReason,
    OrderItemType,
    ReviewCategory,
} from '@prisma/client';

class CustomerOrderReviewRatingResponseDto {
    @ApiProperty({ enum: ReviewCategory }) category!: ReviewCategory;
    @ApiProperty() rating!: number;
}

class CustomerOrderReviewResponseDto {
    @ApiProperty() id!: number;
    @ApiPropertyOptional() comment!: string | null;
    @ApiProperty() averageRating!: number;
    @ApiProperty({ type: [CustomerOrderReviewRatingResponseDto] })
    ratings!: CustomerOrderReviewRatingResponseDto[];
    @ApiProperty() createdAt!: Date;
}



class CustomerOrderItemResponseDto {
    @ApiProperty({ enum: OrderItemType })
    type!: OrderItemType;

    @ApiProperty()
    id!: number;

    @ApiPropertyOptional()
    productId?: number | null;

    @ApiProperty()
    productName!: string;

    @ApiPropertyOptional()
    variantName?: string | null;

    @ApiPropertyOptional()
    image?: string | null;

    @ApiPropertyOptional()
    description!: string | null;

    @ApiProperty()
    quantity!: number;

    @ApiProperty()
    unitPrice!: number;

    @ApiProperty()
    netAmount!: number;

    @ApiProperty()
    taxRate!: number;

    @ApiProperty()
    taxAmount!: number;

    @ApiProperty()
    grossAmount!: number;

    @ApiPropertyOptional()
    taxCodeId?: number | null;
}




export class CustomerOrderResponseDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    orderNumber!: string;

    @ApiProperty()
    customerFirstName!: string;

    @ApiProperty()
    customerLastName!: string;

    @ApiProperty()
    customerEmail!: string;

    @ApiProperty()
    customerPhone! : string;

    @ApiPropertyOptional()
    customerTaxNumber?: string | null;

    @ApiProperty()
    recipientFirstName!: string;

    @ApiPropertyOptional()
    recipientLastName?: string | null;

    @ApiPropertyOptional()
    recipientPhone?: string | null;

    @ApiPropertyOptional({
        enum: Occasion,
    })
    occasion?: Occasion | null;

    @ApiProperty()
    deliveryDate!: Date;

    @ApiProperty({
        enum: DeliveryTimeSlot,
    })
    deliveryTimeSlot!: DeliveryTimeSlot;

    @ApiPropertyOptional()
    deliveryInstructions?: string | null;

    @ApiProperty()
    deliveryStreet!: string;

    @ApiProperty()
    deliveryStreetNumber!: string;

    @ApiPropertyOptional()
    deliveryStreet2?: string | null;

    @ApiProperty()
    deliveryPostalCode!: string;

    @ApiProperty()
    deliveryCity!: string;

    @ApiProperty()
    deliveryDistrict!: string;

    @ApiProperty()
    deliveryCountryCode!: string;

    @ApiPropertyOptional()
    cardMessage?: string | null;

    @ApiProperty()
    subtotal!: number;

    @ApiProperty()
    taxAmount!: number;

    @ApiProperty()
    deliveryFee!: number;

    @ApiProperty()
    discount!: number;

    @ApiProperty()
    total!: number;

    @ApiProperty({
        enum: OrderStatus,
    })
    status!: OrderStatus;

    @ApiProperty()
    invoiceAvailable!: boolean;

    @ApiProperty({
        type: [CustomerOrderItemResponseDto],
    })
    items!: CustomerOrderItemResponseDto[];

    @ApiPropertyOptional({ type: CustomerOrderReviewResponseDto, nullable: true })
    review!: CustomerOrderReviewResponseDto | null;

    @ApiProperty()
    createdAt!: Date;

    @ApiPropertyOptional()
    cancelledAt?: Date | null;

    @ApiPropertyOptional({
        enum: OrderCancellationReason,
    })
    cancellationReason?:
        OrderCancellationReason | null;
}
