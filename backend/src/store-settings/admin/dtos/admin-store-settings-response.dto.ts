export class AdminStoreSettingsResponseDto {
    id!: number;
    companyName!: string;
    contactEmail!: string | null;
    contactPhone!: string | null;
    whatsappNumber!: string | null;
    companyAddress!: string | null;
    partnerEmail!: string | null;
    deliveryFee!: number;
    deliveryTaxCodeId!: number | null;
    deliveryMoloniProductId!: string | null;
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
