
import {
    Controller,
    Get,
    Patch,
    Body,
    Param,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


import { AdminStoreSettingsService } from './admin-store-settings.service';
import { AdminUpdateStoreSettingsDto } from './dtos/admin-update-store-settings.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Store Settings (Admin)')
@ApiBearerAuth('JWT')
@Controller('admin/store-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSTEM_ADMIN)
export class AdminStoreSettingsController {
    constructor(
        private readonly service: AdminStoreSettingsService,
    ) { }


    @Get()
    @HttpCode(HttpStatus.OK)
    async findOne(
    ) {
        return await this.service.get();
    }


    @Patch()
    @HttpCode(HttpStatus.NO_CONTENT)
    async update(
        @Body() dto: AdminUpdateStoreSettingsDto,
    ) {
        return await this.service.update(dto);
     }

}
