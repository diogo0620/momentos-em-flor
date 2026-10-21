
import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


import { CustomerOrdersService } from './customer-orders.service';
import { CustomerCreateOrderDto } from './dtos/customer-create-order.dto';
import { CustomerOrderQueryDto } from './dtos/customer-order-query.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CustomerUpdateOrderDto } from './dtos/customer-update-order.dto';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';


@ApiTags('Orders (Customer)')
@ApiBearerAuth('JWT')
@Controller('customer/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
export class CustomerOrdersController {
    constructor(
        private readonly service: CustomerOrdersService,
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: CustomerOrderQueryDto) {
        return await this.service.findAll(user, query);
    }

    @Get(':orderNumber')
    @HttpCode(HttpStatus.OK)
    async findOne(
        @CurrentUser() user: AuthenticatedUser,
        @Param('orderNumber') orderNumber: string,
    ) {
        return await this.service.findOne(user, orderNumber);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CustomerCreateOrderDto) {
        return await this.service.create(user, dto);
    }

    @Patch(':orderNumber')
    @HttpCode(HttpStatus.NO_CONTENT)
    async update(
        @CurrentUser() user: AuthenticatedUser,
        @Param('orderNumber') orderNumber: string,
        @Body() dto: CustomerUpdateOrderDto,
    ) {
        return await this.service.update(user, orderNumber, dto);
    }

}
