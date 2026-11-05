import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { DistanceBetweenAddressesDto } from './dtos/distance-between-addresses.dto';
import { GeocodingService } from './geocoding.service';

@ApiTags('Geocoding (Admin)')
@ApiBearerAuth('JWT')
@Controller('admin/geocoding')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSTEM_ADMIN)
export class AdminGeocodingController {
  constructor(private readonly geocoding: GeocodingService) {}

  @Post('distance')
  distance(@Body() dto: DistanceBetweenAddressesDto) {
    return this.geocoding.distanceBetweenAddresses(dto.from, dto.to);
  }
}
