import { ApiProperty } from '@nestjs/swagger';
import { ProductType } from '@prisma/client';

export class ProductListImageDto {
    @ApiProperty({
        example: '/uploads/products/ramo-primavera.jpg',
    })
    url: string;
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
        enum: ProductType,
    })
    type: ProductType;

    @ApiProperty({
        example: false,
    })
    featured: boolean;

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
}