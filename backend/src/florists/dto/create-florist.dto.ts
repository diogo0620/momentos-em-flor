import { CreateAddressDto } from '@/addresses/dto/create-address.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
    IsEmail,
    IsInt,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    IsUrl,
    MaxLength,
    Min,
} from 'class-validator';

export class CreateFloristDto {
    @ApiProperty({
        example: 'Momentos em Flor Braga',
    })
    @IsString()
    @MaxLength(100)
    name: string;

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
    taxNumber: string;

    @ApiProperty({
        example: 'braga@momentosemflor.pt',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: '+351253000000',
    })
    @IsString()
    @MaxLength(30)
    phone: string;

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
        example: 20,
    })
    @IsNumber()
    @Min(0)
    deliveryRadiusKm: number;

    @ApiProperty({
        type: CreateAddressDto,
    })
    @ValidateNested()
    @Type(() => CreateAddressDto)
    address: CreateAddressDto;
}