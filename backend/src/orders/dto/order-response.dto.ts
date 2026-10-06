import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

import {
    DeliveryTimeSlot,
    Occasion,
    OrderOfferStatus,
    OrderStatus,
    OrderCancellationReason
} from '@prisma/client';

import { OrderStatusHistoryResponseDto } from './order-status-history-response.dto';


class OrderItemComponentResponseDto {
    @ApiProperty()
    componentId: number;

    @ApiProperty()
    componentName: string;

    @ApiProperty()
    quantity: number;

    @ApiProperty()
    additionalUnits: number;

    @ApiProperty()
    customerPricePerAdditionalUnit: number;

    @ApiProperty()
    customerTotalPrice: number;
}

class OrderItemResponseDto {
    @ApiProperty()
    id: number;

    @ApiPropertyOptional()
    productId: number | null;

    @ApiProperty()
    productName: string;

    @ApiPropertyOptional()
    description: string | null;

    @ApiPropertyOptional()
    variantId: number | null;

    @ApiPropertyOptional()
    variantType: string | null;

    @ApiPropertyOptional()
    variantName: string | null;

    @ApiProperty({
        type: [OrderItemComponentResponseDto],
    })
    components: OrderItemComponentResponseDto[];

    @ApiProperty()
    quantity: number;

    @ApiProperty()
    unitPrice: number;

    @ApiProperty()
    netAmount: number;

    @ApiProperty()
    taxRate: number;

    @ApiProperty()
    taxAmount: number;

    @ApiProperty()
    grossAmount: number;

    @ApiPropertyOptional()
    taxCodeId: number | null;
}



class OrderOfferFloristResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;
}

class OrderOfferResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty({
        type: OrderOfferFloristResponseDto,
    })
    florist: OrderOfferFloristResponseDto;

    @ApiProperty()
    price: number;

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


    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class OrderResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    orderNumber: string;

    @ApiPropertyOptional()
    customerId: number | null;

    @ApiProperty()
    customerFirstName: string;

    @ApiPropertyOptional()
    customerLastName: string | null;

    @ApiPropertyOptional()
    customerEmail: string | null;

    @ApiPropertyOptional()
    customerPhone: string | null;

    @ApiProperty()
    recipientFirstName: string;

    @ApiPropertyOptional()
    recipientLastName: string | null;

    @ApiPropertyOptional()
    recipientPhone: string | null;

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

    @ApiPropertyOptional()
    deliveryInstructions: string | null;

    @ApiProperty()
    deliveryStreet: string;

    @ApiPropertyOptional()
    deliveryStreet2: string | null;

    @ApiProperty()
    deliveryPostalCode: string;

    @ApiProperty()
    deliveryCity: string;

    @ApiProperty()
    deliveryDistrict: string;

    @ApiProperty()
    deliveryCountryCode: string;

    @ApiProperty()
    deliveryLatitude: number;

    @ApiProperty()
    deliveryLongitude: number;

    @ApiPropertyOptional()
    cardMessage: string | null;

    @ApiProperty()
    subtotal: number;

    @ApiProperty()
    taxAmount: number;

    @ApiProperty()
    deliveryFee: number;

    @ApiProperty()
    discount: number;

    @ApiProperty()
    total: number;

    @ApiProperty({
        enum: OrderStatus,
    })
    status: OrderStatus;

    @ApiProperty({
        type: [OrderItemResponseDto],
    })
    items: OrderItemResponseDto[];

    @ApiProperty({
        type: [OrderOfferResponseDto],
    })
    offers: OrderOfferResponseDto[];

    @ApiProperty({
        type: [OrderStatusHistoryResponseDto],
    })
    statusHistory: OrderStatusHistoryResponseDto[];

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiPropertyOptional()
    cancelledAt: Date | null;

    @ApiPropertyOptional({
        enum: OrderCancellationReason,
    })
    cancellationReason:
        OrderCancellationReason | null;
}