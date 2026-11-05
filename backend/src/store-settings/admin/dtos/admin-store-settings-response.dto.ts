export class AdminStoreSettingsResponseDto {
    id!: number;
    deliveryFee!: number;
    deliveryTaxCodeId!: number | null;
    deliveryTaxCodeName!: string | null;
    deliveryTaxRate!: number | null;
    deliveryAreaEnabled!: boolean;
    deliveryAreaName!: string;
    deliveryCenterLatitude!: number;
    deliveryCenterLongitude!: number;
    deliveryRadiusKm!: number;
    createdAt!: Date;
    updatedAt!: Date;
}
