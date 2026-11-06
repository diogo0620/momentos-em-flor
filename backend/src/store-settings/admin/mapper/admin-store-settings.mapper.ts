
import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { AdminStoreSettingsResponseDto } from '../dtos/admin-store-settings-response.dto';

@Injectable()
export class AdminStoreSettingsMapper{
  toDetailResponse(storeSettings: Prisma.StoreSettingsGetPayload<{ include: { deliveryTaxCode: true } }>): AdminStoreSettingsResponseDto {
    return {
      id: storeSettings.id,
      deliveryFee: storeSettings.deliveryFee.toNumber(),
      deliveryTaxCodeId: storeSettings.deliveryTaxCodeId,
      deliveryTaxCodeName: storeSettings.deliveryTaxCode?.name ?? null,
      deliveryTaxRate: storeSettings.deliveryTaxCode?.rate.toNumber() ?? null,
      deliveryAreaEnabled: storeSettings.deliveryAreaEnabled,
      deliveryAreaName: storeSettings.deliveryAreaName,
      deliveryCenterLatitude: storeSettings.deliveryCenterLatitude.toNumber(),
      deliveryCenterLongitude: storeSettings.deliveryCenterLongitude.toNumber(),
      deliveryRadiusKm: storeSettings.deliveryRadiusKm.toNumber(),
      createdAt: storeSettings.createdAt,
      updatedAt: storeSettings.updatedAt,
    };
  }
}
