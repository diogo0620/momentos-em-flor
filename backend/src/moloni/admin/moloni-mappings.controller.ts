import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { IsIn, IsInt, Min } from 'class-validator';
import { UserRole } from '@prisma/client';

import { Roles } from '@/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import {
  MoloniMappingsService,
  type MoloniMappingType,
} from './moloni-mappings.service';

class MappingDto {
  @IsIn(['customer', 'product', 'tax'])
  type!: MoloniMappingType;

  @IsInt()
  @Min(1)
  localId!: number;

  @IsInt()
  @Min(1)
  moloniId!: number;
}

class SyncMappingDto {
  @IsIn(['customer', 'product', 'tax'])
  type!: MoloniMappingType;

  @IsInt()
  @Min(1)
  localId!: number;
}

@Controller('admin/moloni/mappings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSTEM_ADMIN)
export class MoloniMappingsController {
  constructor(private readonly mappings: MoloniMappingsService) {}

  @Put()
  update(@Body() dto: MappingDto) {
    return this.mappings.save(dto.type, dto.localId, dto.moloniId);
  }

  @Post('sync')
  sync(@Body() dto: SyncMappingDto) {
    return this.mappings.integrate(dto.type, dto.localId);
  }
}
