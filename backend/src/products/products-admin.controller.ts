import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Query,
} from '@nestjs/common';

import { ProductsService } from './products.service';

import { ProductAdminListResponseDto } from './dto/admin/product-admin-list-response.dto';
import { ProductAdminDetailResponseDto } from './dto/admin/product-admin-detail-response.dto';
import { ProductQueryDto } from './query/product-query.dto';

@Controller('admin/products')
export class ProductsAdminController {

    constructor(
        private readonly productsService: ProductsService,
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
}