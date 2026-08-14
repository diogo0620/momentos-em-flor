import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';

import {
    ApiBearerAuth,
    ApiTags,
} from '@nestjs/swagger';

import {
    OrderStatus,
} from '@prisma/client';

import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

import { CurrentUser } from '@/auth/decorators/current-user.decorator';

import type { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';

import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';

import { OrderQueryDto } from './query/order-query.dto';

import { OrdersService } from './orders.service';
import { OrderStatusService } from './services/order-status.service';

@ApiTags('Orders')
@ApiBearerAuth('JWT')
@Controller('orders')
export class OrdersController {
    constructor(
        private readonly ordersService:
            OrdersService,

        private readonly orderStatusService:
            OrderStatusService,
    ) {}

    /**
     * Create order.
     *
     * Authentication is optional.
     *
     * Authenticated customer:
     *   customerId = authenticated user id
     *
     * Guest:
     *   customerId = null
     */
    @Post()
    create(
        @CurrentUser()
        user: AuthenticatedUser | null,

        @Body()
        dto: CreateOrderDto,
    ) {
        return this.ordersService.create(
            user,
            dto,
        );
    }

    /**
     * Update order.
     *
     * Admin only.
     */
    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    update(
        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        dto: UpdateOrderDto,
    ) {
        return this.ordersService.update(
            id,
            dto,
        );
    }

    /**
     * List orders.
     *
     * Authentication required.
     */
    @Get()
    @UseGuards(JwtAuthGuard)
    findAll(
        @CurrentUser()
        user: AuthenticatedUser,

        @Query()
        query: OrderQueryDto,
    ) {
        return this.ordersService.findAll(
            user,
            query,
        );
    }

    /**
     * Get one order.
     *
     * Authentication required.
     */
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    findOne(
        @CurrentUser()
        user: AuthenticatedUser,

        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.ordersService.findOne(
            user,
            id,
        );
    }

    /**
     * Delete order.
     *
     * Admin only.
     */
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.ordersService.remove(
            id,
        );
    }



    /**
     * Start production.
     *
     * ASSIGNED → IN_PRODUCTION
     *
     * Florist:
     *   Only if the order is assigned
     *   to their florist.
     *
     * Admin:
     *   Can perform the transition.
     */
    @Post(':id/start-production')
    @UseGuards(JwtAuthGuard)
    startProduction(
        @CurrentUser()
        user: AuthenticatedUser,

        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.orderStatusService.changeStatus(
            id,
            OrderStatus.IN_PRODUCTION,
            user,
        );
    }

    /**
     * Mark order as ready for delivery.
     *
     * IN_PRODUCTION → READY_FOR_DELIVERY
     *
     * Admin can also perform:
     * ASSIGNED → READY_FOR_DELIVERY
     */
    @Post(':id/ready-for-delivery')
    @UseGuards(JwtAuthGuard)
    readyForDelivery(
        @CurrentUser()
        user: AuthenticatedUser,

        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.orderStatusService.changeStatus(
            id,
            OrderStatus.READY_FOR_DELIVERY,
            user,
        );
    }

    /**
     * Mark order as delivered.
     *
     * READY_FOR_DELIVERY → DELIVERED
     *
     * Admin can also perform:
     * ASSIGNED → DELIVERED
     * IN_PRODUCTION → DELIVERED
     */
    @Post(':id/deliver')
    @UseGuards(JwtAuthGuard)
    deliver(
        @CurrentUser()
        user: AuthenticatedUser,

        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.orderStatusService.changeStatus(
            id,
            OrderStatus.DELIVERED,
            user,
        );
    }

    /**
     * Cancel order.
     *
     * Admin only.
     */
    @Post(':id/cancel')
    @UseGuards(JwtAuthGuard)
    cancel(
        @CurrentUser()
        user: AuthenticatedUser,

        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        dto: CancelOrderDto,
    ) {
        return this.orderStatusService.cancel(
            id,
            user,
            dto.reason,
        );
    }
}