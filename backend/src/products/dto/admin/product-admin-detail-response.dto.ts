import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductAdminTaxCodeDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    code: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    rate: number;

    @ApiProperty()
    active: boolean;
}

export class ProductAdminCategoryDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    slug: string;

    @ApiPropertyOptional()
    description: string | null;

    @ApiProperty()
    active: boolean;
}

export class ProductAdminImageDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    fileId: number;

    @ApiProperty()
    url: string;

    @ApiPropertyOptional()
    altText: string | null;

    @ApiProperty()
    sortOrder: number;

    @ApiProperty()
    isPrimary: boolean;

    @ApiPropertyOptional()
    variantId: number | null;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiPropertyOptional()
    deletedAt: Date | null;
}

export class ProductAdminComponentDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    minQuantity: number;

    @ApiProperty()
    recommendedQuantity: number;

    @ApiProperty()
    maxQuantity: number;

    @ApiProperty()
    customerPricePerAdditionalUnit: number;

    @ApiProperty()
    floristCompensationPerAdditionalUnit: number;

    @ApiProperty()
    sortOrder: number;

    @ApiProperty()
    active: boolean;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiPropertyOptional()
    deletedAt: Date | null;
}

export class ProductAdminVariantDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    type: string;

    @ApiProperty()
    name: string;

    @ApiPropertyOptional()
    code: string | null;

    @ApiProperty()
    price: number;

    @ApiProperty()
    floristCompensation: number;

    @ApiProperty()
    sortOrder: number;

    @ApiProperty()
    active: boolean;

    @ApiPropertyOptional({
        type: () => ProductAdminImageDto,
        nullable: true,
    })
    image: ProductAdminImageDto | null;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiPropertyOptional()
    deletedAt: Date | null;
}

export class ProductAdminDetailResponseDto {
    // -------------------------------------------------------------------------
    // Product — mirror of Product scalar fields
    // -------------------------------------------------------------------------

    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    slug: string;

    @ApiPropertyOptional()
    description: string | null;

    @ApiProperty()
    active: boolean;

    @ApiProperty()
    pricingType: string;

    @ApiPropertyOptional()
    basePrice: number | null;

    @ApiPropertyOptional()
    baseFloristCompensation: number | null;

    @ApiProperty()
    sortOrder: number;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiPropertyOptional()
    deletedAt: Date | null;

    // -------------------------------------------------------------------------
    // Relations
    // -------------------------------------------------------------------------

    @ApiProperty({
        type: () => ProductAdminTaxCodeDto,
    })
    taxCode: ProductAdminTaxCodeDto;

    @ApiProperty({
        type: () => ProductAdminCategoryDto,
    })
    category: ProductAdminCategoryDto;

    @ApiProperty({
        type: () => [ProductAdminImageDto],
    })
    images: ProductAdminImageDto[];

    @ApiProperty({
        type: () => [ProductAdminComponentDto],
    })
    components: ProductAdminComponentDto[];

    @ApiProperty({
        type: () => [ProductAdminVariantDto],
    })
    variants: ProductAdminVariantDto[];
}