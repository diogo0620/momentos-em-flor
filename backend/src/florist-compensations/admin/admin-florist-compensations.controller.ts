import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { FloristCompensationQueryDto } from '../dtos/florist-compensation-query.dto';
import { MarkFloristCompensationPaidDto } from '../dtos/mark-florist-compensation-paid.dto';
import { AdminFloristCompensationsService } from './admin-florist-compensations.service';

@ApiTags('Florist Compensations (Admin)')
@ApiBearerAuth('JWT')
@Controller('admin/florist-compensations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSTEM_ADMIN)
export class AdminFloristCompensationsController {
  constructor(
    private readonly service: AdminFloristCompensationsService,
  ) {}

  @Get()
  findAll(@Query() query: FloristCompensationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post(':id/mark-paid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markPaid(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MarkFloristCompensationPaidDto,
  ): Promise<void> {
    await this.service.markPaid(id, dto);
  }
}
