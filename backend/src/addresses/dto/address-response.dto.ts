import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddressResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  street: string;

  @ApiPropertyOptional()
  street2?: string;

  @ApiProperty()
  postalCode: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  district: string;

  @ApiProperty()
  countryCode: string;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiPropertyOptional()
  notes?: string;
}