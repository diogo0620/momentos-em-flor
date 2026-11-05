import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { Roles } from '@/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import type { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';
import { FloristCompensationQueryDto } from '../dtos/florist-compensation-query.dto';
import { FloristCompensationsService } from './florist-compensations.service';

@ApiTags('Florist Compensations')
@ApiBearerAuth('JWT')
@Controller('florist/compensations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.FLORIST)
export class FloristCompensationsController {
  constructor(private readonly service: FloristCompensationsService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: FloristCompensationQueryDto,
  ) {
    return this.service.findAll(user, query);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.findOne(user, id);
  }
}
