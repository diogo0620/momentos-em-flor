
import {
    Controller,
    Get,
    Patch,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { FloristUsersService } from './florist-users.service';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';
import { FloristUpdateUserDto } from './dtos/florist-update-user.dto';
import { FloristUserChangePasswordDto } from './dtos/florist-user-change-password.dto';

@ApiTags('Users (Florist)')
@ApiBearerAuth('JWT')
@Controller('florist/me')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.FLORIST)
export class FloristUsersController {
    constructor(
        private readonly service: FloristUsersService,
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findOne(
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return await this.service.findOne(user.id);
    }

    

    @Patch()
    @HttpCode(HttpStatus.NO_CONTENT)
    async update(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: FloristUpdateUserDto,
    ) {
        return await this.service.update(user.id, dto);
    }

    @Patch('password')
    @HttpCode(HttpStatus.NO_CONTENT)
    async changePassword(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: FloristUserChangePasswordDto,
    ) {
        return await this.service.changePassword(user.id, dto);
    }
}
