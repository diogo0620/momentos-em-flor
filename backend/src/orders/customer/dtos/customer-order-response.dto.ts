import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

import {
    DeliveryTimeSlot,
    Occasion,
    OrderStatus,
    OrderCancellationReason
} from '@prisma/client';



class CustomerOrderItemResponseDto {
    @ApiProperty()
    id!: number;

    @ApiPropertyOptional()
    productId?: number | null;

    @ApiProperty()
    productName!: string;

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

    @ApiProperty({
        type: [CustomerOrderItemResponseDto],
    })
    items!: CustomerOrderItemResponseDto[];

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