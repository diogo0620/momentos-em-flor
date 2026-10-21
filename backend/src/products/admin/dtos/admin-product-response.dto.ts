import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

import {
    ProductVariantType,
    ProductType
} from '@prisma/client';





export class AdminProductCategoryDto {

    @ApiProperty({
        example: 1,
    })
    id!: number;

    @ApiProperty({
        example: 'Bouquets',
    })
    name!: string;
}

export class AdminTaxCodeDto {
    @ApiProperty({
        example: 1,
    })
    id!: number;

    @ApiProperty({
        example: 'Iva Normal',
    })
    name!: string;
}


/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export class AdminProductComponentDto {

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
    customerPricePerAdditionalUnit!: number;

    @ApiProperty({
        example: 1.50,
    })
    floristPricePerAdditionalUnit!: number;
}


/*
 * ============================================================
 * VARIANT
 * ============================================================
 */

export class AdminProductVariantDto {

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
    customerPrice!: number;

    @ApiProperty({
        example: 59.90,
        description: 'Final price including VAT.',
    })
    floristPrice!: number;

    @ApiProperty({})
    image!: string;
}


/*
 * ============================================================
 * PRODUCT DETAIL
 * ============================================================
 */

export class AdminProductResponseDto {

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
    customerPrice!: number;

    @ApiProperty({
        example: 59.90,
        description: 'Product price including VAT. Null when the product uses variants.',
    })
    floristPrice!: number;

    @ApiProperty({
        type: AdminProductCategoryDto,
        isArray: true
    })
    categories!: AdminProductCategoryDto[];

    @ApiProperty({
    })
    images!: string[];

    @ApiProperty({
        type: AdminProductComponentDto,
        isArray: true,
    })
    components?: AdminProductComponentDto[];

    @ApiProperty({
        type: AdminProductVariantDto,
        isArray: true,
    })
    variants?: AdminProductVariantDto[];

    @ApiProperty({})
    taxCode!: AdminTaxCodeDto;


    @ApiProperty({
        example: true,
    })
    active!: boolean;

    @ApiProperty({
        enum: ProductType,
    })
    type!: ProductType;

    @ApiProperty({
        example: false,
    })
    featured!: boolean;

    @ApiPropertyOptional({
        example: 50.00,
        nullable: true,
        description: 'Refundable deposit for rental products.',
    })
    rentalDeposit?: number | null;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}