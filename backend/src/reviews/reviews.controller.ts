import {
    Body,
    Controller,
    Param,
    ParseIntPipe,
    Post,
    UseGuards,
} from '@nestjs/common';

import {
    ApiBearerAuth,
    ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

import { CurrentUser } from '@/auth/decorators/current-user.decorator';

import type {
    AuthenticatedUser,
} from '@/auth/interfaces/authenticated-user.interface';

import {
    CreateOrderReviewDto,
} from './dto/create-order-review.dto';

import {
    ReviewsService,
} from './reviews.service';

@ApiTags('Reviews')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class ReviewsController {
    constructor(
        private readonly reviewsService:
            ReviewsService,
    ) {}

    @Post(':orderId/review')
    create(
        @CurrentUser()
        user: AuthenticatedUser,

        @Param(
            'orderId',
            ParseIntPipe,
        )
        orderId: number,

        @Body()
        dto: CreateOrderReviewDto,
    ) {
        return this.reviewsService.create(
            user,
            orderId,
            dto,
        );
    }
}