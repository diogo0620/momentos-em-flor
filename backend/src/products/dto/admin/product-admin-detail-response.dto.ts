import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

import {
    ProductPricingType,
    ProductVariantType,
} from '@prisma/client';

import { CategoryResponseDto } from '@/categories/dto/category-response.dto';


/*
 * ============================================================
 * IMAGE
 * ============================================================
 */

export class ProductAdminImageDto {

    @ApiProperty({
        example: 1,
    })
    id: number;

    @ApiProperty({
        example: 10,
    })
    fileId: number;

    @ApiProperty({
        example: '/uploads/products/ramo-primavera.jpg',
    })
    url: string;

    @ApiPropertyOptional({
        example: 'Ramo Primavera',
        nullable: true,
    })
    altText: string | null;

    @ApiProperty({
        example: true,
    })
    isPrimary: boolean;

    @ApiProperty({
        example: 0,
    })
    sortOrder: number;

    @ApiProperty({
        nullable: true,
        example: null,
        description: 'Product variant associated with the image, if any.',
    })
    variantId: number | null;
}


/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export class ProductAdminComponentDto {

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
        description:
            'Additional amount charged to the customer per unit.',
    })
    customerPricePerAdditionalUnit: number;

    @ApiProperty({
        example: 1.50,
        description:
            'Additional compensation paid to the florist per unit.',
    })
    floristCompensationPerAdditionalUnit: number;

    @ApiProperty({
        example: 0,
    })
    sortOrder: number;

    @ApiProperty({
        example: true,
    })
    active: boolean;
}


/*
 * ============================================================
 * VARIANT
 * ============================================================
 */

export class ProductAdminVariantDto {

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
        description:
            'Final customer price including VAT.',
    })
    price: number;

    @ApiProperty({
        example: 42.00,
        description:
            'Compensation paid to the florist for this variant.',
    })
    floristCompensation: number;

    @ApiProperty({
        type: ProductAdminImageDto,
        nullable: true,
    })
    image: ProductAdminImageDto | null;

    @ApiProperty({
        example: 0,
    })
    sortOrder: number;

    @ApiProperty({
        example: true,
    })
    active: boolean;
}


/*
 * ============================================================
 * PRODUCT DETAIL
 * ============================================================
 */

export class ProductAdminDetailResponseDto {

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

    /*
     * Product-level pricing.
     *
     * When the product uses variants, basePrice and
     * baseFloristCompensation may be null.
     */

    @ApiProperty({
        example: 39.90,
        nullable: true,
        description:
            'Product base price before VAT.',
    })
    basePrice: number | null;

    @ApiProperty({
        example: 30.00,
        nullable: true,
        description:
            'Base compensation paid to the florist.',
    })
    baseFloristCompensation: number | null;

    @ApiProperty({
        example: 49.08,
        description:
            'Final customer price including VAT. ' +
            'For products with variants, this is the lowest active variant price.',
    })
    price: number;

    @ApiProperty({
        type: CategoryResponseDto,
    })
    category: CategoryResponseDto;

    /*
     * Product-wide images.
     */

    @ApiProperty({
        type: ProductAdminImageDto,
        isArray: true,
    })
    images: ProductAdminImageDto[];

    /*
     * Configurable components.
     */

    @ApiProperty({
        type: ProductAdminComponentDto,
        isArray: true,
    })
    components: ProductAdminComponentDto[];

    /*
     * Product variants.
     */

    @ApiProperty({
        type: ProductAdminVariantDto,
        isArray: true,
    })
    variants: ProductAdminVariantDto[];

    @ApiProperty({
        example: 0,
    })
    sortOrder: number;

    @ApiProperty({
        example: true,
    })
    active: boolean;

    @ApiProperty({
        example: '2026-09-02T12:00:00.000Z',
    })
    createdAt: Date;

    @ApiProperty({
        example: '2026-09-02T12:00:00.000Z',
    })
    updatedAt: Date;
}
