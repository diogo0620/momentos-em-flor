
import {
    Controller,
    Get,
    Param,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';



import { PublicProductQueryDto } from './dtos/public-product-query.dto';
import { PublicProductsService } from './public-products.service';

@ApiTags('Products (Public)')
@Controller('products')
export class PublicProductsController {
    constructor(
        private readonly service: PublicProductsService,
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() query: PublicProductQueryDto) {
        return await this.service.findAll(query);
    }

    @Get(':slug')
    @HttpCode(HttpStatus.OK)
    async findOne(
        @Param('slug') slug: string,
    ) {
        return await this.service.findOne(slug);
    }


}
