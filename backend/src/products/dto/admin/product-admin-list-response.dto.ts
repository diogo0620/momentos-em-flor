import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';


export class ProductAdminListImageDto {

    @ApiProperty({
        example: '/uploads/products/ramo-primavera.jpg',
    })
    url: string;
}


export class ProductAdminListCategoryDto {

    @ApiProperty({
        example: 1,
    })
    id: number;

    @ApiProperty({
        example: 'Bouquets',
    })
    name: string;
}


export class ProductAdminListResponseDto {

    @ApiProperty({
        example: 1,
    })
    id: number;

    @ApiProperty({
        example: 'Ramo Primavera',
    })
    name: string;

    @ApiProperty({
        example: 'ramo-primavera',
    })
    slug: string;

    @ApiProperty({
        example: 49.08,
        description: 'Final customer price including VAT.',
    })
    price: number;

    @ApiProperty({
        example: true,
    })
    active: boolean;

    @ApiProperty({
        type: ProductAdminListImageDto,
        nullable: true,
    })
    image: ProductAdminListImageDto | null;

    @ApiProperty({
        type: ProductAdminListCategoryDto,
    })
    category: ProductAdminListCategoryDto;
}
