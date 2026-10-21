import { Injectable } from '@nestjs/common';


import { AdminUpdateStoreSettingsDto } from './dtos/admin-update-store-settings.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { AdminStoreSettingsResponseDto } from './dtos/admin-store-settings-response.dto';
import { ApiResponse } from '@/common/responses/api-response';
import { AdminStoreSettingsMapper } from './mapper/admin-store-settings.mapper';


@Injectable()
export class AdminStoreSettingsService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly mapper: AdminStoreSettingsMapper,
    ) { }

    async get(): Promise<AdminStoreSettingsResponseDto> {
        const storeSettings = await this.prisma.storeSettings.upsert({
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
            this.mapper.toDetailResponse(storeSettings),
        );
    }


    async update(
        dto: AdminUpdateStoreSettingsDto,
    ): Promise<void> {
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
    }

}