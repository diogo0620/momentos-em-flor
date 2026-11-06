
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class AdminUserResponseDto {
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

  @ApiProperty({ example: false })
  emailVerified!: boolean;

  @ApiPropertyOptional({ example: 1, nullable: true })
  florist!: UserFloristResponseDto | null;

  @ApiProperty({ example: '2026-01-01T10:00:00.000Z' })
  lastLoginAt!: Date | null;

  @ApiProperty({ example: '2026-01-01T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T10:00:00.000Z' })
  updatedAt!: Date;
}

class UserFloristResponseDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    name!: string;
}
