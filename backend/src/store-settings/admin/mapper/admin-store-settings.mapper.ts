
import { Injectable } from '@nestjs/common';

import { StoreSettings } from '@prisma/client';

import { AdminStoreSettingsResponseDto } from '../dtos/admin-store-settings-response.dto';

@Injectable()
export class AdminStoreSettingsMapper{
  toDetailResponse(storeSettings: StoreSettings): AdminStoreSettingsResponseDto {
    return {
      id: storeSettings.id,
      deliveryFee: storeSettings.deliveryFee.toNumber(),
      createdAt: storeSettings.createdAt,
      updatedAt: storeSettings.updatedAt,
    };
  }
}
