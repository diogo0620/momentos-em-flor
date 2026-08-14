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

class OrderItemResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    productId: number;

    @ApiProperty()
    productName: string;

    @ApiPropertyOptional()
    productDescription: string | null;

    @ApiProperty()
    quantity: number;

    @ApiProperty()
    unitPrice: number;

    @ApiProperty()
    lineTotal: number;
}

class OrderOfferItemResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    orderItemId: number;

    @ApiProperty()
    productId: number;

    @ApiProperty()
    productName: string;

    @ApiProperty()
    quantity: number;

    @ApiProperty()
    unitCompensation: number;

    @ApiProperty()
    totalCompensation: number;
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

    @ApiProperty()
    floristId: number;

    @ApiProperty({
        type: OrderOfferFloristResponseDto,
    })
    florist: OrderOfferFloristResponseDto;

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
        type: [OrderOfferItemResponseDto],
    })
    items: OrderOfferItemResponseDto[];

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