import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';

import { FloristCompensationRulesService } from './florist-compensation-rules.service';

import { CreateFloristCompensationRuleDto } from './dto/create-florist-compensation-rule.dto';
import { UpdateFloristCompensationRuleDto } from './dto/update-florist-compensation-rule.dto';

import { FloristCompensationRuleQueryDto } from './query/florist-compensation-rule-query.dto';

@ApiTags('Florist Compensation Rules')
@ApiBearerAuth('JWT')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Controller('florist-compensation-rules')
export class FloristCompensationRulesController {
  constructor(
    private readonly floristCompensationRulesService: FloristCompensationRulesService,
  ) {}

  @Get()
  @Roles(UserRole.SYSTEM_ADMIN)
  findAll(
    @Query()
    query: FloristCompensationRuleQueryDto,
  ) {
    return this.floristCompensationRulesService.findAll(
      query,
    );
  }

  @Get(':id')
  @Roles(UserRole.SYSTEM_ADMIN)
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.floristCompensationRulesService.findById(
      id,
    );
  }

  @Post()
  @Roles(UserRole.SYSTEM_ADMIN)
  create(
    @Body()
    dto: CreateFloristCompensationRuleDto,
  ) {
    return this.floristCompensationRulesService.create(
      dto,
    );
  }

  @Patch(':id')
  @Roles(UserRole.SYSTEM_ADMIN)
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdateFloristCompensationRuleDto,
  ) {
    return this.floristCompensationRulesService.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  @Roles(UserRole.SYSTEM_ADMIN)
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.floristCompensationRulesService.remove(
      id,
    );
  }
}