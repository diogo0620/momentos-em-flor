import { ApiPropertyOptional } from '@nestjs/swagger';
import { FloristCompensationStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { BaseQueryDto } from '@/common/dto/base-query.dto';

export class FloristCompensationQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({ enum: FloristCompensationStatus })
  @IsOptional()
  @IsEnum(FloristCompensationStatus)
  status?: FloristCompensationStatus;
}
