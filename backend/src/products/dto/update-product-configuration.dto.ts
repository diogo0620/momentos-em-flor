import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';

import { ProductVariantType } from '@prisma/client';

export class UpdateProductComponentItemDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    id?: number;

    @IsString()
    name: string;

    @IsInt()
    @Min(0)
    minQuantity: number;

    @IsInt()
    @Min(0)
    recommendedQuantity: number;

    @IsInt()
    @Min(0)
    maxQuantity: number;

    @IsNumber()
    @Min(0)
    customerPricePerAdditionalUnit: number;

    @IsNumber()
    @Min(0)
    floristCompensationPerAdditionalUnit: number;

    @IsBoolean()
    @IsOptional()
    active?: boolean;

    @IsInt()
    @Min(0)
    sortOrder: number;
}

export class UpdateProductVariantItemDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    id?: number;

    @IsEnum(ProductVariantType)
    type: ProductVariantType;

    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    code?: string | null;

    @IsNumber()
    @Min(0)
    price: number;

    @IsNumber()
    @Min(0)
    floristCompensation: number;

    @IsBoolean()
    @IsOptional()
    active?: boolean;

    @IsInt()
    @Min(0)
    sortOrder: number;

    /**
     * Existing ProductImage id to associate with this variant.
     * null removes the association.
     */
    @IsOptional()
    @IsInt()
    @Min(1)
    imageId?: number | null;

    @IsOptional()
    @IsString()
    clientId?: string;
}

export class UpdateProductImageItemDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    id?: number;

    @IsInt()
    @Min(1)
    fileId: number;

    @IsOptional()
    @IsString()
    altText?: string | null;

    @IsInt()
    @Min(0)
    sortOrder: number;

    @IsBoolean()
    isPrimary: boolean;

    /**
     * null = product-wide image
     * number = image belongs to this variant
     */
    @IsOptional()
    @IsInt()
    @Min(1)
    variantId?: number | null;

    @IsOptional()
    @IsString()
    variantClientId?: string | null;
}

export class UpdateProductConfigurationDto {
    /**
     * Components and variants are mutually exclusive.
     */
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateProductComponentItemDto)
    @IsOptional()
    components?: UpdateProductComponentItemDto[];

    /**
     * Components and variants are mutually exclusive.
     */
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateProductVariantItemDto)
    @IsOptional()
    variants?: UpdateProductVariantItemDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateProductImageItemDto)
    @IsOptional()
    images?: UpdateProductImageItemDto[];


}