import { ApiProperty } from '@nestjs/swagger';
import { ProductType } from '@prisma/client';

export class PublicProductListResponseDto {
    @ApiProperty({
        example: 1,
    })
    id!: number;

    @ApiProperty({
        example: 'Ramo Primavera',
    })
    name!: string;

    @ApiProperty({
        example: 'ramo-primavera',
    })
    slug!: string;

    @ApiProperty({
        enum: ProductType,
    })
    type!: ProductType;

    @ApiProperty({
        example: 49.08,
        description: 'Final price including VAT.',
    })
    price!: number;

    @ApiProperty({
    })
    image!: string;
}