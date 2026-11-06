import {
    Controller,
    Get,
    Delete,
    Query,
    Param,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
    Body,
    Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AdminUsersService } from './admin-users.service';
import { AdminUserQueryDto } from './dtos/admin-user-query.dto';
import { Roles } from '@/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { AdminCreateUserDto } from './dtos/admin-create-user.dto';

@ApiTags('Users (Admin)')
@ApiBearerAuth('JWT')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSTEM_ADMIN)
export class AdminUsersController {
    constructor(
        private readonly service: AdminUsersService,
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() query: AdminUserQueryDto) {
        return await this.service.findAll(query);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return await this.service.findOne(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: AdminCreateUserDto) {
        return await this.service.create(dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        await this.service.delete(id);
    }
}
