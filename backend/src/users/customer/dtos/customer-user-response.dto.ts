
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerUserResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Diogo' })
  firstName!: string;

  @ApiProperty({ example: 'Silva' })
  lastName!: string;

  @ApiProperty({ example: 'diogo@example.com' })
  email!: string;

  @ApiPropertyOptional({ example: '+351912345678', nullable: true })
  phone!: string;

  @ApiPropertyOptional({ nullable: true }) taxNumber!: string | null;
  @ApiPropertyOptional({ nullable: true }) billingStreet!: string | null;
  @ApiPropertyOptional({ nullable: true }) billingStreetNumber!: string | null;
  @ApiPropertyOptional({ nullable: true }) billingStreet2!: string | null;
  @ApiPropertyOptional({ nullable: true }) billingPostalCode!: string | null;
  @ApiPropertyOptional({ nullable: true }) billingCity!: string | null;
  @ApiPropertyOptional({ nullable: true }) billingDistrict!: string | null;
  @ApiPropertyOptional({ nullable: true }) billingCountryCode!: string | null;

  @ApiProperty({ example: false })
  emailVerified!: boolean;
}
