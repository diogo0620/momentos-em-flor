import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreateProductImageDto {
    @ApiProperty({
        example: 123,
        description:
            'ID of the uploaded file.',
    })
    fileId: number;

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
        description:
            'Whether this is the primary product image.',
    })
    isPrimary?: boolean;

    @ApiPropertyOptional({
        example: 456,
        nullable: true,
        description:
            'Variant ID when the image belongs to a specific variant.',
    })
    variantId?: number | null;

    @ApiPropertyOptional({
        example: true,
    })
    active?: boolean;
}