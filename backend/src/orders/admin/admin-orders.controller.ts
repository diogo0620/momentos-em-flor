
import {
    Controller,
    Get,
    Param,
    Query,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


import { AdminOrdersService } from './admin-orders.service';
import { AdminOrderQueryDto } from './dtos/admin-order-query.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';


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


}
