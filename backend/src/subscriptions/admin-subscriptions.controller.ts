import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '@/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { SubscriptionsService } from './subscriptions.service';
import { UpsertSubscriptionPlanDto } from './dtos/upsert-subscription-plan.dto';

@Controller('admin/subscription-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSTEM_ADMIN)
export class AdminSubscriptionsController {
  constructor(private readonly subscriptions: SubscriptionsService) {}
  @Get() plans() { return this.subscriptions.adminPlans(); }
  @Post() create(@Body() dto: UpsertSubscriptionPlanDto) { return this.subscriptions.createPlan(dto); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpsertSubscriptionPlanDto) { return this.subscriptions.updatePlan(id, dto); }
}
