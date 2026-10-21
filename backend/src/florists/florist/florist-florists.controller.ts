
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
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';
import { FloristFloristsService } from './florist-florists.service';
import { FloristUpdateFloristDto } from './dtos/florist-update-florist.dto';

@ApiTags('Florists (Floris)')
@ApiBearerAuth('JWT')
@Controller('florist/mine')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.FLORIST)
export class FloristFloristsController {
    constructor(
        private readonly service: FloristFloristsService,
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
        @Body() dto: FloristUpdateFloristDto,
    ) {
        return await this.service.update(user.id, dto);
    }

}
