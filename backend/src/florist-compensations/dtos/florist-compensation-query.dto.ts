import { ApiPropertyOptional } from '@nestjs/swagger';
import { FloristCompensationStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseQueryDto } from '@/common/dto/base-query.dto';

export class FloristCompensationQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({ enum: FloristCompensationStatus })
  @IsOptional()
  @IsEnum(FloristCompensationStatus)
  status?: FloristCompensationStatus;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  floristId?: number;
}
