import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

import { CreateProductComponentDto } from './create-product-component.dto';
import { CreateProductVariantDto } from './create-product-variant.dto';
import { CreateProductImageDto } from './create-product-image.dto';

export class CreateProductDto {

    @ApiProperty({
        example: 'Ramo de Rosas Vermelhas',
    })
    name: string;

    @ApiPropertyOptional({
        example:
            'Ramo composto por rosas vermelhas frescas.',
    })
    description?: string;

    @ApiProperty({
        example: 29.90,
        description: 'Base price before VAT.',
    })
    basePrice: number;

    @ApiProperty({
        example: 25.00,
        description:
            'Base compensation paid to the florist.',
    })
    baseFloristCompensation: number;

    @ApiProperty({
        example: 1,
    })
    categoryId: number;

    @ApiProperty({
        example: 1,
        description:
            'Tax code applied to the product.',
    })
    taxCodeId: number;

    @ApiPropertyOptional({
        example: true,
    })
    active?: boolean;

    @ApiPropertyOptional({
        type: [CreateProductComponentDto],
        description:
            'Configurable components of the product. ' +
            'Products with variants should not define components.',
    })
    components?: CreateProductComponentDto[];

    @ApiPropertyOptional({
        type: [CreateProductVariantDto],
        description:
            'Variants of the product. ' +
            'Products with components should not define variants.',
    })
    variants?: CreateProductVariantDto[];

    @ApiPropertyOptional({
        type: [CreateProductImageDto],
        description:
            'Images associated with the product.',
    })
    images?: CreateProductImageDto[];
}
