import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { ApiResponse } from '@/common/responses/api-response';

import { UpdateStoreSettingsDto } from './dto/update-store-settings.dto';
import { StoreSettingsMapper } from './mappers/store-settings.mapper';

@Injectable()
export class StoreSettingsService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async get() {
        const storeSettings =
            await this.prisma.storeSettings.upsert({
                where: {
                    id: 1,
                },
                create: {
                    id: 1,
                    deliveryFee: 0,
                },
                update: {},
            });

        return ApiResponse.success(
            StoreSettingsMapper.toResponse(
                storeSettings,
            ),
        );
    }

    async update(
        dto: UpdateStoreSettingsDto,
    ) {
        const storeSettings =
            await this.prisma.storeSettings.upsert({
                where: {
                    id: 1,
                },
                create: {
                    id: 1,
                    deliveryFee: dto.deliveryFee,
                },
                update: {
                    deliveryFee: dto.deliveryFee,
                },
            });

        return ApiResponse.success(
            StoreSettingsMapper.toResponse(
                storeSettings,
            ),
            'Definições atualizadas com sucesso.',
        );
    }
}
