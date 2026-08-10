import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

import { OrderStatus } from '@prisma/client';

import { PaginationQueryDto } from '@/common/query/pagination-query.dto';

export class OrderQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: OrderStatus,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  customerId?: number;

  override sort = 'createdAt';
}