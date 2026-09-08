import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreateProductImageDto {

    @ApiProperty({
        example:
            'https://cdn.momentosemflor.pt/products/ramo-primavera.jpg',
        description:
            'URL of the product image.',
    })
    url: string;

    @ApiPropertyOptional({
        example: 'Ramo Primavera',
        description:
            'Alternative text for accessibility.',
    })
    altText?: string;

    @ApiPropertyOptional({
        example: 0,
        description:
            'Display order of the image.',
    })
    sortOrder?: number;

    @ApiPropertyOptional({
        example: true,
    })
    active?: boolean;
}
