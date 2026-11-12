import { BadRequestException, Injectable } from '@nestjs/common';


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
                deliveryAreaEnabled: true,
                deliveryAreaName: 'Santa Maria da Feira e arredores',
                deliveryCenterLatitude: 40.924574,
                deliveryCenterLongitude: -8.543956,
                deliveryRadiusKm: 15,
            },
            update: {},
            include: { deliveryTaxCode: true },
        });

        return ApiResponse.success(
            this.mapper.toDetailResponse(storeSettings),
        );
    }


    async update(
        dto: AdminUpdateStoreSettingsDto,
    ): Promise<void> {
        const taxCode = await this.prisma.taxCode.findFirst({
            where: { id: dto.deliveryTaxCodeId, active: true },
            select: { id: true },
        });

        if (!taxCode) {
            throw new BadRequestException(
                'O código de IVA selecionado para a entrega não existe ou está inativo.',
            );
        }

        await this.prisma.storeSettings.upsert({
            where: {
                id: 1,
            },
            create: {
                id: 1,
                deliveryFee: dto.deliveryFee,
                deliveryTaxCodeId: dto.deliveryTaxCodeId,
                deliveryMoloniProductId: dto.deliveryMoloniProductId
                    ? String(dto.deliveryMoloniProductId)
                    : null,
                deliveryAreaEnabled: dto.deliveryAreaEnabled,
                deliveryAreaName: dto.deliveryAreaName.trim(),
                deliveryCenterLatitude: dto.deliveryCenterLatitude,
                deliveryCenterLongitude: dto.deliveryCenterLongitude,
                deliveryRadiusKm: dto.deliveryRadiusKm,
            },
            update: {
                deliveryFee: dto.deliveryFee,
                deliveryTaxCodeId: dto.deliveryTaxCodeId,
                deliveryMoloniProductId: dto.deliveryMoloniProductId
                    ? String(dto.deliveryMoloniProductId)
                    : null,
                deliveryAreaEnabled: dto.deliveryAreaEnabled,
                deliveryAreaName: dto.deliveryAreaName.trim(),
                deliveryCenterLatitude: dto.deliveryCenterLatitude,
                deliveryCenterLongitude: dto.deliveryCenterLongitude,
                deliveryRadiusKm: dto.deliveryRadiusKm,
            },
        });
    }

}
