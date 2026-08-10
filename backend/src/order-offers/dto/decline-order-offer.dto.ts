import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class DeclineOrderOfferDto {
  @ApiProperty({
    example: 'Não consigo garantir a entrega neste horário.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}