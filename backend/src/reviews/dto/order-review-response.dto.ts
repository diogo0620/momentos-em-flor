import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

import {
    ReviewCategory,
} from '@prisma/client';

class OrderReviewRatingResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty({
        enum: ReviewCategory,
    })
    category: ReviewCategory;

    @ApiProperty({
        example: 5,
        minimum: 1,
        maximum: 5,
    })
    rating: number;

    @ApiProperty()
    createdAt: Date;
}

export class OrderReviewResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    orderId: number;

    @ApiProperty()
    customerId: number;

    @ApiProperty()
    floristId: number;

    @ApiPropertyOptional()
    comment: string | null;

    @ApiProperty({
        type: [OrderReviewRatingResponseDto],
    })
    ratings: OrderReviewRatingResponseDto[];

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}