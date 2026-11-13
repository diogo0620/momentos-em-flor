import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { Roles } from '@/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import type { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';
import { CreateSupportTicketDto } from './dtos/create-support-ticket.dto';
import { CreateSupportMessageDto } from './dtos/create-support-message.dto';
import { SupportService } from './support.service';

@Controller('customer/support-tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
export class CustomerSupportController {
  constructor(private readonly support: SupportService) {}
  @Get() list(@CurrentUser() user: AuthenticatedUser) { return this.support.listCustomer(user.id); }
  @Post() create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateSupportTicketDto) { return this.support.createCustomer(user.id, dto); }
  @Get(':id') get(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseIntPipe) id: number) { return this.support.getCustomer(user.id, id); }
  @Post(':id/messages') reply(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseIntPipe) id: number, @Body() dto: CreateSupportMessageDto) { return this.support.replyCustomer(user.id, id, dto); }
}
