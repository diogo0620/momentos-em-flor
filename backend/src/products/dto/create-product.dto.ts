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
    Min,
    ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import { CreateProductComponentDto } from './create-product-component.dto';
import { CreateProductVariantDto } from './create-product-variant.dto';
import { CreateProductImageDto } from './create-product-image.dto';

export class CreateProductDto {

    @ApiProperty({
        example: 'Ramo de Rosas Vermelhas',
    })
    @IsString()
    name: string;

    @ApiPropertyOptional({
        example:
            'Ramo composto por rosas vermelhas frescas.',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        example: 29.90,
        description: 'Base price before VAT.',
    })
    @IsNumber()
    @Min(0)
    basePrice: number;

    @ApiProperty({
        example: 25.00,
        description:
            'Base compensation paid to the florist.',
    })
    @IsNumber()
    @Min(0)
    baseFloristCompensation: number;

    @ApiProperty({
        example: 1,
    })
    @IsInt()
    @Min(1)
    categoryId: number;

    @ApiProperty({
        example: 1,
        description:
            'Tax code applied to the product.',
    })
    @IsInt()
    @Min(1)
    taxCodeId: number;

    @ApiPropertyOptional({
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    active?: boolean;

    @ApiPropertyOptional({
        type: [CreateProductComponentDto],
        description:
            'Configurable components of the product. ' +
            'Products with variants should not define components.',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateProductComponentDto)
    components?: CreateProductComponentDto[];

    @ApiPropertyOptional({
        type: [CreateProductVariantDto],
        description:
            'Variants of the product. ' +
            'Products with components should not define variants.',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateProductVariantDto)
    variants?: CreateProductVariantDto[];

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
}