import {
    Injectable,
} from '@nestjs/common';

import {
    OrderStatus,
    ReviewCategory,
    UserRole,
} from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

import { Exceptions } from '@/common/exceptions/exceptions';
import { ApiResponse } from '@/common/responses/api-response';

import {
    AuthenticatedUser,
} from '@/auth/interfaces/authenticated-user.interface';

import {
    CreateOrderReviewDto,
} from './dto/create-order-review.dto';

import {
    OrderReviewMapper,
} from './mappers/order-review.mapper';

import {
    REVIEW_MESSAGES,
} from './constants/review.messages';

@Injectable()
export class ReviewsService {
    constructor(
        private readonly prisma:
            PrismaService,

        private readonly mapper:
            OrderReviewMapper,
    ) {}

    async create(
        user: AuthenticatedUser,
        orderId: number,
        dto: CreateOrderReviewDto,
    ) {
        /*
         * Only customers can create reviews.
         */
        if (
            user.role !==
            UserRole.CUSTOMER
        ) {
            Exceptions.forbidden(
                REVIEW_MESSAGES.ONLY_CUSTOMER,
            );
        }

        /*
         * Validate categories.
         */
        const categories =
            Object.values(
                ReviewCategory,
            );

        if (
            dto.ratings.length !==
            categories.length
        ) {
            Exceptions.badRequest(
                REVIEW_MESSAGES
                    .ALL_CATEGORIES_REQUIRED,
            );
        }

        const ratingCategories =
            dto.ratings.map(
                (rating) =>
                    rating.category,
            );

        if (
            new Set(
                ratingCategories,
            ).size !==
            ratingCategories.length
        ) {
            Exceptions.badRequest(
                REVIEW_MESSAGES
                    .DUPLICATE_CATEGORIES,
            );
        }

        const missingCategories =
            categories.filter(
                (category) =>
                    !ratingCategories.includes(
                        category,
                    ),
            );

        if (
            missingCategories.length > 0
        ) {
            Exceptions.badRequest(
                REVIEW_MESSAGES
                    .ALL_CATEGORIES_REQUIRED,
            );
        }

        /*
         * Get order.
         */
        const order =
            await this.prisma.order.findFirst({
                where: {
                    id: orderId,

                    deletedAt: null,
                },

                select: {
                    id: true,

                    customerId: true,

                    assignedFloristId:
                        true,

                    status: true,

                    review: {
                        select: {
                            id: true,
                        },
                    },
                },
            });

        if (!order) {
            Exceptions.notFound(
                REVIEW_MESSAGES
                    .ORDER_NOT_FOUND,
            );
        }

        /*
         * Order must belong to
         * authenticated customer.
         */
        if (
            order.customerId !==
            user.id
        ) {
            Exceptions.forbidden(
                REVIEW_MESSAGES.NOT_ALLOWED,
            );
        }

        /*
         * Order must have a florist.
         */
        if (
            !order.assignedFloristId
        ) {
            Exceptions.badRequest(
                REVIEW_MESSAGES
                    .FLORIST_NOT_ASSIGNED,
            );
        }

        /*
         * Order must be delivered
         * or completed.
         */
        if (
            order.status !==
                OrderStatus.DELIVERED
        ) {
            Exceptions.badRequest(
                REVIEW_MESSAGES
                    .ORDER_NOT_REVIEWABLE,
            );
        }

        /*
         * Prevent duplicate review.
         */
        if (order.review) {
            Exceptions.conflict(
                REVIEW_MESSAGES.ALREADY_EXISTS,
            );
        }

        /*
         * Create review and ratings
         * atomically.
         */
        const review =
            await this.prisma.$transaction(
                async (tx) => {
                    const createdReview =
                        await tx.orderReview.create({
                            data: {
                                orderId:
                                    order.id,

                                customerId:
                                    order.customerId!,

                                floristId:
                                    order.assignedFloristId!,

                                comment:
                                    dto.comment ??
                                    null,

                                ratings: {
                                    create:
                                        dto.ratings.map(
                                            (
                                                rating,
                                            ) => ({
                                                category:
                                                    rating.category,

                                                rating:
                                                    rating.rating,
                                            }),
                                        ),
                                },
                            },

                            include: {
                                ratings: true,
                            },
                        });

                    return createdReview;
                },
            );

        return ApiResponse.success(
            this.mapper.toResponse(
                review,
            ),
            REVIEW_MESSAGES.CREATED,
        );
    }
}