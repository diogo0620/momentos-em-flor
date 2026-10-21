
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class CustomerOrderListResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  orderNumber!: string;

  @ApiProperty()
  total! : number;

  @ApiProperty({
    enum: OrderStatus,
  })
  status!: OrderStatus;

  @ApiProperty()
  createdAt!: Date;
}
