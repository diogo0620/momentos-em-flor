import { BaseQueryDto } from '@/common/dto/base-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';


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

    @ApiPropertyOptional({
        example: 10,
        description: 'Minimum product price',
        minimum: 0,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    minPrice?: number;

    @ApiPropertyOptional({
        example: 100,
        description: 'Maximum product price',
        minimum: 0,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    maxPrice?: number;

    @ApiPropertyOptional({
        enum: ProductType,
        example: ProductType.SALE,
        description: 'Filter by product type',
    })
    @IsOptional()
    @IsEnum(ProductType)
    type?: ProductType;

    @ApiPropertyOptional({
        example: true,
        description: 'Filter featured products',
    })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    featured?: boolean;
}