
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class AdminOrderListResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  orderNumber!: string;

  @ApiProperty()
  customerFirstName!: string;
  
  @ApiProperty()
  customerLastName!: string;

  @ApiProperty()
  customerEmail! : string;

  @ApiProperty()
  deliveryCity! : string;

  @ApiProperty()
  deliveryDistrict! : string;
  
  @ApiProperty()
  total! : number;

  @ApiProperty({
    enum: OrderStatus,
  })
  status!: OrderStatus;

  @ApiProperty()
  createdAt!: Date;
}
