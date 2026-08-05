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

import { UsersService } from './users.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { UserQueryDto } from './query/user-query.dto';

import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';

import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';


@ApiTags('Users')
@ApiBearerAuth('JWT')
@UseGuards(
    JwtAuthGuard,
    RolesGuard,
)
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    @Get()
    @Roles(UserRole.SYSTEM_ADMIN)
    findAll(
        @Query() query: UserQueryDto,
    ) {
        return this.usersService.findAll(query);
    }

    @Get(':id')
    @Roles(UserRole.SYSTEM_ADMIN)
    findOne(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.usersService.findOne(id);
    }

    @Post()
    @Roles(UserRole.SYSTEM_ADMIN)
    create(
        @Body()
        dto: CreateUserDto,
    ) {
        return this.usersService.create(dto);
    }

    @Patch(':id')
    @Roles(UserRole.SYSTEM_ADMIN)
    update(
        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        dto: UpdateUserDto,
    ) {
        return this.usersService.update(
            id,
            dto,
        );
    }

    @Patch('me/password')
    changePassword(
        @CurrentUser()
        user: AuthenticatedUser,

        @Body()
        dto: ChangePasswordDto,
    ) {
        return this.usersService.changePassword(
            user.id,
            dto,
        );
    }

    @Patch(':id/reset-password')
    @Roles(UserRole.SYSTEM_ADMIN)
    resetPassword(
        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        dto: ResetPasswordDto,
    ) {
        return this.usersService.resetPassword(
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
        return this.usersService.remove(id);
    }


}