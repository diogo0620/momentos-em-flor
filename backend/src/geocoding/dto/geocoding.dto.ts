import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

import {
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';

export class GeocodeAddressDto {
    @ApiProperty({
        example: 'Rua dos Combatentes',
        description: 'Street name and number.',
    })
    @IsString()
    @IsNotEmpty()
    street: string;

    @ApiPropertyOptional({
        example: 'Nº 25, 2º Esq.',
        nullable: true,
        description: 'Additional address information.',
    })
    @IsOptional()
    @IsString()
    street2?: string | null;

    @ApiProperty({
        example: '3880-000',
        description: 'Postal code.',
    })
    @IsString()
    @IsNotEmpty()
    postalCode: string;

    @ApiProperty({
        example: 'Ovar',
        description: 'City.',
    })
    @IsString()
    @IsNotEmpty()
    city: string;

    @ApiPropertyOptional({
        example: 'Aveiro',
        nullable: true,
        description: 'District or administrative region.',
    })
    @IsOptional()
    @IsString()
    district?: string | null;

    @ApiProperty({
        example: 'PT',
        description: 'ISO 3166-1 alpha-2 country code.',
    })
    @IsString()
    @IsNotEmpty()
    countryCode: string;
}