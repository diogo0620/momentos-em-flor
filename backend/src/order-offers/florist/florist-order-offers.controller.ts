import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { Roles } from '@/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import type { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';
import { FloristDeclineOrderOfferDto } from './dtos/florist-decline-order-offer.dto';
import { FloristOrderOfferQueryDto } from './dtos/florist-order-offer-query.dto';
import { FloristOrderOffersService } from './florist-order-offers.service';

@ApiTags('Order Offers (Florist)')
@ApiBearerAuth('JWT')
@Controller('florist/order-offers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.FLORIST)
export class FloristOrderOffersController {
    constructor(private readonly service: FloristOrderOffersService) {}
    @Get() async findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: FloristOrderOfferQueryDto) { return this.service.findAll(user, query); }
    @Get(':id') async findOne(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseIntPipe) id: number) { return this.service.findOne(user, id); }
    @Post(':id/accept') @HttpCode(HttpStatus.NO_CONTENT) async accept(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseIntPipe) id: number): Promise<void> { await this.service.accept(user, id); }
    @Post(':id/decline') @HttpCode(HttpStatus.NO_CONTENT) async decline(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseIntPipe) id: number, @Body() dto: FloristDeclineOrderOfferDto): Promise<void> { await this.service.decline(user, id, dto); }
}
