
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


import { AdminCreateOrderOfferDto } from './dtos/admin-create-order-offer.dto';
import { AdminUpdateOrderOfferDto } from './dtos/admin-update-order-offer.dto';
import { AdminOrderOfferQueryDto } from './dtos/admin-order-offer-query.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { AdminOrderOffersService } from './admin-order-offers.service';

@ApiTags('Order Offers (Admin)')
@ApiBearerAuth('JWT')
@Controller('admin/order-offers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSTEM_ADMIN)
export class AdminOrderOffersController {
    constructor(
        private readonly service: AdminOrderOffersService,
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() query: AdminOrderOfferQueryDto) { 
        return await this.service.findAll(query);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return await this.service.findOne(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: AdminCreateOrderOfferDto) {
        return await this.service.create(dto);
     }

    @Patch(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AdminUpdateOrderOfferDto,
    ) {
        return await this.service.update(id, dto);
     }
}
