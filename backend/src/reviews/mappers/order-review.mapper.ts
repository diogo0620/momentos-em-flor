import {
    OrderReviewResponseDto,
} from '../dto/order-review-response.dto';

export class OrderReviewMapper {
    toResponse(
        review: any,
    ): OrderReviewResponseDto {
        return {
            id:
                review.id,

            orderId:
                review.orderId,

            customerId:
                review.customerId,

            floristId:
                review.floristId,

            comment:
                review.comment,

            ratings:
                (
                    review.ratings ??
                    []
                ).map(
                    (rating: any) => ({
                        id:
                            rating.id,

                        category:
                            rating.category,

                        rating:
                            rating.rating,

                        createdAt:
                            rating.createdAt,
                    }),
                ),

            createdAt:
                review.createdAt,

            updatedAt:
                review.updatedAt,
        };
    }

    toResponses(
        reviews: any[],
    ): OrderReviewResponseDto[] {
        return reviews.map(
            (review) =>
                this.toResponse(
                    review,
                ),
        );
    }
}