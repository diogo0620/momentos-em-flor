
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class AdminCreateCategoryDto {
  @ApiProperty({
    example: 'Bouquets',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    example: 'bouquets',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  slug!: string;

  @ApiPropertyOptional({
    example: 'Beautiful flower bouquets.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
