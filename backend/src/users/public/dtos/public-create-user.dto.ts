import { IsStrongPassword } from '@/common/validators/password.validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class PublicCreateUserDto {
  @ApiProperty({
    example: 'Diogo',
  })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({
    example: 'Silva',
  })
  @IsString()
  @IsNotEmpty()
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

  @ApiProperty({
    example: '+351912345678',
  })
  @IsString()
  @IsNotEmpty()
  phone!: string;
}
