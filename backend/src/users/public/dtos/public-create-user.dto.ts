import { IsStrongPassword } from '@/common/validators/password.validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class PublicCreateUserDto {
  @ApiProperty({
    example: 'Diogo',
  })
  @IsString()
  firstName!: string;

  @ApiProperty({
    example: 'Silva',
  })
  @IsString()
  lastName!: string;

  @ApiProperty({
    example: 'admin@momentosemflor.pt',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Admin123!',
    minLength: 8,
  })
  @IsString()
  @IsStrongPassword()
  password!: string;

  @ApiPropertyOptional({
    example: '+351912345678',
  })
  @IsOptional()
  @IsString()
  phone!: string;
}