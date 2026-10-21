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


import { AdminTaxCodesService } from './admin-tax-codes.service';
import { AdminCreateTaxCodeDto } from './dtos/admin-create-tax-code.dto';
import { AdminUpdateTaxCodeDto } from './dtos/admin-update-tax-code.dto';
import { AdminTaxCodeQueryDto } from './dtos/admin-tax-code-query.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Tax Codes (Admin)')
@ApiBearerAuth('JWT')
@Controller('admin/tax-codes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSTEM_ADMIN)
export class AdminTaxCodesController {
    constructor(
        private readonly service: AdminTaxCodesService,
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() query: AdminTaxCodeQueryDto) { 
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
    async create(@Body() dto: AdminCreateTaxCodeDto) {
        return await this.service.create(dto);
     }

    @Patch(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AdminUpdateTaxCodeDto,
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
