import {
    Module,
} from '@nestjs/common';

import {
    ReviewsController,
} from './reviews.controller';

import {
    ReviewsService,
} from './reviews.service';

import {
    OrderReviewMapper,
} from './mappers/order-review.mapper';

@Module({
    controllers: [
        ReviewsController,
    ],

    providers: [
        ReviewsService,
        OrderReviewMapper,
    ],
})
export class ReviewsModule {}