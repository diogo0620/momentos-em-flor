import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Query,
} from '@nestjs/common';

import { ProductsService } from './products.service';

import { UpdateProductConfigurationDto } from './dto/update-product-configuration.dto';
import { ProductAdminDetailResponseDto } from './dto/admin/product-admin-detail-response.dto';
import { ProductConfigurationService } from './product-configuration-service';
import { ProductQueryDto } from './query/product-query.dto';

@Controller('admin/products')
export class ProductsAdminController {

    constructor(
        private readonly productsService: ProductsService,
        private readonly productConfigurationService:
            ProductConfigurationService,
    ) {}

    @Get()
    async findAll(
        @Query() query: ProductQueryDto,
    ) {
        return this.productsService.findAllAdmin(query);
    }

    @Get(':id')
    async findOne(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<ProductAdminDetailResponseDto> {
        return this.productsService.findOneAdmin(id);
    }

    @Patch(':id/configuration')
    async updateConfiguration(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateProductConfigurationDto,
    ) {
        return this.productConfigurationService.update(
            id,
            dto,
        );
    }
}