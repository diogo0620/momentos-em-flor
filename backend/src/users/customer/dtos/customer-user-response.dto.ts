
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

  @ApiProperty({ example: false })
  emailVerified!: boolean;
}