
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class AdminUserListResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Diogo' })
  firstName!: string;

  @ApiProperty({ example: 'Silva' })
  lastName!: string;

  @ApiProperty({ example: 'diogo@example.com' })
  email!: string;

  @ApiProperty({ example: '912312345' })
  phone!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CUSTOMER })
  role!: UserRole;

  @ApiProperty({ example: true })
  active!: boolean;
}
