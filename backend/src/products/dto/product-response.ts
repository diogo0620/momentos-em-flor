import { CategoryResponseDto } from '@/categories/dto/category-response.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductPricingType } from '@prisma/client';

export class ProductResponseDto {
  @ApiProperty({
    example: 1,
  })
  id: number;

  @ApiProperty({
    example: 'Ramo de Rosas Vermelhas',
  })
  name: string;

  @ApiProperty({
    example: 'ramo-de-rosas-vermelhas',
  })
  slug: string;

  @ApiPropertyOptional({
    example: 'Ramo composto por rosas vermelhas frescas.',
  })
  description?: string;

  @ApiProperty({
    example: true,
  })
  active: boolean;

  @ApiProperty({
    enum: ProductPricingType,
    example: ProductPricingType.FIXED,
  })
  pricingType: ProductPricingType;

  @ApiProperty({
    example: 29.99,
  })
  basePrice: number;

  @ApiProperty({
    type: CategoryResponseDto,
  })
  category: CategoryResponseDto;

  @ApiProperty({
    example: '2026-07-20T17:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-07-20T17:00:00.000Z',
  })
  updatedAt: Date;
}