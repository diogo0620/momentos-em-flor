
import {
    Controller,
    Get,
    Param,
    Query,
    HttpCode,
    HttpStatus,
    UseGuards,
    ParseIntPipe,
    Body,
    Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


import { AdminOrdersService } from './admin-orders.service';
import { AdminOrderQueryDto } from './dtos/admin-order-query.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { AdminCancelOrderDto } from './dtos/admin-cancel-order.dto';


@ApiTags('Orders (Admin)')
@ApiBearerAuth('JWT')
@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSTEM_ADMIN)
export class AdminOrdersController {
    constructor(
        private readonly service: AdminOrdersService,
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() query: AdminOrderQueryDto) {
        return await this.service.findAll(query);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(
        @Param('id') id: number,
    ) {
        return await this.service.findOne(id);
    }

    @Post(':id/start-production')
    @HttpCode(HttpStatus.NO_CONTENT)
    async startProduction(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        await this.service.startProduction(id);
    }

    @Post(':id/ready-for-delivery')
    @HttpCode(HttpStatus.NO_CONTENT)
    async setReadyForDelivery(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        await this.service.setReadyForDelivery(id);
    }

    @Post(':id/deliver')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deliver(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        await this.service.deliver(id);
    }

    @Post(':id/cancel')
    @HttpCode(HttpStatus.NO_CONTENT)
    async cancel(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AdminCancelOrderDto,
    ): Promise<void> {
        await this.service.cancel(id, dto);
    }


}
