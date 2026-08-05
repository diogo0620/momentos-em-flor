import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UserResponseDto {
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

  @ApiPropertyOptional({
    example: '+351912345678',
  })
  phone?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
  })
  avatarUrl?: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.SYSTEM_ADMIN,
  })
  role: UserRole;

  @ApiProperty({
    example: true,
  })
  active: boolean;

  @ApiProperty({
    example: true,
  })
  emailVerified: boolean;

  @ApiPropertyOptional({
    example: 1,
  })
  floristId?: number;

  @ApiPropertyOptional({
    example: '2026-08-05T17:00:00.000Z',
  })
  lastLoginAt?: Date;

  @ApiProperty({
    example: '2026-08-05T17:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-08-05T17:00:00.000Z',
  })
  updatedAt: Date;
}