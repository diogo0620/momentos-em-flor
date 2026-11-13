import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSupportMessageDto {
  @ApiProperty({ maxLength: 5000 })
  @IsString()
  @MinLength(2)
  @MaxLength(5000)
  message!: string;
}
