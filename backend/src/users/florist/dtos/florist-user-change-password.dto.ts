import { IsStrongPassword } from '@/common/validators/password.validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
} from 'class-validator';

export class FloristUserChangePasswordDto {
  @ApiProperty({
    example: 'CurrentPassword123!',
  })
  @IsString()
  currentPassword!: string;

  @ApiProperty({
    example: 'NewPassword123!',
    minLength: 8,
  })
  @IsString()
  @IsStrongPassword()
  newPassword!: string;
}