import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
} from 'class-validator';

export class FloristUpdateUserDto {
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

  @ApiPropertyOptional({
    example: '+351912345678',
  })
  @IsOptional()
  @IsString()
  phone!: string;

}