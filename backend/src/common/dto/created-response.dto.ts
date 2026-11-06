import { ApiProperty } from '@nestjs/swagger';

export class CreatedResponseDto {
    @ApiProperty({
        example: 1,
        description: 'ID of the created resource',
    })
    id!: number;

    @ApiProperty({
        example: 'bouquet',
        description: 'Slug of the created resource',
    })
    slug?: string | null;

    @ApiProperty({
        example: 'MF-2026434',
        description: 'Order Number of the created order',
    })
    orderNumber?: string | null;
}