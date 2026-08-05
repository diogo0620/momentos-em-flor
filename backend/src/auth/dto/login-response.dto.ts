import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class AuthenticatedUserDto {
  @ApiProperty({
    example: 1,
  })
  id: number;

  @ApiProperty({
    example: 'Diogo',
  })
  firstName: string;

  @ApiProperty({
    example: 'Silva',
  })
  lastName: string;

  @ApiProperty({
    example: 'admin@momentosemflor.pt',
  })
  email: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.SYSTEM_ADMIN,
  })
  role: UserRole;
}

export class LoginResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({
    type: AuthenticatedUserDto,
  })
  user: AuthenticatedUserDto;
}