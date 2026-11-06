import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class DeliveryAvailabilityDto {
  @ApiProperty() @IsString() @MaxLength(255) street!: string;
  @ApiProperty() @IsString() @MaxLength(255) streetNumber!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255) street2?: string;
  @ApiProperty() @IsString() @MaxLength(20) postalCode!: string;
  @ApiProperty() @IsString() @MaxLength(100) city!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) district?: string;
  @ApiProperty() @IsString() @MaxLength(2) countryCode!: string;
}

export class DeliveryAvailabilityResponseDto {
  @ApiProperty() available!: boolean;
  @ApiProperty({ nullable: true }) distanceKm!: number | null;
  @ApiProperty() radiusKm!: number;
  @ApiProperty() areaName!: string;
}
