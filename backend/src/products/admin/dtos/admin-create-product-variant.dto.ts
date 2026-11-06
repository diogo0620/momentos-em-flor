import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductVariantType } from '@prisma/client';

export class AdminCreateProductVariantDto {
    @ApiProperty({
        enum: ProductVariantType,
        example: ProductVariantType.SIZE,
    })
    @IsEnum(ProductVariantType)
    type!: ProductVariantType;

    @ApiProperty({ example: 'Médio' })
    @IsString()
    @MaxLength(100)
    name!: string;

    @ApiProperty({ example: 'Médio' })
    @IsString()
    description!: string;

    @ApiProperty({
        example: 39.90,
        description: 'Variant net price, before VAT.',
    })
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    customerPrice!: number;

    @ApiProperty({
        example: 25.00,
        description: 'Florist compensation for this variant.',
    })
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    floristPrice!: number;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    active?: boolean;

    @ApiPropertyOptional({
        example: 0,
        description: 'Display order of the variant.',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    sortOrder?: number;
}