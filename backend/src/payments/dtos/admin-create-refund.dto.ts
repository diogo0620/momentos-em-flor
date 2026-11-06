import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AdminCreateRefundDto {
  @ApiProperty({ description: 'Motivo interno do reembolso total.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason!: string;
}
