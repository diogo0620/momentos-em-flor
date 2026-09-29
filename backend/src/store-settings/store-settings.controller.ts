import {
    Body,
    Controller,
    Get,
    Put,
} from '@nestjs/common';

import { UpdateStoreSettingsDto } from './dto/update-store-settings.dto';
import { StoreSettingsService } from './store-settings.service';

@Controller('store-settings')
export class StoreSettingsController {
    constructor(
        private readonly storeSettingsService: StoreSettingsService,
    ) {}

    @Get()
    async get() {
        return this.storeSettingsService.get();
    }

    @Put()
    async update(
        @Body() dto: UpdateStoreSettingsDto,
    ) {
        return this.storeSettingsService.update(dto);
    }
}