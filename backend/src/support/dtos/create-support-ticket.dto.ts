import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SupportTicketCategory } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateSupportTicketDto {
  @ApiProperty({ maxLength: 160 })
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  subject!: string;

  @ApiProperty({ enum: SupportTicketCategory })
  @IsEnum(SupportTicketCategory)
  category!: SupportTicketCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  orderId?: number;

  @ApiProperty({ maxLength: 5000 })
  @IsString()
  @MinLength(2)
  @MaxLength(5000)
  message!: string;
}
