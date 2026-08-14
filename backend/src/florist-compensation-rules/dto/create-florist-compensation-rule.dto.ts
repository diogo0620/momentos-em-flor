import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
} from 'class-validator';

export class CreateFloristCompensationRuleDto {
  @ApiProperty({
    example: 1,
    description: 'Product to which the compensation rule applies.',
  })
  @IsInt()
  @Min(1)
  productId: number;

  @ApiPropertyOptional({
    example: 5,
    description:
      'Florist to which the rule applies',
  })
  @IsPositive()
  @IsInt()
  @Min(1)
  floristId: number;

  @ApiProperty({
    example: 30,
    description:
      'Amount paid to the florist for this product.',
  })
  @IsNumber()
  @Min(0)
  compensationAmount: number;

  @ApiPropertyOptional({
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}