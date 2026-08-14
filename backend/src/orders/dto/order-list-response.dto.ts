import { PickType } from '@nestjs/swagger';

import { OrderResponseDto } from './order-response.dto';

export class OrderListResponseDto extends PickType(
    OrderResponseDto,
    [
        'id',
        'orderNumber',

        'customerId',
        'customerFirstName',
        'customerLastName',
        'customerEmail',
        'customerPhone',

        'recipientFirstName',
        'recipientLastName',
        'recipientPhone',

        'occasion',

        'deliveryDate',
        'deliveryTimeSlot',
        'deliveryInstructions',

        'deliveryStreet',
        'deliveryStreet2',
        'deliveryPostalCode',
        'deliveryCity',
        'deliveryDistrict',
        'deliveryCountryCode',
        'deliveryLatitude',
        'deliveryLongitude',

        'cardMessage',

        'subtotal',
        'deliveryFee',
        'discount',
        'total',

        'status',

        'createdAt',
        'updatedAt',

        'cancelledAt',
        'cancellationReason'
    ] as const,
) {}