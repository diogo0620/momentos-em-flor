import { BaseQueryDto } from '@/common/dto/base-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class PublicProductQueryDto extends BaseQueryDto {


    @ApiPropertyOptional({
        example: 1,
        description: 'Filter by category',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    categoryId?: number;


}