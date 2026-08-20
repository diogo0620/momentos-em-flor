import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

import {
    DeliveryTimeSlot,
    Occasion,
    OrderOfferStatus,
} from '@prisma/client';

class OrderOfferItemResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    productId: number;

    @ApiProperty()
    productName: string;

    @ApiProperty()
    quantity: number;
}

class OrderOfferAddressResponseDto {
    @ApiProperty()
    street: string;

    @ApiPropertyOptional()
    street2: string | null;

    @ApiProperty()
    postalCode: string;

    @ApiProperty()
    city: string;

    @ApiProperty()
    district: string;

    @ApiProperty()
    countryCode: string;
}

class OrderOfferOrderResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    orderNumber: string;

    @ApiPropertyOptional({
        enum: Occasion,
    })
    occasion: Occasion | null;

    @ApiProperty()
    deliveryDate: Date;

    @ApiProperty({
        enum: DeliveryTimeSlot,
    })
    deliveryTimeSlot: DeliveryTimeSlot;

    @ApiProperty({
        type: OrderOfferAddressResponseDto,
    })
    deliveryAddress: OrderOfferAddressResponseDto;
}

export class OrderOfferResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    floristId: number;

    @ApiProperty({
        example: 12.43,
    })
    distanceKm: number;

    @ApiProperty()
    compensationAmount: number;

    @ApiProperty({
        enum: OrderOfferStatus,
    })
    status: OrderOfferStatus;

    @ApiPropertyOptional()
    viewedAt: Date | null;

    @ApiPropertyOptional()
    acceptedAt: Date | null;

    @ApiPropertyOptional()
    declinedAt: Date | null;

    @ApiProperty()
    expiresAt: Date;

    @ApiPropertyOptional()
    declineReason: string | null;

    @ApiProperty({
        type: OrderOfferOrderResponseDto,
    })
    order: OrderOfferOrderResponseDto;

    @ApiProperty({
        type: [OrderOfferItemResponseDto],
    })
    items: OrderOfferItemResponseDto[];

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}