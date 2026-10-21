
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


import { AdminCategoriesService } from './admin-categories.service';
import { AdminCreateCategoryDto } from './dtos/admin-create-category.dto';
import { AdminUpdateCategoryDto } from './dtos/admin-update-category.dto';
import { AdminCategoryQueryDto } from './dtos/admin-category-query.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Categories (Admin)')
@ApiBearerAuth('JWT')
@Controller('admin/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSTEM_ADMIN)
export class AdminCategoriesController {
    constructor(
        private readonly service: AdminCategoriesService,
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() query: AdminCategoryQueryDto) { 
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
    async create(@Body() dto: AdminCreateCategoryDto) {
        return await this.service.create(dto);
     }

    @Patch(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AdminUpdateCategoryDto,
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
