import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Bouquets',
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    required: false,
    example: 'Beautiful flower bouquets.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}