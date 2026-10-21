
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class AuthUserDto {
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

  @ApiProperty({ enum: UserRole, example: UserRole.CUSTOMER })
  role!: UserRole;

  @ApiProperty({ example: true })
  active!: boolean;

  @ApiProperty({ example: 'diogo@example.com' })
  passwordHash!: string;


  
}

