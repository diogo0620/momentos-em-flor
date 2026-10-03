import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

import {
    ProductVariantType,
} from '@prisma/client';

export class CreateProductVariantDto {
    @ApiProperty({
        enum: ProductVariantType,
        example: ProductVariantType.SIZE,
    })
    type: ProductVariantType;

    @ApiProperty({
        example: 'Médio',
    })
    name: string;

    @ApiPropertyOptional({
        example: 'MEDIUM',
        nullable: true,
    })
    code?: string | null;

    @ApiProperty({
        example: 39.90,
        description:
            'Variant net price, before VAT.',
    })
    customerPrice: number;

    @ApiProperty({
        example: 25.00,
        description:
            'Florist compensation for this variant.',
    })
    floristPrice: number;

    @ApiPropertyOptional({
        example: true,
    })
    active?: boolean;

    @ApiPropertyOptional({
        example: 0,
        description:
            'Display order of the variant.',
    })
    sortOrder?: number;
}