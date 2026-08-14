import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductPricingType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'Ramo de Rosas Vermelhas',
  })
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({
    example: 'Ramo composto por rosas vermelhas frescas.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    enum: ProductPricingType,
    example: ProductPricingType.FIXED,
  })
  @IsEnum(ProductPricingType)
  pricingType: ProductPricingType;

  @ApiProperty({
    example: 29.99,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice: number;

  @ApiProperty({
    example: 35,
  })
  @IsNumber()
  @Min(0)
  baseFloristCompensation: number;

  @ApiProperty({
    example: 1,
  })
  @IsInt()
  categoryId: number;

  @ApiProperty({
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean = true;
}