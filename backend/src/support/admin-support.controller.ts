import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { SupportTicketStatus, UserRole } from '@prisma/client';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { Roles } from '@/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import type { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';
import { CreateSupportMessageDto } from './dtos/create-support-message.dto';
import { UpdateSupportTicketStatusDto } from './dtos/update-support-ticket-status.dto';
import { SupportService } from './support.service';

@Controller('admin/support-tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSTEM_ADMIN)
export class AdminSupportController {
  constructor(private readonly support: SupportService) {}
  @Get() list(@Query('status') status?: SupportTicketStatus, @Query('search') search?: string) { return this.support.listAdmin(status, search); }
  @Get(':id') get(@Param('id', ParseIntPipe) id: number) { return this.support.getAdmin(id); }
  @Post(':id/messages') reply(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseIntPipe) id: number, @Body() dto: CreateSupportMessageDto) { return this.support.replyAdmin(user.id, id, dto); }
  @Patch(':id/status') updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSupportTicketStatusDto) { return this.support.updateStatus(id, dto.status); }
}
