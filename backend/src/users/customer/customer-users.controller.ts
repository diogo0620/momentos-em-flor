
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
import { CustomerUsersService } from './customer-users.service';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';
import { CustomerUpdateUserDto } from './dtos/customer-update-user.dto';
import { CustomerUserChangePasswordDto } from './dtos/customer-user-change-password.dto';

@ApiTags('Users (Customer)')
@ApiBearerAuth('JWT')
@Controller('customer/me')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
export class CustomerUsersController {
    constructor(
        private readonly service: CustomerUsersService,
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
        @Body() dto: CustomerUpdateUserDto,
    ) {
        return await this.service.update(user.id, dto);
    }

    @Patch('password')
    @HttpCode(HttpStatus.NO_CONTENT)
    async changePassword(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: CustomerUserChangePasswordDto,
    ) {
        return await this.service.changePassword(user.id, dto);
    }
}
