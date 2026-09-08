import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

import { ProductVariantType } from '@prisma/client';

export class CreateProductVariantDto {

    @ApiProperty({
        example: ProductVariantType.SIZE,
        enum: ProductVariantType,
        description:
            'Type of the product variant.',
    })
    type: ProductVariantType;

    @ApiProperty({
        example: 'Média',
        description:
            'Display name of the variant.',
    })
    name: string;

    @ApiPropertyOptional({
        example: 'COROA-M',
        description:
            'Optional value used internally to identify the variant.',
    })
    code: string;

    @ApiPropertyOptional({
        example: 'medium',
        description:
            'Optional value used internally to identify the variant.',
    })
    value?: string;

    @ApiProperty({
        example: 39.90,
        description:
            'Price of this variant before VAT.',
    })
    price: number;

    @ApiProperty({
        example: 30.00,
        description:
            'Florist compensation for this variant.',
    })
    floristCompensation: number;

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
