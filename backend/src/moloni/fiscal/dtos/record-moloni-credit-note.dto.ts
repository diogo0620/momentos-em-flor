import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsString, MaxLength } from 'class-validator';

export class RecordMoloniCreditNoteDto {
  @ApiProperty({ description: 'ID da nota de crédito emitida manualmente na Moloni.' })
  @IsString()
  @IsNotEmpty()
  @IsNumberString()
  @MaxLength(100)
  creditNoteId!: string;
}
