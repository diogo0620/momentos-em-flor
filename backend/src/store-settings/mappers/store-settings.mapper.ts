import { StoreSettingsResponseDto } from "../dto/store-settings-response.dto";
import { StoreSettings } from '@prisma/client';


export class StoreSettingsMapper {
    static toResponse(
        storeSettings: StoreSettings,
    ): StoreSettingsResponseDto {
        return {
            id: storeSettings.id,
            deliveryFee: Number(storeSettings.deliveryFee),
            createdAt: storeSettings.createdAt,
            updatedAt: storeSettings.updatedAt,
        };
    }
}