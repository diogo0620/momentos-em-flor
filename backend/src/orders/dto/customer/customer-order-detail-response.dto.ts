import { ApiProperty } from '@nestjs/swagger';
import { CustomerOrderStatus } from './customer-order-list-response.dto';

export class CustomerOrderItemResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty({ required: false })
    description?: string;

    @ApiProperty({ required: false })
    imageUrl?: string;

    @ApiProperty()
    quantity: number;

    @ApiProperty({ required: false })
    variantType?: string;

    @ApiProperty({ required: false })
    variantName?: string;

    @ApiProperty()
    customerPrice: number;

    @ApiProperty()
    netAmount: number;

    @ApiProperty()
    taxAmount: number;

    @ApiProperty()
    grossAmount: number;
}

export class CustomerOrderDetailResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    orderNumber: string;

    @ApiProperty({
        enum: CustomerOrderStatus,
    })
    status: CustomerOrderStatus;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    deliveryDate: Date;

    @ApiProperty()
    deliveryTimeSlot: string;

    @ApiProperty()
    customerFirstName: string;

    @ApiProperty({ required: false })
    customerLastName?: string;

    @ApiProperty({ required: false })
    customerEmail?: string;

    @ApiProperty({ required: false })
    customerPhone?: string;

    @ApiProperty()
    recipientFirstName: string;

    @ApiProperty({ required: false })
    recipientLastName?: string;

    @ApiProperty({ required: false })
    recipientPhone?: string;

    @ApiProperty()
    deliveryStreet: string;

    @ApiProperty({ required: false })
    deliveryStreet2?: string;

    @ApiProperty()
    deliveryPostalCode: string;

    @ApiProperty()
    deliveryCity: string;

    @ApiProperty()
    deliveryDistrict: string;

    @ApiProperty()
    deliveryCountryCode: string;

    @ApiProperty()
    cardMessage: string;

    @ApiProperty({ required: false })
    deliveryInstructions?: string;

    @ApiProperty({ required: false })
    notes?: string;

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

    @ApiProperty({ type: [CustomerOrderItemResponseDto] })
    items: CustomerOrderItemResponseDto[];
}