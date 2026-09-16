import { PickType } from '@nestjs/swagger';

import { OrderResponseDto } from './order-response.dto';

export class OrderListResponseDto extends PickType(
    OrderResponseDto,
    [
        'id',
        'orderNumber',

        'customerId',
        'customerFirstName',
        'customerEmail',
        'customerPhone',

        'deliveryStreet',
        'deliveryStreet2',
        'deliveryPostalCode',
        'deliveryCity',
        'deliveryDistrict',
        'deliveryCountryCode',

        'total',
        'status',
    ] as const,
) {}
