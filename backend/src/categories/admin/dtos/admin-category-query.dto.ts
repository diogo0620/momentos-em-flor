import { BaseQueryDto } from '@/common/dto/base-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsBoolean } from 'class-validator';

export class AdminCategoryQueryDto extends BaseQueryDto {

    @ApiPropertyOptional({
        example: true,
        description: "Filter by featured status",
    })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    featured?: boolean;

}