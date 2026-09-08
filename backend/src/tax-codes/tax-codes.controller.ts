import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
} from '@nestjs/common';

import {
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import {
    TaxCodesService,
} from './tax-codes.service';

import {
    CreateTaxCodeDto,
} from './dto/create-tax-code.dto';

import {
    UpdateTaxCodeDto,
} from './dto/update-tax-code.dto';

@ApiTags('Tax Codes')
@Controller('tax-codes')
export class TaxCodesController {

    constructor(
        private readonly taxCodesService:
            TaxCodesService,
    ) {}


    @Get()
    @ApiOperation({
        summary: 'Get tax codes',
    })
    @ApiResponse({
        status: 200,
    })
    findAll() {

        return this.taxCodesService.findAll();
    }


    @Get(':id')
    @ApiOperation({
        summary: 'Get tax code by id',
    })
    @ApiResponse({
        status: 200,
    })
    findOne(
        @Param(
            'id',
            ParseIntPipe,
        )
        id: number,
    ) {

        return this.taxCodesService.findOne(
            id,
        );
    }


    @Post()
    @ApiOperation({
        summary: 'Create tax code',
    })
    @ApiResponse({
        status: 201,
    })
    create(
        @Body()
        dto: CreateTaxCodeDto,
    ) {

        return this.taxCodesService.create(
            dto,
        );
    }


    @Patch(':id')
    @ApiOperation({
        summary: 'Update tax code',
    })
    @ApiResponse({
        status: 200,
    })
    update(
        @Param(
            'id',
            ParseIntPipe,
        )
        id: number,

        @Body()
        dto: UpdateTaxCodeDto,
    ) {

        return this.taxCodesService.update(
            id,
            dto,
        );
    }


    @Delete(':id')
    @ApiOperation({
        summary: 'Delete tax code',
    })
    @ApiResponse({
        status: 200,
    })
    remove(
        @Param(
            'id',
            ParseIntPipe,
        )
        id: number,
    ) {

        return this.taxCodesService.remove(
            id,
        );
    }
}