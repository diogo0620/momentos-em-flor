import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    Length,
} from 'class-validator';

export class CreateAddressDto {
    @ApiProperty()
    @IsString()
    @MaxLength(100)
    street: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(100)
    street2?: string;

    @ApiProperty()
    @IsString()
    @MaxLength(20)
    postalCode: string;

    @ApiProperty()
    @IsString()
    @MaxLength(100)
    city: string;

    @ApiProperty()
    @IsString()
    @MaxLength(100)
    district: string;

    @ApiProperty({
        example: 'PT',
    })
    @IsString()
    @Length(2, 2)
    countryCode: string;


    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    notes?: string;
}