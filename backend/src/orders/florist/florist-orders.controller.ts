import { Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { Roles } from '@/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import type { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';
import { FloristOrderQueryDto } from './dtos/florist-order-query.dto';
import { FloristOrdersService } from './florist-orders.service';

@ApiTags('Orders (Florist)')
@ApiBearerAuth('JWT')
@Controller('florist/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.FLORIST)
export class FloristOrdersController {
    constructor(private readonly service: FloristOrdersService) { }
    @Get() @HttpCode(HttpStatus.OK) async findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: FloristOrderQueryDto) { return this.service.findAll(user, query); }
    @Get(':id') @HttpCode(HttpStatus.OK) async findOne(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseIntPipe) id: number) { return this.service.findOne(user, id); }
}
