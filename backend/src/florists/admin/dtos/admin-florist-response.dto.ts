
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class AdminFloristAdminResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty()
  email!: string;

  @ApiPropertyOptional()
  active!: boolean;
}

export class AdminFloristResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  legalName?: string;

  @ApiProperty()
  taxNumber!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  phone!: string;

  @ApiPropertyOptional()
  website?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  addressStreet!: string;

  @ApiProperty()
  addressStreetNumber!: string;

  @ApiPropertyOptional()
  addressStreet2?: string;

  @ApiProperty()
  addressPostalCode!: string;

  @ApiProperty()
  addressCity!: string;

  @ApiProperty()
  addressDistrict!: string;

  @ApiProperty()
  addressCountryCode!: string;

  @ApiProperty()
  addressLatitude!: number | undefined;

  @ApiProperty()
  addressLongitude!: number | undefined;

  @ApiProperty()
  deliveryRadiusKm!: number;

  @ApiPropertyOptional()
  acceptingOrders!: boolean;

  @ApiPropertyOptional()
  active!: boolean;

  @ApiProperty({
    type: [AdminFloristAdminResponseDto],
  })
  admins!: AdminFloristAdminResponseDto[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}


