import {
  ApiPropertyOptional,
} from '@nestjs/swagger';

import {
  IsBoolean,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class UpdateFloristCompensationRuleDto {
  @ApiPropertyOptional({
    example: 35,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  compensationAmount?: number;

  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}