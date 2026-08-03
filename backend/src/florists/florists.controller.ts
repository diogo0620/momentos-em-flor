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
} from '@nestjs/common';
import {
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { FloristQueryDto } from './query/florist-query.dto';
import { FloristsService } from './florists.service';
import { UpdateFloristDto } from './dto/update-florist.dto';
import { CreateProductDto } from '@/products/dto/create-product.dto';
import { CreateFloristDto } from './dto/create-florist.dto';


@ApiTags('Florists')
@Controller('florists')
export class FloristsController {

    constructor(
        private readonly floristsService: FloristsService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Get florists' })
    @ApiResponse({ status: 200 })
    findAll(
        @Query()
        query: FloristQueryDto,
    ) {
        return this.floristsService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get florist by id' })
    @ApiResponse({ status: 200 })
    findOne(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.floristsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update florist' })
    @ApiResponse({ status: 200 })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateFloristDto,
    ) {
        return this.floristsService.update(id, dto);
    }

    @Post()
    @ApiOperation({ summary: 'Create florist' })
    @ApiResponse({ status: 201 })
    create(
        @Body()
        dto: CreateFloristDto,
    ) {
        return this.floristsService.create(dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete florist' })
    @ApiResponse({ status: 200 })
    remove(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.floristsService.remove(id);
    }

}
