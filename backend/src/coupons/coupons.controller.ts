import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFloatPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { Roles } from '@/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import type { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';
import { CouponsService } from './coupons.service';
import { UpsertCouponDto } from './dtos/upsert-coupon.dto';

@Controller()
export class CouponsController {
  constructor(private readonly coupons: CouponsService) {}

  @Get('customer/coupons/:code/validate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  async validate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('code') code: string,
    @Query('subtotal', ParseFloatPipe) subtotal: number,
    @Query('deliveryFee', ParseFloatPipe) deliveryFee: number,
  ) {
    const result = await this.coupons.validate(
      code,
      user.id,
      subtotal,
      deliveryFee,
    );
    return {
      code: result.code,
      discount: result.discount,
      total: result.total,
      discountApplication: result.coupon.discountApplication,
    };
  }

  @Get('admin/coupons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SYSTEM_ADMIN)
  findAll() {
    return this.coupons.findAll();
  }

  @Get('admin/coupons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SYSTEM_ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coupons.findOne(id);
  }

  @Post('admin/coupons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SYSTEM_ADMIN)
  create(@Body() dto: UpsertCouponDto) {
    return this.coupons.create(dto);
  }

  @Patch('admin/coupons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SYSTEM_ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpsertCouponDto) {
    return this.coupons.update(id, dto);
  }

  @Delete('admin/coupons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SYSTEM_ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coupons.remove(id);
  }
}
