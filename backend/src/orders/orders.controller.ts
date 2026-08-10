import {
    Body,
    Controller,
    Post,
    UseGuards,
    Get,
    Param,
    ParseIntPipe,
    Query,
    Patch,
    Delete,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';

import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import { OrderQueryDto } from './query/order-query.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';


@ApiTags('Orders')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
    constructor(
        private readonly ordersService: OrdersService,
    ) { }

    @Post()
    create(
        @CurrentUser()
        user: AuthenticatedUser,

        @Body()
        dto: CreateOrderDto,
    ) {
        return this.ordersService.create(
            user.id,
            dto,
        );
    }

    @Patch(':id')
    @Roles(UserRole.SYSTEM_ADMIN)
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

    @Get()
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

    @Get(':id')
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

    @Delete(':id')
    @Roles(UserRole.SYSTEM_ADMIN)
    remove(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.ordersService.remove(
            id,
        );
    }


    @Get(':id/eligible-florists')
    @Roles(UserRole.SYSTEM_ADMIN)
    findEligibleFlorists(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.ordersService
            .findEligibleFloristsForOrder(id);
    }

}