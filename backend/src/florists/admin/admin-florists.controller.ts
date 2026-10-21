
import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


import { AdminFloristsService } from './admin-florists.service';
import { AdminCreateFloristDto } from './dtos/admin-create-florist.dto';
import { AdminUpdateFloristDto } from './dtos/admin-update-florist.dto';
import { AdminFloristQueryDto } from './dtos/admin-florist-query.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Florists (Admin)')
@ApiBearerAuth('JWT')
@Controller('admin/florists')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSTEM_ADMIN)
export class AdminFloristsController {
    constructor(
        private readonly service: AdminFloristsService,
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() query: AdminFloristQueryDto) {
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
    async create(@Body() dto: AdminCreateFloristDto) {
        return await this.service.create(dto);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AdminUpdateFloristDto,
    ) {
        return await this.service.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<void> {
        await this.service.delete(id);
    }
}
