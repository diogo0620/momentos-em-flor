import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class MarkFloristCompensationPaidDto {
  @ApiProperty({ example: 'TRF-2026-00123' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  paymentReference!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  paymentNotes?: string;
}
