import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Diogo',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Silva',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    example: 'admin@momentosemflor.pt',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Admin123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    example: '+351912345678',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.CUSTOMER,
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({
    example: 1,
  })
  @IsOptional()
  @IsInt()
  floristId?: number;
}