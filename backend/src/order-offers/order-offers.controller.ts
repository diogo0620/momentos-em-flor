import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
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

    @Get()
    @Roles(UserRole.FLORIST)
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
    @Roles(UserRole.FLORIST)
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
    @Roles(UserRole.FLORIST)
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
    @Roles(UserRole.FLORIST)
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