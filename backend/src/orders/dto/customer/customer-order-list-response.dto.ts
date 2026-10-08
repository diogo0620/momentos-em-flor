import { ApiProperty } from '@nestjs/swagger';

export enum CustomerOrderStatus {
  PROCESSING = 'PROCESSING',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  IN_PREPARATION = 'IN_PREPARATION',
  READY_FOR_DELIVERY = 'READY_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export class CustomerOrderListResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  orderNumber: string;

  @ApiProperty({
    enum: CustomerOrderStatus,
  })
  status: CustomerOrderStatus;

  @ApiProperty()
  total: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  deliveryDate: Date;
}