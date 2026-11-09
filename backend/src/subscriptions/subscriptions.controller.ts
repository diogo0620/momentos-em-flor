import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { Roles } from '@/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import type { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';
import { SubscriptionsService } from './subscriptions.service';

@Controller('florist/subscription')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.FLORIST)
export class SubscriptionsController {
  constructor(private readonly subscriptions: SubscriptionsService) {}
  @Get() async get(@CurrentUser() user: AuthenticatedUser) { return { current: await this.subscriptions.current(user.floristId!), plans: await this.subscriptions.plans() }; }
  @Post('select') select(@CurrentUser() user: AuthenticatedUser, @Body() body: { planId: number }) { return this.subscriptions.selectPlan(user.floristId!, user.email, Number(body.planId)); }
  @Post('portal') portal(@CurrentUser() user: AuthenticatedUser) { return this.subscriptions.billingPortal(user.floristId!); }
}
