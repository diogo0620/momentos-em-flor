
import {
    Controller,
    Get,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {ApiTags } from '@nestjs/swagger';


import { PublicCategoriesService } from './public-categories.service';
import { PublicCategoryQueryDto } from './dtos/public-category-query.dto';

@ApiTags('Categories (Public)')
@Controller('categories')
export class PublicCategoriesController {
    constructor(
        private readonly service: PublicCategoriesService,
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() query: PublicCategoryQueryDto) { 
        return await this.service.findAll(query);
    }

}
