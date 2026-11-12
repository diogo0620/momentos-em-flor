export type StoreSettings = {
    deliveryFee: number;
    deliveryTaxCodeId: number | null;
    deliveryMoloniProductId?: string | number | null;
    deliveryTaxCodeName?: string | null;
    deliveryTaxRate?: number | null;
    deliveryAreaEnabled: boolean;
    deliveryAreaName: string;
    deliveryCenterLatitude?: number;
    deliveryCenterLongitude?: number;
    deliveryRadiusKm: number;
};

export type DeliveryAvailabilityInput = {
    street: string;
    streetNumber: string;
    street2?: string;
    postalCode: string;
    city: string;
    district?: string;
    countryCode: string;
};

export type DeliveryAvailability = {
    available: boolean;
    distanceKm: number | null;
    radiusKm: number;
    areaName: string;
};
