
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsStrongPassword } from '@/common/validators/password.validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token recebido no email de recuperação',
    example: 'a1b2c3...',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({
    description: 'Nova password',
    example: 'NovaPassword123!',
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  newPassword!: string;
}
