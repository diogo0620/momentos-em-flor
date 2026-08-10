import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsPositive,
} from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({
    example: 1,
    description: 'Product ID.',
  })
  @IsInt()
  @IsPositive()
  productId: number;

  @ApiProperty({
    example: 1,
    minimum: 1,
    description: 'Quantity of the product.',
  })
  @IsInt()
  @IsPositive()
  quantity: number;
}