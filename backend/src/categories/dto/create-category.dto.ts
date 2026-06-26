import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Bouquets',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}