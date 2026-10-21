import { ApiProperty } from '@nestjs/swagger';
import { ProductType } from '@prisma/client';

export class AdminProductListResponseDto {
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
        example: false,
    })
    featured!: boolean;

    @ApiProperty({
        example: 49.08,
        description: 'Final price including VAT.',
    })
    customerPrice!: number;

    @ApiProperty({
        example: 49.08,
        description: 'Final price including VAT.',
    })
    floristPrice!: number;

    @ApiProperty({
    })
    image!: string;

    @ApiProperty({ example: true })
    active!: boolean;
}