import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

class FloristAddressResponseDto {
    @ApiProperty()
    id: number;

    @ApiPropertyOptional()
    label: string | null;

    @ApiProperty()
    street: string;

    @ApiPropertyOptional()
    street2: string | null;

    @ApiProperty()
    postalCode: string;

    @ApiProperty()
    city: string;

    @ApiProperty()
    district: string;

    @ApiProperty()
    country: string;

    @ApiProperty()
    latitude: number;

    @ApiProperty()
    longitude: number;

    @ApiPropertyOptional()
    notes: string | null;
}

class FloristAdminResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    firstName: string;

    @ApiProperty()
    lastName: string;

    @ApiProperty()
    email: string;

    @ApiPropertyOptional()
    phone: string | null;

    @ApiProperty()
    active: boolean;

    @ApiProperty()
    emailVerified: boolean;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class FloristResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiPropertyOptional()
    legalName: string | null;

    @ApiProperty()
    taxNumber: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    phone: string;

    @ApiPropertyOptional()
    website: string | null;

    @ApiPropertyOptional()
    description: string | null;

    @ApiProperty()
    active: boolean;

    @ApiProperty()
    acceptingOrders: boolean;

    @ApiProperty()
    deliveryRadiusKm: number;

    @ApiProperty({
        type: FloristAddressResponseDto,
    })
    address: FloristAddressResponseDto;

    @ApiProperty({
        type: [FloristAdminResponseDto],
    })
    admins: FloristAdminResponseDto[];

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}