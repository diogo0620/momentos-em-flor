import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import { OrderOfferStatus } from '@prisma/client';

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

export class OrderOfferResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  orderId: number;

  @ApiProperty()
  floristId: number;

  @ApiProperty()
  orderNumber: string;

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
    type: [OrderOfferItemResponseDto],
  })
  items: OrderOfferItemResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}