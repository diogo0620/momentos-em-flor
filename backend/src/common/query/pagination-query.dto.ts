import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from '@/common/constants/pagination.constants';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class PaginationQueryDto {


  @ApiPropertyOptional({
    default: DEFAULT_PAGE_SIZE,
    minimum: 1,
    maximum: MAX_PAGE_SIZE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  page: number = DEFAULT_PAGE;

  @ApiPropertyOptional({
    default: DEFAULT_PAGE_SIZE,
    minimum: 1,
    maximum: MAX_PAGE_SIZE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  pageSize: number = DEFAULT_PAGE_SIZE;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    default: 'name',
  })
  @IsOptional()
  @IsString()
  sort: string = 'name';

  @ApiPropertyOptional({
    enum: SortOrder,
    default: SortOrder.ASC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  order: SortOrder = SortOrder.ASC;
}