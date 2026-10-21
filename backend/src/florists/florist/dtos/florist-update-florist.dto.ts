import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class FloristUpdateFloristDto {
  @ApiProperty({
    example: 'Momentos em Flor Braga',
  })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({
    example: 'Momentos em Flor Braga, Lda.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  legalName?: string;

  @ApiProperty({
    example: '999999990',
  })
  @IsString()
  @MaxLength(20)
  taxNumber!: string;

  @ApiProperty({
    example: 'braga@momentosemflor.pt',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '+351253000000',
  })
  @IsString()
  @MaxLength(30)
  phone!: string;

  @ApiPropertyOptional({
    example: 'https://momentosemflor.pt',
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({
    example: 'Florista parceira de Braga.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    example: 'Rua de Santa Catarina',
  })
  @IsString()
  @MaxLength(255)
  addressStreet!: string;

  @ApiProperty({
    example: '100',
  })
  @IsString()
  @MaxLength(255)
  addressStreetNumber!: string;

  @ApiPropertyOptional({
    example: '2º Esq.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressStreet2?: string;

  @ApiProperty({
    example: '4000-447',
  })
  @IsString()
  @MaxLength(20)
  addressPostalCode!: string;

  @ApiProperty({
    example: 'Porto',
  })
  @IsString()
  @MaxLength(100)
  addressCity!: string;

  @ApiProperty({
    example: 'Porto',
  })
  @IsString()
  @MaxLength(100)
  addressDistrict!: string;

  @ApiProperty({
    example: 'PT',
  })
  @IsString()
  @MaxLength(2)
  addressCountryCode!: string;

  @ApiProperty({
    example: 20,
  })
  @IsNumber()
  @Min(0)
  deliveryRadiusKm!: number;

  @ApiPropertyOptional({
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  acceptingOrders?: boolean;

  @ApiPropertyOptional({
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}