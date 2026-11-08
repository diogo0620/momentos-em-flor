
import { ApiProperty } from '@nestjs/swagger';
import { CustomerOrderStatus } from '../customer-order-status';

export class CustomerOrderListResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  orderNumber!: string;

  @ApiProperty()
  total! : number;

  @ApiProperty({
    enum: CustomerOrderStatus,
  })
  status!: CustomerOrderStatus;

  @ApiProperty()
  createdAt!: Date;
}
