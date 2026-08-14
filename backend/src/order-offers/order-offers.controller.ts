import {
    Body,
    Controller,
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

import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';

import type { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';

import { OrderOffersService } from './order-offers.service';
import { OrderOfferQueryDto } from './query/order-offer-query.dto';
import { DeclineOrderOfferDto } from './dto/decline-order-offer.dto';
import { CreateOrderOfferDto } from './dto/create-order-offer.dto';
import { UpdateOrderOfferDto } from './dto/update-order-offer.dto';

@ApiTags('Order Offers')
@ApiBearerAuth('JWT')
@UseGuards(
    JwtAuthGuard,
    RolesGuard,
)
@Controller('order-offers')
export class OrderOffersController {
    constructor(
        private readonly orderOffersService:
            OrderOffersService,
    ) { }

    @Post()
    @Roles(UserRole.SYSTEM_ADMIN)
    create(
        @Body()
        dto: CreateOrderOfferDto,
    ) {
        return this.orderOffersService.create(
            dto,
        );
    }

    @Patch(':id')
    @Roles(UserRole.SYSTEM_ADMIN)
    update(
        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        dto: UpdateOrderOfferDto,
    ) {
        return this.orderOffersService.update(
            id,
            dto,
        );
    }

    @Get()
    @Roles(
        UserRole.FLORIST,
        UserRole.SYSTEM_ADMIN,
    )
    findAll(
        @CurrentUser()
        user: AuthenticatedUser,

        @Query()
        query: OrderOfferQueryDto,
    ) {
        return this.orderOffersService.findAll(
            user,
            query,
        );
    }

    @Get(':id')
    @Roles(
        UserRole.FLORIST,
        UserRole.SYSTEM_ADMIN,
    )
    findOne(
        @CurrentUser()
        user: AuthenticatedUser,

        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.orderOffersService.findOne(
            user,
            id,
        );
    }

    @Post(':id/accept')
    @Roles(
        UserRole.FLORIST,
        UserRole.SYSTEM_ADMIN,
    )
    accept(
        @CurrentUser()
        user: AuthenticatedUser,

        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.orderOffersService.accept(
            user,
            id,
        );
    }

    @Post(':id/decline')
    @Roles(
        UserRole.FLORIST,
        UserRole.SYSTEM_ADMIN,
    )
    decline(
        @CurrentUser()
        user: AuthenticatedUser,

        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        dto: DeclineOrderOfferDto,
    ) {
        return this.orderOffersService.decline(
            user,
            id,
            dto,
        );
    }
}