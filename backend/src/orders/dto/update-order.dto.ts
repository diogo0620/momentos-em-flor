import {
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import {
  DeliveryTimeSlot,
  Occasion,
} from '@prisma/client';

export class UpdateOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  recipientFirstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  recipientLastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  recipientPhone?: string;

  @ApiPropertyOptional({
    enum: Occasion,
  })
  @IsOptional()
  @IsEnum(Occasion)
  occasion?: Occasion;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @ApiPropertyOptional({
    enum: DeliveryTimeSlot,
  })
  @IsOptional()
  @IsEnum(DeliveryTimeSlot)
  deliveryTimeSlot?: DeliveryTimeSlot;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  deliveryInstructions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  deliveryStreet?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  deliveryStreet2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  deliveryPostalCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  deliveryCity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  deliveryDistrict?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2)
  deliveryCountryCode?: string;


  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  cardMessage?: string;
}