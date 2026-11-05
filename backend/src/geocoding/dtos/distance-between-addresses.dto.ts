import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';

export class GeocodingAddressDto {
  @IsString() @IsNotEmpty() street!: string;
  @IsString() @IsNotEmpty() streetNumber!: string;
  @IsOptional() @IsString() street2?: string;
  @IsString() @IsNotEmpty() postalCode!: string;
  @IsString() @IsNotEmpty() city!: string;
  @IsOptional() @IsString() district?: string;
  @IsString() @Length(2, 2) countryCode!: string;
}

export class DistanceBetweenAddressesDto {
  @ValidateNested()
  @Type(() => GeocodingAddressDto)
  from!: GeocodingAddressDto;

  @ValidateNested()
  @Type(() => GeocodingAddressDto)
  to!: GeocodingAddressDto;
}
