import { ApiProperty } from '@nestjs/swagger';

export class ProductListImageDto {

    @ApiProperty({
        example: '/uploads/products/ramo-primavera.jpg',
    })
    url: string;
}

export class ProductListCategoryDto {

    @ApiProperty({
        example: 1,
    })
    id: number;

    @ApiProperty({
        example: 'Bouquets',
    })
    name: string;
}

export class ProductListResponseDto {

    @ApiProperty({
        example: 1,
    })
    id: number;

    @ApiProperty({
        example: 'Ramo Primavera',
    })
    name: string;

    @ApiProperty({
        example: 49.08,
        description: 'Final price including VAT.',
    })
    price: number;

    @ApiProperty({
        type: ProductListImageDto,
        nullable: true,
    })
    image: ProductListImageDto | null;

    @ApiProperty({
        type: ProductListCategoryDto,
    })
    category: ProductListCategoryDto;
}