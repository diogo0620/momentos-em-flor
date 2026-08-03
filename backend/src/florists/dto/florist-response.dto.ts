import { AddressResponseDto } from '@/addresses/dto/address-response.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FloristResponseDto {
    @ApiProperty({
        example: 1,
    })
    id: number;

    @ApiProperty({
        example: 'Momentos em Flor Braga',
    })
    name: string;

    @ApiPropertyOptional({
        example: 'Momentos em Flor Braga, Lda.',
    })
    legalName?: string;

    @ApiProperty({
        example: '999999990',
    })
    taxNumber: string;

    @ApiProperty({
        example: 'braga@momentosemflor.pt',
    })
    email: string;

    @ApiProperty({
        example: '+351253000000',
    })
    phone: string;

    @ApiPropertyOptional({
        example: 'https://momentosemflor.pt',
    })
    website?: string;

    @ApiPropertyOptional({
        example: 'Florista parceira de Braga.',
    })
    description?: string;

    @ApiProperty({
        example: true,
    })
    active: boolean;

    @ApiProperty({
        example: true,
    })
    acceptingOrders: boolean;

    @ApiProperty({
        example: 20,
    })
    deliveryRadiusKm: number;

    @ApiProperty({
        type: AddressResponseDto,
    })
    address: AddressResponseDto;

    @ApiProperty({
        example: '2026-08-03T15:00:00.000Z',
    })
    createdAt: Date;

    @ApiProperty({
        example: '2026-08-03T15:00:00.000Z',
    })
    updatedAt: Date;
}