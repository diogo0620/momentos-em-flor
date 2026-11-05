
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';

import { AdminConfigureMoloniDto } from './dtos/admin-configure-moloni.dto';
import { AdminMoloniResponseDto } from './dtos/admin-moloni-response.dto';
import { AdminMoloniService } from './admin-moloni.service';

@ApiTags('Admin - Moloni')
@ApiBearerAuth('JWT')
@Controller('admin/moloni')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSTEM_ADMIN)
export class AdminMoloniController {
  constructor(
    private readonly adminMoloniService: AdminMoloniService,
  ) {}

  @Get('settings')
  @ApiOperation({
    summary: 'Obter configurações da integração Moloni',
  })
  @ApiOkResponse({
    type: AdminMoloniResponseDto,
  })
  getSettings(): Promise<AdminMoloniResponseDto> {
    return this.adminMoloniService.getSettings();
  }

  @Put('settings')
  @ApiOperation({
    summary: 'Criar ou atualizar configurações da integração Moloni',
  })
  @ApiOkResponse({
    type: AdminMoloniResponseDto,
  })
  updateSettings(
    @Body() dto: AdminConfigureMoloniDto,
  ): Promise<AdminMoloniResponseDto> {
    return this.adminMoloniService.updateSettings(dto);
  }

  @Post('test-connection')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Testar ligação à Moloni',
  })
  @ApiOkResponse({
    type: AdminMoloniResponseDto,
  })
  testConnection(): Promise<AdminMoloniResponseDto> {
    return this.adminMoloniService.testConnection();
  }
}
