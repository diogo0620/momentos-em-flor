import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

import {
    IsArray,
    IsBoolean,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import { ProductType } from '@prisma/client';
import { AdminCreateProductVariantDto } from './admin-create-product-variant.dto';
import { AdminCreateProductComponentDto } from './admin-create-product-component.dto';

export class AdminCreateProductDto {

    @ApiProperty({
        example: 'Ramo de Rosas Vermelhas',
    })
    @IsString()
    name!: string;

    @ApiProperty({
        example: 'bouquets',
        maxLength: 100,
    })
    @IsString()
    @MaxLength(100)
    slug!: string;

    @ApiPropertyOptional({
        example:
            'Ramo composto por rosas vermelhas frescas.',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        enum: ProductType,
        default: ProductType.SALE,
    })
    @IsOptional()
    type?: ProductType;

    @ApiPropertyOptional({
        example: false,
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    featured?: boolean;

    @ApiPropertyOptional({
        example: 50.00,
        description: 'Refundable deposit for rental products.',
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    rentalDeposit?: number;

    @ApiProperty({
        example: 29.90,
        description: 'Base price before VAT.',
    })
    @IsNumber()
    @Min(0)
    customerPrice!: number;

    @ApiProperty({
        example: 25.00,
        description:
            'Base compensation paid to the florist.',
    })
    @IsNumber()
    @Min(0)
    floristPrice!: number;

    @ApiPropertyOptional({
        type: [AdminCreateProductComponentDto],
        description:
            'Categories of the product'
    })
    @IsArray()
    @IsInt({ each: true })
    @Type(() => Number)
    categoryIds!: number[];

    @ApiProperty({
        example: 1,
        description:
            'Tax code applied to the product.',
    })
    @IsInt()
    @Min(1)
    taxCodeId!: number;

    @ApiPropertyOptional({
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    active?: boolean;

    @ApiPropertyOptional({
        type: [AdminCreateProductComponentDto],
        description:
            'Configurable components of the product. ' +
            'Products with variants should not define components.',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AdminCreateProductComponentDto)
    components?: AdminCreateProductComponentDto[];

    @ApiPropertyOptional({
        type: [AdminCreateProductVariantDto],
        description:
            'Variants of the product. ' +
            'Products with components should not define variants.',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AdminCreateProductVariantDto)
    variants?: AdminCreateProductVariantDto[];

    /*
    @ApiPropertyOptional({
        type: [CreateProductImageDto],
        description:
            'Images associated with the product.',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateProductImageDto)
    images?: CreateProductImageDto[];
    */
}