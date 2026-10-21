import { BaseQueryDto } from '@/common/dto/base-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AdminProductQueryDto extends BaseQueryDto {


    @ApiPropertyOptional({
        example: 1,
        description: 'Filter by category',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    categoryId?: number;

    @ApiPropertyOptional({
        enum: ProductType,
        example: ProductType.SALE,
        description: "Filter by product type",
    })
    @IsOptional()
    @IsEnum(ProductType)
    type?: ProductType;

    @ApiPropertyOptional({
        example: true,
        description: "Filter by featured status",
    })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    featured?: boolean;


}