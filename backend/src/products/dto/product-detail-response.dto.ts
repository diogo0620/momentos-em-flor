import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

import {
    ProductPricingType,
    ProductVariantType,
} from '@prisma/client';






/*
 * ============================================================
 * IMAGE
 * ============================================================
 */

export class ProductDetailImageDto {

    @ApiProperty({
        example: '/uploads/products/ramo-primavera.jpg',
    })
    url: string;
}

export class ProductDetailCategoryDto {

    @ApiProperty({
        example: 1,
    })
    id: number;

    @ApiProperty({
        example: 'Bouquets',
    })
    name: string;
}


/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export class ProductDetailComponentDto {

    @ApiProperty({
        example: 1,
    })
    id: number;

    @ApiProperty({
        example: 'Rosas',
    })
    name: string;

    @ApiProperty({
        example: 6,
    })
    minQuantity: number;

    @ApiProperty({
        example: 12,
    })
    recommendedQuantity: number;

    @ApiProperty({
        example: 24,
    })
    maxQuantity: number;

    @ApiProperty({
        example: 2.50,
    })
    customerPricePerAdditionalUnit: number;
}


/*
 * ============================================================
 * VARIANT
 * ============================================================
 */

export class ProductDetailVariantDto {

    @ApiProperty({
        example: 1,
    })
    id: number;

    @ApiProperty({
        enum: ProductVariantType,
        example: ProductVariantType.SIZE,
    })
    type: ProductVariantType;

    @ApiProperty({
        example: 'Média',
    })
    name: string;

    @ApiPropertyOptional({
        example: 'COROA-M',
        nullable: true,
    })
    code: string | null;

    @ApiProperty({
        example: 59.90,
        description: 'Final price including VAT.',
    })
    price: number;

    @ApiProperty({
        type: ProductDetailImageDto,
        nullable: true,
    })
    image: ProductDetailImageDto | null;
}


/*
 * ============================================================
 * PRODUCT DETAIL
 * ============================================================
 */

export class ProductDetailResponseDto {

    @ApiProperty({
        example: 1,
    })
    id: number;

    @ApiProperty({
        example: 'Coroa de Flores',
    })
    name: string;

    @ApiProperty({
        example: 'coroa-de-flores',
    })
    slug: string;

    @ApiPropertyOptional({
        example:
            'Coroa de flores frescas para cerimónias.',
        nullable: true,
    })
    description: string | null;

    @ApiProperty({
        enum: ProductPricingType,
        example: ProductPricingType.FIXED,
    })
    pricingType: ProductPricingType;

    @ApiProperty({
        example: 59.90,
        description: 'Product price including VAT. Null when the product uses variants.',
    })
    price: number;

    @ApiProperty({
        type: ProductDetailCategoryDto,
    })
    category: ProductDetailCategoryDto;

    @ApiProperty({
        type: ProductDetailImageDto,
        isArray: true,
    })
    images: ProductDetailImageDto[];

    @ApiProperty({
        type: ProductDetailComponentDto,
        isArray: true,
    })
    components: ProductDetailComponentDto[];

    @ApiProperty({
        type: ProductDetailVariantDto,
        isArray: true,
    })
    variants: ProductDetailVariantDto[];
}