import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

import {
    ProductVariantType,
    ProductType
} from '@prisma/client';





export class PublicProductCategoryDto {

    @ApiProperty({
        example: 1,
    })
    id!: number;

    @ApiProperty({
        example: 'Bouquets',
    })
    name!: string;
}


/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export class PublicProductComponentDto {

    @ApiProperty({
        example: 1,
    })
    id!: number;

    @ApiProperty({
        example: 'Rosas',
    })
    name!: string;

    @ApiProperty({
        example: 6,
    })
    minQuantity!: number;

    @ApiProperty({
        example: 12,
    })
    recommendedQuantity!: number;

    @ApiProperty({
        example: 24,
    })
    maxQuantity!: number;

    @ApiProperty({
        example: 2.50,
    })
    pricePerAdditionalUnit!: number;
}


/*
 * ============================================================
 * VARIANT
 * ============================================================
 */

export class PublicProductVariantDto {

    @ApiProperty({
        example: 1,
    })
    id!: number;

    @ApiProperty({
        enum: ProductVariantType,
        example: ProductVariantType.SIZE,
    })
    type!: ProductVariantType;

    @ApiProperty({
        example: 'Média',
    })
    name!: string;

    @ApiProperty({
        example: 'Média',
    })
    description!: string;

    @ApiProperty({
        example: 59.90,
        description: 'Final price including VAT.',
    })
    price!: number;


    image!: string
}


/*
 * ============================================================
 * PRODUCT DETAIL
 * ============================================================
 */

export class PublicProductResponseDto {

    @ApiProperty({
        example: 1,
    })
    id!: number;

    @ApiProperty({
        example: 'Coroa de Flores',
    })
    name!: string;

    @ApiProperty({
        example: 'coroa-de-flores',
    })
    slug!: string;

    @ApiPropertyOptional({
        example:
            'Coroa de flores frescas para cerimónias.',
        nullable: true,
    })
    description!: string | null;

    @ApiProperty({
        example: 59.90,
        description: 'Product price including VAT. Null when the product uses variants.',
    })
    price!: number;

    @ApiProperty({
        type: PublicProductCategoryDto,
    })
    categories!: PublicProductCategoryDto[];

    @ApiProperty({
        isArray: true,
    })
    images!: string[];

    @ApiProperty({
        type: PublicProductComponentDto,
        isArray: true,
    })
    components?: PublicProductComponentDto[];

    @ApiProperty({
        type: PublicProductVariantDto,
        isArray: true,
    })
    variants?: PublicProductVariantDto[];

    @ApiProperty({
        enum: ProductType,
    })
    type!: ProductType;

    @ApiPropertyOptional({
        example: 50.00,
        nullable: true,
        description: 'Refundable deposit for rental products.',
    })
    rentalDeposit?: number | null;
}