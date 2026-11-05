import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';
import { PaymentsService } from './payments.service';
import { AdminCreateRefundDto } from './dtos/admin-create-refund.dto';

@ApiTags('Payments (Admin)')
@ApiBearerAuth('JWT')
@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSTEM_ADMIN)
export class AdminPaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('orders/:orderId/refund')
  @HttpCode(HttpStatus.OK)
  refundOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() dto: AdminCreateRefundDto,
  ) {
    return this.paymentsService.refundOrder(user, orderId, dto.reason);
  }
}
