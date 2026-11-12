import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { MarkFloristCompensationPaidDto } from './mark-florist-compensation-paid.dto';

export class MarkFloristCompensationsPaidDto extends MarkFloristCompensationPaidDto {
  @ApiProperty({ type: [Number] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsInt({ each: true })
  @Type(() => Number)
  ids!: number[];
}
