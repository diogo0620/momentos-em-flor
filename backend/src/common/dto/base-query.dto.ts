
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../query/pagination-query.dto';
import { Transform } from 'class-transformer';


export class BaseQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Filter by active status.',
  })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
